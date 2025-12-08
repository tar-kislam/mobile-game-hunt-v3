/**
 * Shared Quest Recommendations Logic
 * Used by both /api/quest/recommendations and /api/quiz/recommendations (legacy)
 * 
 * FIXED: Strict platform filtering, separate internal/external ranking, balanced external selection
 */

import { prisma } from "@/lib/prisma"
import { QuestGameResult } from "@/lib/quest/types"
import { searchExternalGames, buildSearchQueryFromPreferences } from "@/lib/externalStores/search"
import { QUEST_CONFIG, PLATFORM_LABELS, QuestMatchReason, buildUserQuestProfile, UserQuestProfile } from "./config"
import { scoreGameForQuest, GameWithTagsGenresPlatformsAndMeta } from "./scoring"
import { extractPlatformAnswer, filterByPlatform, PlatformAnswer, getAllowedPlatforms, buildBalancedExternalForMobile } from "./platform-filter"

const TOTAL_LIMIT = 8 // Total games to show
const INTERNAL_LIMIT = 4 // Preferred max internal games

// Convert internal product to QuestGameResult
function convertInternalProductToQuestResult(
  product: any,
  score: number,
  matchReason: QuestMatchReason,
  maxLikes: number
): QuestGameResult {
  const productCategoryNames = product.categories.map((pc: any) => pc.category.name)
  
  // Build detailed reasons array from matchReason
  const reasons: string[] = []
  
  // Platform match (critical)
  if (matchReason.platforms.length > 0) {
    const platformLabels = matchReason.platforms.map(p => PLATFORM_LABELS[p.toLowerCase()] || p).join(', ')
    reasons.push(`${platformLabels} compatible`)
  }
  
  // Genre matches
  if (matchReason.genresMatched.length > 0) {
    reasons.push(matchReason.genresMatched.slice(0, 2).join(' / '))
  }
  
  // Tag matches
  if (matchReason.tagsMatched.length > 0) {
    const tagsToShow = matchReason.tagsMatched.slice(0, 3).join(', ')
    if (!reasons.includes(tagsToShow)) {
      reasons.push(tagsToShow)
    }
  }
  
  // Session match
  if (matchReason.sessionMatch && matchReason.sessionMatch !== 'none') {
    const sessionLabels: Record<string, string> = {
      'short': '5-10 min sessions',
      'medium': '10-20 min sessions',
      'long': '30+ min sessions',
    }
    reasons.push(sessionLabels[matchReason.sessionMatch] || matchReason.sessionMatch)
  }
  
  // Favorite game similarity
  if (matchReason.favoriteSimilarity) {
    reasons.push('Similar to your favorites')
  }
  
  // Monetization match
  if (matchReason.monetizationMatch) {
    const monetizationLabels: Record<string, string> = {
      'FREE': 'free-to-play',
      'PAID': 'premium',
      'FREEMIUM': 'freemium',
      'ADS_SUPPORTED': 'ad-supported',
      'SUBSCRIPTION': 'subscription',
    }
    reasons.push(monetizationLabels[matchReason.monetizationMatch] || matchReason.monetizationMatch.toLowerCase())
  }
  
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
    platforms: product.platforms || [], // Include platforms for filtering
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
  // Extract platform answer
  const platformAnswer = extractPlatformAnswer(answers)
  const allowedPlatforms = getAllowedPlatforms(platformAnswer)
  
  console.log('[QUEST] Platform answer:', platformAnswer, 'Allowed platforms:', allowedPlatforms)

  // Build normalized user profile from answers
  const profile = buildUserQuestProfile(answers)

  console.log('[QUEST] User profile:', {
    platforms: profile.platforms,
    preferredGenres: profile.preferredGenres.slice(0, 5),
    preferredTags: profile.preferredTags.slice(0, 5),
    sessionPreference: profile.sessionPreference,
    favoriteGameTags: profile.favoriteGameTags,
  })

  // Build where clause for published products
  const where: any = {
    status: 'PUBLISHED'
  }

  // CRITICAL: Hard platform filter at query level
  // Use allowedPlatforms from platform answer (not profile.platforms which might be different)
  if (platformAnswer !== 'ANY' && allowedPlatforms.length > 0) {
    where.platforms = {
      hasSome: allowedPlatforms.map(p => p.toLowerCase())
    }
    console.log(`[QUEST] Hard platform filter applied at DB level: ${allowedPlatforms.join(', ')}`)
  }

  // Apply monetization filter if required
  if (profile.requiredMonetization && profile.requiredMonetization.length > 0) {
    if (profile.requiredMonetization.length === 1) {
      where.monetization = profile.requiredMonetization[0]
    } else {
      where.monetization = {
        in: profile.requiredMonetization
      }
    }
  }

  // CRITICAL: Add genre/category filter at DB level if we have preferred genres
  // BUT: Make it more flexible - if no results, we'll fall back to broader search
  // This ensures we only fetch games that match the user's genre preference
  if (profile.preferredGenres.length > 0) {
    where.categories = {
      some: {
        category: {
          name: {
            in: profile.preferredGenres
          }
        }
      }
    }
    console.log(`[QUEST] Genre filter applied at DB level: ${profile.preferredGenres.slice(0, 5).join(', ')}`)
  }

  // Fetch candidate products (already filtered by platform, monetization, and genre)
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

  console.log(`[QUEST] Found ${products.length} candidate games from DB`)
  
  // CRITICAL: If we have very few internal games with genre filter, try without genre filter
  // This applies to ALL genres: Action, RPG, Strategy/Puzzle, Casual, Sports, Card/Roguelike
  // This ensures we always have internal games to show if they exist, regardless of selected genre
  let productsToUse = products
  if (products.length < 4 && profile.preferredGenres.length > 0) {
    console.warn(`[QUEST] Only ${products.length} internal games found with genre filter (${profile.preferredGenres.slice(0, 3).join(', ')}), trying broader search...`)
    
    // Build broader where clause (without genre filter)
    const broaderWhere: any = {
      status: 'PUBLISHED'
    }
    
    // Keep platform filter
    if (platformAnswer !== 'ANY' && allowedPlatforms.length > 0) {
      broaderWhere.platforms = {
        hasSome: allowedPlatforms.map(p => p.toLowerCase())
      }
    }
    
    // Keep monetization filter
    if (profile.requiredMonetization && profile.requiredMonetization.length > 0) {
      if (profile.requiredMonetization.length === 1) {
        broaderWhere.monetization = profile.requiredMonetization[0]
      } else {
        broaderWhere.monetization = {
          in: profile.requiredMonetization
        }
      }
    }
    
    // Fetch broader set
    const broaderProducts = await prisma.product.findMany({
      where: broaderWhere,
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
    
    console.log(`[QUEST] Broader search found ${broaderProducts.length} games (without genre filter)`)
    productsToUse = broaderProducts
  }
  
  // Log genre distribution for debugging
  if (profile.preferredGenres.length > 0) {
    const genreCounts = new Map<string, number>()
    productsToUse.forEach(p => {
      p.categories.forEach(pc => {
        const catName = pc.category.name
        if (profile.preferredGenres.includes(catName)) {
          genreCounts.set(catName, (genreCounts.get(catName) || 0) + 1)
        }
      })
    })
    console.log(`[QUEST] Genre distribution in candidates:`, Object.fromEntries(genreCounts))
  }

  // Calculate max likes for normalization
  const maxLikes = Math.max(...productsToUse.map(p => p._count.votes), 1)

  // Score all games using centralized scoring function
  const scoredProducts = productsToUse.map(product => {
    // Convert product to GameWithTagsGenresPlatformsAndMeta format
    const gameData: GameWithTagsGenresPlatformsAndMeta = {
      id: product.id,
      platforms: product.platforms || [],
      categories: product.categories.map(pc => ({ name: pc.category.name })),
      tags: product.tags.map(pt => ({ slug: pt.tag.slug, name: pt.tag.name })),
      gamificationTags: product.gamificationTags || [],
      monetization: product.monetization || undefined,
      pricing: product.pricing || undefined,
      _count: {
        votes: product._count.votes,
        comments: product._count.comments,
      },
    }

    // Score the game
    const { score, matchReason } = scoreGameForQuest(profile, gameData, maxLikes)

    return {
      product,
      gameData,
      score,
      matchReason,
    }
  })

  // Sort by score descending
  scoredProducts.sort((a, b) => b.score - a.score)

  // CRITICAL: For internal games, be VERY lenient with score threshold
  // This applies to ALL genres: Action, RPG, Strategy, Puzzle, Casual, Sports, Card, etc.
  // Internal games should ALWAYS appear if they match genre, even with low scores
  // Priority: Internal games with genre match > Internal games without genre match > External games
  const internalScoreThreshold = 0.5 // Very lenient - we want to show internal games for ALL genres
  
  // Separate games by genre match (works for ALL genres in QUEST_CONFIG)
  // This logic is genre-agnostic and works for: Action, RPG, Strategy/Puzzle, Casual, Sports, Card/Roguelike
  let withGenreMatch: typeof scoredProducts = []
  let withoutGenreMatch: typeof scoredProducts = []
  
  if (profile.preferredGenres.length > 0) {
    // Filter internal games that match ANY of the user's preferred genres
    // Works for all genre mappings: genre-action, genre-rpg, genre-strategy, genre-casual, genre-sports, genre-card
    withGenreMatch = scoredProducts.filter(item => {
      const gameGenres = item.gameData.categories.map(c => c.name.toLowerCase().trim())
      const preferredGenres = profile.preferredGenres.map(g => g.toLowerCase().trim())
      const hasMatch = preferredGenres.some(prefGenre => 
        gameGenres.some(gameGenre => gameGenre === prefGenre)
      )
      return hasMatch && item.score >= internalScoreThreshold
    })
    
    // Internal games without genre match (still show them, but lower priority)
    withoutGenreMatch = scoredProducts.filter(item => {
      const gameGenres = item.gameData.categories.map(c => c.name.toLowerCase().trim())
      const preferredGenres = profile.preferredGenres.map(g => g.toLowerCase().trim())
      const hasMatch = preferredGenres.some(prefGenre => 
        gameGenres.some(gameGenre => gameGenre === prefGenre)
      )
      return !hasMatch && item.score >= internalScoreThreshold
    })
  } else {
    // No genre preference - just filter by threshold
    withoutGenreMatch = scoredProducts.filter(item => item.score >= internalScoreThreshold)
  }
  
  // Prioritize games with genre match (applies to ALL genres)
  const filteredScored = [...withGenreMatch, ...withoutGenreMatch]

  console.log(`[QUEST] Internal games after scoring: ${filteredScored.length} (with genre match: ${withGenreMatch.length}, without: ${withoutGenreMatch.length}, threshold: ${internalScoreThreshold.toFixed(2)})`)

  // Convert to QuestGameResult format
  const internalCandidates: QuestGameResult[] = filteredScored.map(({ product, score, matchReason }) => {
    return convertInternalProductToQuestResult(
      product,
      score,
      matchReason,
      maxLikes
    )
  })

  // CRITICAL: Apply platform filter to internal games (defensive check)
  const filteredInternal = filterByPlatform(internalCandidates, platformAnswer)
  
  console.log(`[QUEST] Internal games after platform filter: ${filteredInternal.length} (from ${internalCandidates.length})`)

  // CRITICAL: Sort internal games by score and limit to INTERNAL_LIMIT
  // Internal games MUST appear first, regardless of external game scores
  const sortedInternal = filteredInternal
    .sort((a, b) => {
      // Primary sort: score descending
      if (Math.abs(b.score - a.score) > 0.1) {
        return b.score - a.score
      }
      // Secondary sort: likes (popularity) for tie-breaking
      return (b.metrics?.likes || 0) - (a.metrics?.likes || 0)
    })
    .slice(0, INTERNAL_LIMIT)

  console.log(`[QUEST] Internal results: ${sortedInternal.length} (max: ${INTERNAL_LIMIT})`)
  if (sortedInternal.length > 0) {
    console.log(`[QUEST] Top internal game: "${sortedInternal[0].title}" (score: ${sortedInternal[0].score.toFixed(2)})`)
  }

  // Calculate remaining slots for external games
  // CRITICAL: If we have fewer than INTERNAL_LIMIT internal games, we can fill more external slots
  // But total should never exceed TOTAL_LIMIT
  const remainingSlots = Math.max(0, TOTAL_LIMIT - sortedInternal.length)
  console.log(`[QUEST] Remaining slots for external games: ${remainingSlots} (internal: ${sortedInternal.length}/${INTERNAL_LIMIT}, total limit: ${TOTAL_LIMIT})`)
  
  // If we have very few internal games (0-2), we can show more external games
  // This ensures users always get 8 recommendations when possible
  const effectiveExternalLimit = sortedInternal.length < 2 
    ? Math.min(remainingSlots + (INTERNAL_LIMIT - sortedInternal.length), TOTAL_LIMIT - sortedInternal.length)
    : remainingSlots

  // Fetch external games
  let externalCandidates: QuestGameResult[] = []
  
  try {
    const searchQuery = buildSearchQueryFromPreferences(answers)
    // Fetch more external games to account for filtering and balancing
    const fetchLimit = platformAnswer === 'MOBILE_BOTH' ? remainingSlots * 3 : remainingSlots * 2
    
    console.log(`[QUEST] Fetching external games, searching with query: "${searchQuery}"`)
    console.log(`[QUEST] Platform filter for external: ${platformAnswer}, fetch limit: ${fetchLimit}`)
    
    // Pass allowed platforms to external search
    externalCandidates = await searchExternalGames({
      query: searchQuery,
      limit: fetchLimit,
      platforms: allowedPlatforms,
    })
    
    // Platforms are already set in normalizeExternalResult, but ensure they're present
    externalCandidates = externalCandidates.map(game => ({
      ...game,
      platforms: game.platforms || (game.store === 'apple_app_store' ? ['ios'] : game.store === 'google_play_store' ? ['android'] : []),
    }))
    
    console.log(`[QUEST] External search returned ${externalCandidates.length} results`)
  } catch (error) {
    console.error('[QUEST] External search failed, continuing with internal only:', error)
  }

  // CRITICAL: Apply platform filter to external games
  const filteredExternal = filterByPlatform(externalCandidates, platformAnswer)
  
  console.log(`[QUEST] External games after platform filter: ${filteredExternal.length} (from ${externalCandidates.length})`)

  // Select external games based on platform answer
  let sortedExternal: QuestGameResult[] = []
  
  if (effectiveExternalLimit > 0 && filteredExternal.length > 0) {
    if (platformAnswer === 'MOBILE_BOTH') {
      // Use balanced selection for MOBILE_BOTH to ensure iOS/Android mix
      sortedExternal = buildBalancedExternalForMobile(filteredExternal, effectiveExternalLimit)
      console.log(`[QUEST] Balanced external selection: ${sortedExternal.length} games (iOS/Android mix, limit: ${effectiveExternalLimit})`)
    } else {
      // For other platform answers, simple sort + slice
      sortedExternal = filteredExternal
        .sort((a, b) => b.score - a.score)
        .slice(0, effectiveExternalLimit)
      console.log(`[QUEST] External results: ${sortedExternal.length} (max: ${effectiveExternalLimit})`)
    }
  } else if (effectiveExternalLimit > 0 && filteredExternal.length === 0) {
    console.warn(`[QUEST] No external games available to fill ${effectiveExternalLimit} remaining slots`)
  }

  // CRITICAL: Combine with strict ordering - internal first, then external
  // This ensures internal games ALWAYS appear before external games
  const finalMatches: QuestGameResult[] = [
    ...sortedInternal,
    ...sortedExternal,
  ]

  // Assign match ranks (1, 2, 3...)
  // Rank 1-4 should be internal (if available), then external
  const finalResults = finalMatches.map((game, index) => ({
    ...game,
    matchRank: index + 1,
  }))
  
  console.log(`[QUEST] Final results: ${finalResults.filter(g => g.source === 'internal').length} internal, ${finalResults.filter(g => g.source === 'external').length} external, total: ${finalResults.length}`)
  
  // CRITICAL: Validate internal games appear first
  const internalCount = finalResults.filter(g => g.source === 'internal').length
  const externalCount = finalResults.filter(g => g.source === 'external').length
  if (internalCount > 0 && externalCount > 0) {
    const firstExternalIndex = finalResults.findIndex(g => g.source === 'external')
    const lastInternalIndex = finalResults.map((g, i) => g.source === 'internal' ? i : -1).filter(i => i >= 0).pop() ?? -1
    if (firstExternalIndex <= lastInternalIndex) {
      console.error(`[QUEST] ORDERING VIOLATION: External game at index ${firstExternalIndex}, last internal at ${lastInternalIndex}`)
    } else {
      console.log(`[QUEST] ✅ Ordering correct: ${internalCount} internal (ranks 1-${internalCount}), then ${externalCount} external (ranks ${firstExternalIndex + 1}-${finalResults.length})`)
    }
  }

  // CRITICAL: Validate platform filter (runtime check)
  if (platformAnswer !== 'ANY') {
    const invalidGames = finalResults.filter(game => {
      const gamePlatforms = (game.platforms || []).map(p => p.toLowerCase())

      switch (platformAnswer) {
        case 'IOS':
          // Must have iOS support
          return !gamePlatforms.includes('ios')
        case 'ANDROID':
          // Must have Android support
          return !gamePlatforms.includes('android')
        case 'WEB':
          // Must have web support
          return !gamePlatforms.includes('web')
        case 'MOBILE_BOTH':
          // Must have at least one of iOS or Android (no web-only)
          const hasMobile = gamePlatforms.includes('ios') || gamePlatforms.includes('android')
          const isWebOnly = gamePlatforms.length === 1 && gamePlatforms[0] === 'web'
          return !hasMobile || isWebOnly
        default:
          return false
      }
    })

    if (invalidGames.length > 0) {
      console.error(`[QUEST] PLATFORM FILTER VIOLATION: ${invalidGames.length} games don't match platform filter!`)
      console.error('[QUEST] Invalid games:', invalidGames.map(g => ({ 
        title: g.title, 
        platforms: g.platforms,
        source: g.source,
        store: g.store 
      })))
      // Remove invalid games
      return finalResults.filter(game => !invalidGames.includes(game))
    }
  }

  // Fallback: if no results, return top games by likes (still respecting platform and genre filters)
  if (finalResults.length === 0) {
    console.warn('[QUEST] No results found, falling back to top games by likes')
    console.warn(`[QUEST] Fallback: platform=${platformAnswer}, genres=${profile.preferredGenres.join(', ') || 'none'}`)
    
    // Build fallback query with same filters
    const fallbackWhere: any = {
      status: 'PUBLISHED'
    }
    
    // Apply platform filter
    if (platformAnswer !== 'ANY' && allowedPlatforms.length > 0) {
      fallbackWhere.platforms = {
        hasSome: allowedPlatforms.map(p => p.toLowerCase())
      }
    }
    
    // Try to include genre filter if we have preferred genres
    if (profile.preferredGenres.length > 0) {
      fallbackWhere.categories = {
        some: {
          category: {
            name: {
              in: profile.preferredGenres
            }
          }
        }
      }
    }
    
    const fallbackProducts = await prisma.product.findMany({
      where: fallbackWhere,
      select: {
        id: true,
        slug: true,
        title: true,
        tagline: true,
        description: true,
        thumbnail: true,
        image: true,
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
        _count: {
          select: {
            votes: true,
            comments: true
          }
        }
      },
      orderBy: [
        {
          votes: {
            _count: 'desc'
          }
        },
        {
          createdAt: 'desc'
        }
      ],
      take: TOTAL_LIMIT
    })
    
    const fallbackCandidates = fallbackProducts.map((product) => {
      const emptyMatchReason: QuestMatchReason = {
        platforms: product.platforms || [],
        genresMatched: product.categories.map(pc => pc.category.name).filter(name => 
          profile.preferredGenres.includes(name)
        ),
        tagsMatched: [],
      }
      return convertInternalProductToQuestResult(
        product,
        1,
        emptyMatchReason,
        Math.max(...fallbackProducts.map(p => p._count.votes), 1)
      )
    })

    const filteredFallback = filterByPlatform(fallbackCandidates, platformAnswer)
    return filteredFallback.map((game, index) => ({ ...game, matchRank: index + 1 }))
  }

  return finalResults
}
