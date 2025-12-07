import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { aggregateQuizEffects, categoryToAttributesMap } from "@/lib/quiz/config"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { answers } = body

    if (!answers || !Array.isArray(answers)) {
      return NextResponse.json(
        { error: 'Invalid request: answers array required' },
        { status: 400 }
      )
    }

    // Aggregate effects from answers
    const { desiredTags, desiredCategoryNames, desiredPlatforms, requiredFilters, weightBoosts } = aggregateQuizEffects(answers)

    // Build where clause for published products
    const where: any = {
      status: 'PUBLISHED'
    }

    // Apply required filters (monetization, pricing)
    // Handle monetization filter - can be array (for "free" option) or single value
    if (requiredFilters.monetization) {
      if (Array.isArray(requiredFilters.monetization)) {
        // For "free" option: match FREE, FREEMIUM, or ADS_SUPPORTED
        where.monetization = {
          in: requiredFilters.monetization
        }
      } else {
        where.monetization = requiredFilters.monetization
      }
    }
    if (requiredFilters.pricing) {
      where.pricing = requiredFilters.pricing
    }

    // Fetch all candidate products with their tags, categories, and related data
    const products = await prisma.product.findMany({
      where,
      select: {
        id: true,
        slug: true,
        title: true,
        tagline: true,
        description: true,
        thumbnail: true,
        image: true,
        url: true,
        monetization: true,
        pricing: true,
        engine: true,
        gamificationTags: true,
        platforms: true,
        categories: {
          include: {
            category: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
        tags: {
          include: {
            tag: {
              select: {
                id: true,
                slug: true,
                name: true
              }
            }
          }
        },
        _count: {
          select: {
            votes: true,
            comments: true
          }
        }
      }
    })

    // Calculate scores for each product
    const productsWithScores = products.map(product => {
      let score = 0
      const matchedTags: string[] = []
      const matchedCategories: string[] = []
      const reasons: string[] = []

      // Get product data
      const productCategoryNames = product.categories.map(pc => pc.category.name)
      const productTagSlugs = product.tags.map(pt => pt.tag.slug.toLowerCase())
      const productTagNames = product.tags.map(pt => pt.tag.name)
      const productGamificationTags = (product.gamificationTags || []).map((tag: string) => tag.toLowerCase())
      const productPlatforms = (product.platforms || []).map((p: string) => p.toLowerCase())

      // 1. PLATFORM MATCHING (Important - 4 points per match)
      // This uses the platforms array from submit form
      if (desiredPlatforms.length > 0) {
        let platformMatchCount = 0
        desiredPlatforms.forEach(desiredPlatform => {
          const normalizedDesired = desiredPlatform.toLowerCase()
          const hasPlatform = productPlatforms.some(p => p === normalizedDesired)
          if (hasPlatform) {
            score += 4.0  // Platform is important for mobile games
            platformMatchCount++
          }
        })
        // Bonus if all desired platforms are matched
        if (platformMatchCount === desiredPlatforms.length && desiredPlatforms.length > 1) {
          score += 1.0  // Extra bonus for complete platform match
        }
      }

      // 2. CATEGORY MATCHING (Highest priority - 5 points per match)
      // This uses the categories field from submit form (ProductCategory[])
      if (desiredCategoryNames.length > 0) {
        desiredCategoryNames.forEach(desiredCategory => {
          if (productCategoryNames.includes(desiredCategory)) {
            score += 5.0  // Category is the most important match
            matchedCategories.push(desiredCategory)
          }
        })
      }

      // 3. GAMIFICATION TAGS MATCHING (2.5 points per match)
      // This uses the gamificationTags array from submit form
      desiredTags.forEach(desiredTag => {
        const normalizedDesiredTag = desiredTag.toLowerCase()
        if (productGamificationTags.includes(normalizedDesiredTag)) {
          score += 2.5  // Increased from 1.5 - gamificationTags are important
          if (!matchedTags.includes(desiredTag)) {
            matchedTags.push(desiredTag)
          }
        }
      })

      // 4. TAG MATCHING (1.5 points per match)
      // This uses the tags system (ProductTag[]) - secondary priority
      desiredTags.forEach(desiredTag => {
        const normalizedDesiredTag = desiredTag.toLowerCase()
        // Check for exact match or partial match
        const matchingTag = productTagSlugs.find(tagSlug => 
          tagSlug === normalizedDesiredTag || 
          tagSlug.includes(normalizedDesiredTag) || 
          normalizedDesiredTag.includes(tagSlug)
        )
        if (matchingTag) {
          score += 1.5  // Lower priority than gamificationTags
          const tagName = productTagNames.find((_, idx) => productTagSlugs[idx] === matchingTag)
          if (tagName && !matchedTags.includes(tagName)) {
            matchedTags.push(tagName)
          }
        }
      })

      // 5. CATEGORY-BASED ATTRIBUTE MATCHING (Minimal - session duration is just informational)
      // Session duration is optional/informational only - minimal impact on scoring
      const sessionAnswer = answers.find(a => a.questionId === 'session-duration')
      
      if (sessionAnswer) {
        productCategoryNames.forEach(categoryName => {
          const categoryAttrs = categoryToAttributesMap[categoryName]
          if (categoryAttrs) {
            // Very minimal bonus for session length match (0.1 points only)
            const userSessionPreference = sessionAnswer.optionId
            if (userSessionPreference === categoryAttrs.sessionLength) {
              score += 0.1
            }
          }
        })
      }

      // 6. MONETIZATION MATCHING (Bonus 2 points)
      // This uses the monetization field from submit form
      const monetizationAnswer = answers.find(a => a.questionId === 'monetization')
      
      if (requiredFilters.monetization) {
        // Check if product's monetization matches any in the filter array (for "free" option)
        if (Array.isArray(requiredFilters.monetization)) {
          if (product.monetization && requiredFilters.monetization.includes(product.monetization)) {
            score += 2.0  // Strong match for free-related monetization
          }
        } else if (product.monetization === requiredFilters.monetization) {
          score += 2.0  // Exact match for paid/subscription
        }
      } else if (monetizationAnswer) {
        // Fallback: check monetization preference even if not in requiredFilters
        const pref = monetizationAnswer.optionId
        if (pref === 'free' && product.monetization && ['FREE', 'FREEMIUM', 'ADS_SUPPORTED'].includes(product.monetization)) {
          score += 1.5  // Bonus for free-related games
        } else if (pref === 'premium' && (product.monetization === 'PAID' || product.pricing === 'PAID')) {
          score += 1.0
        } else if (pref === 'subscription' && product.monetization === 'SUBSCRIPTION') {
          score += 1.0
        }
      }

      // 7. POPULARITY BONUS (normalized by max likes)
      const maxLikes = Math.max(...products.map(p => p._count.votes), 1)
      const likesBonus = (product._count.votes / maxLikes) * 0.5
      score += likesBonus

      // 8. Apply weight boosts from quiz answers
      const avgWeightBoost = weightBoosts.length > 0
        ? weightBoosts.reduce((a, b) => a + b, 0) / weightBoosts.length
        : 1.0
      score *= avgWeightBoost

      // Build reasons for why this game was recommended
      if (matchedCategories.length > 0) {
        reasons.push(matchedCategories.slice(0, 2).join(', '))
      }

      // Add platform info to reasons if matched
      if (desiredPlatforms.length > 0) {
        const matchedPlatforms = desiredPlatforms.filter(dp => 
          productPlatforms.includes(dp.toLowerCase())
        )
        if (matchedPlatforms.length > 0) {
          const platformLabels: Record<string, string> = {
            'ios': 'iOS',
            'android': 'Android',
            'web': 'Web',
            'windows': 'Windows',
            'mac': 'macOS'
          }
          const labels = matchedPlatforms.map(p => platformLabels[p.toLowerCase()] || p).join(', ')
          reasons.push(`${labels} compatible`)
        }
      }

      if (matchedTags.length > 0) {
        const tagsToShow = matchedTags.slice(0, 2).join(', ')
        if (!reasons.includes(tagsToShow)) {
          reasons.push(tagsToShow)
        }
      }

      // Add monetization info
      if (product.monetization === 'FREE') {
        reasons.push('free-to-play')
      } else if (product.monetization === 'PAID') {
        reasons.push('premium')
      } else if (product.monetization === 'FREEMIUM') {
        reasons.push('freemium')
      } else if (product.monetization === 'ADS_SUPPORTED') {
        reasons.push('ad-supported')
      } else if (product.monetization === 'SUBSCRIPTION') {
        reasons.push('subscription')
      }

      // Add session duration hint based on category
      const primaryCategory = productCategoryNames[0]
      if (primaryCategory) {
        const attrs = categoryToAttributesMap[primaryCategory]
        if (attrs) {
          if (attrs.sessionLength === 'quick') {
            reasons.push('short sessions')
          } else if (attrs.sessionLength === 'long') {
            reasons.push('longer play sessions')
          }
        }
      }


      return {
        id: product.id,
        slug: product.slug,
        title: product.title,
        tagline: product.tagline,
        shortPitch: product.tagline || (product.description ? product.description.substring(0, 150) : ''),
        thumbnail: product.thumbnail || product.image,
        url: product.url,
        score,
        matchedTags,
        matchedCategories,
          reasons: reasons.length > 0 ? reasons : ['Mobile game recommendation'],
        metrics: {
          likes: product._count.votes
        }
      }
    })

    // Sort by score descending
    productsWithScores.sort((a, b) => b.score - a.score)

    // Filter out games with very low scores (less than 1 point)
    const filteredProducts = productsWithScores.filter(product => product.score >= 1.0)

    // Return top 5 games
    const topGames = filteredProducts.slice(0, 5)

    // If no matches found, return top games by likes as fallback
    if (topGames.length === 0) {
      const fallbackGames = products
        .sort((a, b) => b._count.votes - a._count.votes)
        .slice(0, 5)
        .map(product => ({
          id: product.id,
          slug: product.slug,
          title: product.title,
          tagline: product.tagline,
          shortPitch: product.tagline || (product.description ? product.description.substring(0, 150) : ''),
          thumbnail: product.thumbnail || product.image,
          url: product.url,
          score: 1,
          matchedTags: [],
          matchedCategories: [],
          reasons: ['Popular game on MobileGameHunt'],
          metrics: {
            likes: product._count.votes
          }
        }))

      return NextResponse.json({ results: fallbackGames })
    }

    return NextResponse.json({ results: topGames })
  } catch (error) {
    console.error('Error generating quiz recommendations:', error)
    return NextResponse.json(
      { error: 'Failed to generate recommendations' },
      { status: 500 }
    )
  }
}
