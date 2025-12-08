/**
 * Quest Scoring Functions
 * 
 * Centralized scoring logic for Quest recommendations.
 * All scoring functions work generically for ALL categories, not just roguelike.
 */

import { QUEST_CONFIG, UserQuestProfile, QuestMatchReason } from './config'

/**
 * Game data structure expected by scoring functions
 */
export interface GameWithTagsGenresPlatformsAndMeta {
  id: string
  platforms: string[]
  categories: Array<{ name: string }>
  tags: Array<{ slug: string; name: string }>
  gamificationTags: string[]
  monetization?: string
  pricing?: string
  _count: {
    votes: number
    comments: number
  }
  // Optional metadata
  sessionLength?: 'short' | 'medium' | 'long'
  complexity?: 'simple' | 'medium' | 'complex'
  artStyle?: string
}

/**
 * Compute platform match score (0-1)
 * Should be 1.0 if hard filter is working correctly
 */
export function computePlatformMatch(
  profile: UserQuestProfile,
  game: GameWithTagsGenresPlatformsAndMeta
): number {
  if (profile.platforms.length === 0) {
    return 1.0 // No platform preference = all platforms match
  }

  const gamePlatforms = game.platforms.map(p => p.toLowerCase())
  const profilePlatforms = profile.platforms.map(p => p.toLowerCase())

  // Check if game supports any of user's preferred platforms
  const hasMatch = profilePlatforms.some(p => gamePlatforms.includes(p))

  if (!hasMatch) {
    // This should never happen if hard filter is working, but return 0 for safety
    console.warn(`[QUEST_SCORING] Platform mismatch: user wants ${profile.platforms.join(', ')}, game has ${game.platforms.join(', ')}`)
    return 0
  }

  // Perfect match = 1.0
  // Multiple platform matches = slight bonus
  const matchCount = profilePlatforms.filter(p => gamePlatforms.includes(p)).length
  return matchCount === profilePlatforms.length ? 1.0 : 0.9
}

/**
 * Compute genre match score (0-1)
 * CRITICAL: This must work for ALL genres including Puzzle, Strategy, etc.
 */
export function computeGenreMatch(
  profile: UserQuestProfile,
  game: GameWithTagsGenresPlatformsAndMeta
): number {
  if (profile.preferredGenres.length === 0) {
    return 0.5 // No genre preference = neutral
  }

  // Normalize to lowercase for case-insensitive matching
  const gameGenres = game.categories.map(c => c.name.toLowerCase().trim())
  const preferredGenres = profile.preferredGenres.map(g => g.toLowerCase().trim())

  // Check for exact matches (case-insensitive)
  const exactMatches = preferredGenres.filter(prefGenre => 
    gameGenres.some(gameGenre => gameGenre === prefGenre)
  )
  
  if (exactMatches.length > 0) {
    // Multiple genre matches = bonus
    const matchRatio = exactMatches.length / preferredGenres.length
    // Strong boost for genre matches (0.9-1.0 range)
    // This ensures games with matching genres score highly
    return Math.min(1.0, 0.9 + (matchRatio * 0.1)) // 0.9-1.0 range
  }

  // No exact match = 0 (strict genre matching)
  return 0
}

/**
 * Compute tag overlap score (0-1)
 */
export function computeTagOverlap(
  profile: UserQuestProfile,
  game: GameWithTagsGenresPlatformsAndMeta
): number {
  if (profile.preferredTags.length === 0) {
    return 0.5 // No tag preference = neutral
  }

  const gameTagSlugs = game.tags.map(t => t.slug.toLowerCase())
  const gameTagNames = game.tags.map(t => t.name.toLowerCase())
  const gameGamificationTags = (game.gamificationTags || []).map((t: string) => t.toLowerCase())
  
  const allGameTags = [...gameTagSlugs, ...gameTagNames, ...gameGamificationTags]
  const preferredTags = profile.preferredTags.map(t => t.toLowerCase())

  // Count matches
  const matches = preferredTags.filter(prefTag => 
    allGameTags.some(gameTag => 
      gameTag === prefTag || 
      gameTag.includes(prefTag) || 
      prefTag.includes(gameTag)
    )
  )

  // Return ratio of matches (clamped 0-1)
  return Math.min(1.0, matches.length / preferredTags.length)
}

/**
 * Compute session length match score (0-1)
 */
export function computeSessionMatch(
  profile: UserQuestProfile,
  game: GameWithTagsGenresPlatformsAndMeta
): number {
  if (!profile.sessionPreference) {
    return 0.5 // No preference = neutral
  }

  // If game has explicit sessionLength metadata, use it
  if (game.sessionLength) {
    if (game.sessionLength === profile.sessionPreference) {
      return 1.0
    }
    // Close matches get partial score
    const preferenceOrder = ['short', 'medium', 'long']
    const gameIndex = preferenceOrder.indexOf(game.sessionLength)
    const profileIndex = preferenceOrder.indexOf(profile.sessionPreference)
    const distance = Math.abs(gameIndex - profileIndex)
    return distance === 1 ? 0.5 : 0
  }

  // Fallback: infer from category attributes (if available)
  // This would require category metadata - for now return neutral
  return 0.5
}

/**
 * Compute monetization match score (0-1)
 */
