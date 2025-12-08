/**
 * Shared Quest Recommendations Logic
 * Used by both /api/quest/recommendations and /api/quiz/recommendations (legacy)
 */

import { prisma } from "@/lib/prisma"
import { aggregateQuizEffects, categoryToAttributesMap } from "@/lib/quiz/config"
import { QuestGameResult } from "@/lib/quest/types"
import { searchExternalGames, buildSearchQueryFromPreferences } from "@/lib/externalStores/search"

const TARGET_RESULTS = 8 // Total games to show
const MAX_INTERNAL = 4 // Max internal games
const MAX_EXTERNAL = 4 // Max external games

// Convert internal product to QuestGameResult
function convertInternalProductToQuestResult(
  product: any,
  score: number,
  matchedTags: string[],
  matchedCategories: string[],
  reasons: string[],
  maxLikes: number
): QuestGameResult {
  const productCategoryNames = product.categories.map((pc: any) => pc.category.name)
  
  return {
    id: product.id,
    slug: product.slug,
    source: 'internal',
    verified: true,
    store: null,
    title: product.title,
    shortPitch: product.tagline || (product.description ? product.description.substring(0, 150) : ''),
    thumbnailUrl: product.thumbnail || product.image || '',
    categories: productCategoryNames,
    matchRank: 0, // will be set later
    score,
    metrics: {
      likes: product._count.votes,
    },
    links: {
      internalProductUrl: `/product/${product.slug}`,
    },
    reasons: reasons.length > 0 ? reasons : ['Mobile game recommendation'],
  }
}

