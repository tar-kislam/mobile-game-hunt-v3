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

  // Fetch ALL candidate products (will be filtered again after scoring)
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

  // Calculate max likes for normalization
  const maxLikes = Math.max(...products.map(p => p._count.votes), 1)

  // Score all games using centralized scoring function
  const scoredProducts = products.map(product => {
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

  // Filter out low scores
  const filteredScored = scoredProducts.filter(item => item.score >= QUEST_CONFIG.minScoreThreshold)

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

  // Sort internal games by score and limit to INTERNAL_LIMIT
  const sortedInternal = filteredInternal
    .sort((a, b) => b.score - a.score)
    .slice(0, INTERNAL_LIMIT)

  console.log(`[QUEST] Internal results: ${sortedInternal.length} (max: ${INTERNAL_LIMIT})`)

  // Calculate remaining slots for external games
  const remainingSlots = Math.max(0, TOTAL_LIMIT - sortedInternal.length)
  console.log(`[QUEST] Remaining slots for external games: ${remainingSlots}`)

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
  
  if (remainingSlots > 0 && filteredExternal.length > 0) {
    if (platformAnswer === 'MOBILE_BOTH') {
      // Use balanced selection for MOBILE_BOTH to ensure iOS/Android mix
      sortedExternal = buildBalancedExternalForMobile(filteredExternal, remainingSlots)
      console.log(`[QUEST] Balanced external selection: ${sortedExternal.length} games (iOS/Android mix)`)
    } else {
      // For other platform answers, simple sort + slice
      sortedExternal = filteredExternal
        .sort((a, b) => b.score - a.score)
        .slice(0, remainingSlots)
      console.log(`[QUEST] External results: ${sortedExternal.length} (max: ${remainingSlots})`)
    }
  }

  // Combine: internal first, then external (strict order)
  const finalMatches: QuestGameResult[] = [
    ...sortedInternal,
    ...sortedExternal,
  ]

  // Assign match ranks (1, 2, 3...)
  const finalResults = finalMatches.map((game, index) => ({
    ...game,
    matchRank: index + 1,
  }))
  
  console.log(`[QUEST] Final results: ${finalResults.filter(g => g.source === 'internal').length} internal, ${finalResults.filter(g => g.source === 'external').length} external, total: ${finalResults.length}`)

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

  // Fallback: if no results, return top games by likes (still respecting platform filter)
  if (finalResults.length === 0) {
    console.warn('[QUEST] No results found, falling back to top games by likes')
    const fallbackCandidates = products
      .sort((a, b) => b._count.votes - a._count.votes)
      .slice(0, INTERNAL_LIMIT)
      .map((product) => {
        const emptyMatchReason: QuestMatchReason = {
          platforms: product.platforms || [],
          genresMatched: [],
          tagsMatched: [],
        }
        return convertInternalProductToQuestResult(
          product,
          1,
          emptyMatchReason,
          maxLikes
        )
      })

    const filteredFallback = filterByPlatform(fallbackCandidates, platformAnswer)
    return filteredFallback.map((game, index) => ({ ...game, matchRank: index + 1 }))
  }

  return finalResults
}