export function computeMonetizationMatch(
  profile: UserQuestProfile,
  game: GameWithTagsGenresPlatformsAndMeta
): number {
  if (!profile.requiredMonetization || profile.requiredMonetization.length === 0) {
    return 0.5 // No preference = neutral
  }

  if (!game.monetization) {
    return 0.3 // Unknown monetization = slight penalty
  }

  // Check if game matches required monetization
  if (profile.requiredMonetization.includes(game.monetization)) {
    return 1.0
  }

  return 0
}

/**
 * Compute complexity match score (0-1)
 * Optional - only if complexity data is available
 */
export function computeComplexityMatch(
  profile: UserQuestProfile,
  game: GameWithTagsGenresPlatformsAndMeta
): number {
  if (!game.complexity) {
    return 0.5 // Unknown = neutral
  }

  // For now, return neutral (can be enhanced with user preference)
  return 0.5
}

/**
 * Compute popularity score (0-1)
 * Normalized based on max likes in candidate set
 */
export function computePopularityScore(
  game: GameWithTagsGenresPlatformsAndMeta,
  maxLikes: number
): number {
  if (maxLikes === 0) {
    return 0.5 // No votes = neutral
  }

  return Math.min(1.0, game._count.votes / maxLikes)
}

/**
 * Compute favorite game boost (0-2)
 * Extra boost if game shares tags with user's favorite games
 */
export function computeFavoriteGameBoost(
  profile: UserQuestProfile,
  game: GameWithTagsGenresPlatformsAndMeta
): number {
  if (profile.favoriteGameTags.length === 0) {
    return 0 // No favorite games = no boost
  }

  const gameTagNames = game.tags.map(t => t.name)
  const gameGamificationTags = (game.gamificationTags || []).map((t: string) => t)
  const gameCategoryNames = game.categories.map(c => c.name)
  
  const allGameTags = [...gameTagNames, ...gameGamificationTags, ...gameCategoryNames].map(t => t.toLowerCase())
  const favoriteTags = profile.favoriteGameTags.map(t => t.toLowerCase())

  // Count matches
  const matches = favoriteTags.filter(favTag => 
    allGameTags.some(gameTag => 
      gameTag === favTag || 
      gameTag.includes(favTag) || 
      favTag.includes(gameTag)
    )
  )

  if (matches.length === 0) {
    return 0
  }

  // Boost based on number of matches
  const matchRatio = matches.length / profile.favoriteGameTags.length
  return Math.min(2.0, matchRatio * 2.0) // 0-2 range
}

/**
 * Build match reason for UI explanation
 */
export function buildMatchReason(
  profile: UserQuestProfile,
  game: GameWithTagsGenresPlatformsAndMeta
): QuestMatchReason {
  const gameGenres = game.categories.map(c => c.name)
  const gameTagNames = game.tags.map(t => t.name)
  const gameGamificationTags = (game.gamificationTags || []).map((t: string) => t)
  const allGameTags = [...gameTagNames, ...gameGamificationTags]

  const genresMatched = gameGenres.filter(g => profile.preferredGenres.includes(g))
  const tagsMatched = allGameTags.filter(t => 
    profile.preferredTags.some(pt => 
      t.toLowerCase().includes(pt.toLowerCase()) || 
      pt.toLowerCase().includes(t.toLowerCase())
    ) || 
    profile.favoriteGameTags.some(ft => 
      t.toLowerCase().includes(ft.toLowerCase()) || 
      ft.toLowerCase().includes(t.toLowerCase())
    )
  )

  const favoriteSimilarity = tagsMatched.some(t => 
    profile.favoriteGameTags.some(ft => 
      t.toLowerCase().includes(ft.toLowerCase()) || 
      ft.toLowerCase().includes(t.toLowerCase())
    )
  )

  return {
    platforms: game.platforms,
    genresMatched,
    tagsMatched: tagsMatched.slice(0, 5), // Limit to top 5
    sessionMatch: game.sessionLength || 'none',
    favoriteSimilarity,
    monetizationMatch: game.monetization || undefined,
  }
}

/**
 * Main scoring function for Quest recommendations
 * Uses UserQuestProfile + QUEST_CONFIG weights
 */
export function scoreGameForQuest(
  profile: UserQuestProfile,
  game: GameWithTagsGenresPlatformsAndMeta,
  maxLikes: number
): { score: number; matchReason: QuestMatchReason } {
  const { weights } = QUEST_CONFIG

  let score = 0

  // 1) Platform (should be 1.0 if hard filter works)
  const platformMatch = computePlatformMatch(profile, game)
  score += weights.platform * platformMatch

  // 2) Genre/type
  const genreMatch = computeGenreMatch(profile, game)
  score += weights.genre * genreMatch

  // 3) Tags
  const tagOverlap = computeTagOverlap(profile, game)
  score += weights.tags * tagOverlap

  // 4) Session length
  const sessionMatch = computeSessionMatch(profile, game)
  score += weights.sessionLength * sessionMatch

  // 5) Monetization
  const monetizationMatch = computeMonetizationMatch(profile, game)
  score += weights.monetization * monetizationMatch

  // 6) Complexity (optional)
  const complexityMatch = computeComplexityMatch(profile, game)
  score += weights.complexity * complexityMatch

  // 7) Popularity
  const popularityScore = computePopularityScore(game, maxLikes)
  score += weights.popularity * popularityScore

  // 8) Favorite game boost (extra, not weighted)
  const favoriteBoost = computeFavoriteGameBoost(profile, game)
  score += favoriteBoost

  // 9) Small randomness
  score += weights.randomness * Math.random()

  // Build match reason
  const matchReason = buildMatchReason(profile, game)

  return { score, matchReason }
}