export async function generateQuestRecommendations(
  answers: Array<{ questionId: string; optionId: string }>
): Promise<QuestGameResult[]> {
  // Aggregate effects from answers
  const { desiredTags, desiredCategoryNames, desiredPlatforms, requiredFilters, weightBoosts } = aggregateQuizEffects(answers)

  // Build where clause for published products
  const where: any = {
    status: 'PUBLISHED'
  }

  // Apply required filters (monetization, pricing)
  if (requiredFilters.monetization) {
    if (Array.isArray(requiredFilters.monetization)) {
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

  // Fetch all candidate products
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

  // Calculate scores for internal products
  const internalResults: QuestGameResult[] = products.map(product => {
    let score = 0
    const matchedTags: string[] = []
    const matchedCategories: string[] = []
    const reasons: string[] = []

    const productCategoryNames = product.categories.map(pc => pc.category.name)
    const productTagSlugs = product.tags.map(pt => pt.tag.slug.toLowerCase())
    const productTagNames = product.tags.map(pt => pt.tag.name)
    const productGamificationTags = (product.gamificationTags || []).map((tag: string) => tag.toLowerCase())
    const productPlatforms = (product.platforms || []).map((p: string) => p.toLowerCase())

    // Platform matching
    if (desiredPlatforms.length > 0) {
      let platformMatchCount = 0
      desiredPlatforms.forEach(desiredPlatform => {
        const normalizedDesired = desiredPlatform.toLowerCase()
        const hasPlatform = productPlatforms.some(p => p === normalizedDesired)
        if (hasPlatform) {
          score += 4.0
          platformMatchCount++
        }
      })
      if (platformMatchCount === desiredPlatforms.length && desiredPlatforms.length > 1) {
        score += 1.0
      }
    }

    // Category matching
    if (desiredCategoryNames.length > 0) {
      desiredCategoryNames.forEach(desiredCategory => {
        if (productCategoryNames.includes(desiredCategory)) {
          score += 5.0
          matchedCategories.push(desiredCategory)
        }
      })
    }

    // Gamification tags matching
    desiredTags.forEach(desiredTag => {
      const normalizedDesiredTag = desiredTag.toLowerCase()
      if (productGamificationTags.includes(normalizedDesiredTag)) {
        score += 2.5
        if (!matchedTags.includes(desiredTag)) {
          matchedTags.push(desiredTag)
        }
      }
    })

    // Tag matching
    desiredTags.forEach(desiredTag => {
      const normalizedDesiredTag = desiredTag.toLowerCase()
      const matchingTag = productTagSlugs.find(tagSlug => 
        tagSlug === normalizedDesiredTag || 
        tagSlug.includes(normalizedDesiredTag) || 
        normalizedDesiredTag.includes(tagSlug)
      )
      if (matchingTag) {
        score += 1.5
        const tagName = productTagNames.find((_, idx) => productTagSlugs[idx] === matchingTag)
        if (tagName && !matchedTags.includes(tagName)) {
          matchedTags.push(tagName)
        }
      }
    })

    // Session duration (minimal impact)
    const sessionAnswer = answers.find(a => a.questionId === 'session-duration')
    if (sessionAnswer) {
      productCategoryNames.forEach(categoryName => {
        const categoryAttrs = categoryToAttributesMap[categoryName]
        if (categoryAttrs && sessionAnswer.optionId === categoryAttrs.sessionLength) {
          score += 0.1
        }
      })
    }

    // Monetization matching
    const monetizationAnswer = answers.find(a => a.questionId === 'monetization')
    if (requiredFilters.monetization) {
      if (Array.isArray(requiredFilters.monetization)) {
        if (product.monetization && requiredFilters.monetization.includes(product.monetization)) {
          score += 2.0
        }
      } else if (product.monetization === requiredFilters.monetization) {
        score += 2.0
      }
    } else if (monetizationAnswer) {
      const pref = monetizationAnswer.optionId
      if (pref === 'free' && product.monetization && ['FREE', 'FREEMIUM', 'ADS_SUPPORTED'].includes(product.monetization)) {
        score += 1.5
      } else if (pref === 'premium' && (product.monetization === 'PAID' || product.pricing === 'PAID')) {
        score += 1.0
      } else if (pref === 'subscription' && product.monetization === 'SUBSCRIPTION') {
        score += 1.0
      }
    }

    // Popularity bonus
    const maxLikes = Math.max(...products.map(p => p._count.votes), 1)
    const likesBonus = (product._count.votes / maxLikes) * 0.5
    score += likesBonus

    // Apply weight boosts
    const avgWeightBoost = weightBoosts.length > 0
      ? weightBoosts.reduce((a, b) => a + b, 0) / weightBoosts.length
      : 1.0
    score *= avgWeightBoost

    // Build reasons
    if (matchedCategories.length > 0) {
      reasons.push(matchedCategories.slice(0, 2).join(', '))
    }

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

    const maxLikesForBonus = Math.max(...products.map(p => p._count.votes), 1)
    return convertInternalProductToQuestResult(
      product,
      score,
      matchedTags,
      matchedCategories,
      reasons.length > 0 ? reasons : ['Mobile game recommendation'],
      maxLikesForBonus
    )
  })

  // Sort internal results by score descending
  internalResults.sort((a, b) => b.score - a.score)

  // Filter out very low scores
  const filteredInternal = internalResults.filter(game => game.score >= 1.0)

  // Log internal results count
  console.log(`[QUEST] Internal results: ${filteredInternal.length} (max: ${MAX_INTERNAL})`)
  
  // Limit internal results to MAX_INTERNAL
  const limitedInternal = filteredInternal.slice(0, MAX_INTERNAL)
  
  // Always try to get external games (up to MAX_EXTERNAL)
  let externalResults: QuestGameResult[] = []
  
  try {
    const searchQuery = buildSearchQueryFromPreferences(answers)
    const neededCount = Math.min(MAX_EXTERNAL, TARGET_RESULTS - limitedInternal.length)
    
    console.log(`[QUEST] Fetching ${neededCount} external games, searching with query: "${searchQuery}"`)
    
    externalResults = await searchExternalGames({
      query: searchQuery,
      limit: neededCount,
    })
    
    console.log(`[QUEST] External search returned ${externalResults.length} results`)
  } catch (error) {
    console.error('[QUEST] External search failed, continuing with internal only:', error)
    // Continue with internal results only if external search fails
  }

  // Combine results: internal first, then external
  const combined: QuestGameResult[] = [
    ...limitedInternal,
    ...externalResults,
  ]

  // Sort: internal first (by score), then external (by score)
  const finalResults = combined
    .sort((a, b) => {
      // Internal games always come first
      if (a.source !== b.source) {
        return a.source === 'internal' ? -1 : 1
      }
      // Within same source, sort by score descending
      return b.score - a.score
    })
    .slice(0, TARGET_RESULTS) // Max 8 total
    .map((game, index) => ({ ...game, matchRank: index + 1 }))
  
  console.log(`[QUEST] Final results: ${finalResults.filter(g => g.source === 'internal').length} internal, ${finalResults.filter(g => g.source === 'external').length} external, total: ${finalResults.length}`)

  // Fallback: if no internal results and no external results, return top games by likes
  if (finalResults.length === 0) {
    const fallbackGames = products
      .sort((a, b) => b._count.votes - a._count.votes)
      .slice(0, MAX_INTERNAL) // Max 4 in fallback too
      .map((product, index) => {
        const maxLikesForFallback = Math.max(...products.map(p => p._count.votes), 1)
        return convertInternalProductToQuestResult(
          product,
          1,
          [],
          [],
          ['Popular game on MobileGameHunt'],
          maxLikesForFallback
        )
      })
      .map((game, index) => ({ ...game, matchRank: index + 1 }))

    return fallbackGames
  }

  return finalResults
}

