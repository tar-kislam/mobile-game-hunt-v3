/**
 * Platform Filtering for Quest Recommendations
 * 
 * Ensures strict platform filtering for both internal and external games
 */

export type PlatformAnswer =
  | 'MOBILE_BOTH'      // "Mobile (iOS / Android)"
  | 'IOS'
  | 'ANDROID'
  | 'WEB'
  | 'ANY'

export type GamePlatform = 'ios' | 'android' | 'web'

/**
 * Map quiz platform answer to PlatformAnswer type
 */
export function mapPlatformAnswer(questionId: string, optionId: string): PlatformAnswer {
  if (questionId !== 'platform') {
    return 'ANY'
  }

  switch (optionId) {
    case 'mobile':
      return 'MOBILE_BOTH'
    case 'ios':
      return 'IOS'
    case 'android':
      return 'ANDROID'
    case 'web':
      return 'WEB'
    case 'any':
    default:
      return 'ANY'
  }
}

/**
 * Get allowed platforms from PlatformAnswer
 */
export function getAllowedPlatforms(answer: PlatformAnswer): GamePlatform[] {
  switch (answer) {
    case 'IOS':
      return ['ios']
    case 'ANDROID':
      return ['android']
    case 'WEB':
      return ['web']
    case 'MOBILE_BOTH':
      return ['ios', 'android']
    case 'ANY':
    default:
      return ['ios', 'android', 'web'] // All platforms allowed
  }
}

/**
 * Check if a game's platforms match the platform answer
 * STRICT: For IOS/ANDROID, only show games that support that platform
 */
export function gameMatchesPlatform(
  gamePlatforms: string[],
  answer: PlatformAnswer
): boolean {
  if (answer === 'ANY') {
    return true
  }

  const normalizedGamePlatforms = gamePlatforms.map(p => p.toLowerCase())

  switch (answer) {
    case 'IOS':
      // Must have iOS support
      return normalizedGamePlatforms.includes('ios')
    
    case 'ANDROID':
      // Must have Android support
      return normalizedGamePlatforms.includes('android')
    
    case 'WEB':
      // Must have web support
      return normalizedGamePlatforms.includes('web')
    
    case 'MOBILE_BOTH':
      // Must have at least one of iOS or Android (but can have both)
      // NO web-only games
      return (normalizedGamePlatforms.includes('ios') || normalizedGamePlatforms.includes('android')) &&
             !(normalizedGamePlatforms.length === 1 && normalizedGamePlatforms[0] === 'web')
    
    default:
      return true
  }
}

/**
 * Filter games by platform answer
 * Works for both internal and external games
 */
export function filterByPlatform<T extends { platforms?: string[] | null }>(
  games: T[],
  answer: PlatformAnswer
): T[] {
  if (answer === 'ANY') {
    return games
  }

  return games.filter(game => {
    const gamePlatforms = game.platforms || []
    return gameMatchesPlatform(gamePlatforms, answer)
  })
}

/**
 * Extract platform answer from quiz answers
 */
export function extractPlatformAnswer(
  answers: Array<{ questionId: string; optionId: string }>
): PlatformAnswer {
  const platformAnswer = answers.find(a => a.questionId === 'platform')
  if (!platformAnswer) {
    return 'ANY'
  }
  return mapPlatformAnswer(platformAnswer.questionId, platformAnswer.optionId)
}

/**
 * Interface for games with platforms and scores
 */
export interface GameWithPlatformsAndScore {
  platforms?: string[] | null
  score: number
  [key: string]: any // Allow other properties
}

/**
 * Build balanced external games list for MOBILE_BOTH
 * Ensures a mix of iOS and Android games, not skewed to one platform
 */
export function buildBalancedExternalForMobile<T extends GameWithPlatformsAndScore>(
  external: T[],
  max: number
): T[] {
  // Separate games by platform support
  const both = external.filter(
    g => {
      const platforms = (g.platforms || []).map(p => p.toLowerCase())
      return platforms.includes('ios') && platforms.includes('android')
    }
  )
  
  const iosOnly = external.filter(
    g => {
      const platforms = (g.platforms || []).map(p => p.toLowerCase())
      return platforms.includes('ios') && !platforms.includes('android')
    }
  )
  
  const androidOnly = external.filter(
    g => {
      const platforms = (g.platforms || []).map(p => p.toLowerCase())
      return platforms.includes('android') && !platforms.includes('ios')
    }
  )

  // Sort each by score descending
  both.sort((a, b) => b.score - a.score)
  iosOnly.sort((a, b) => b.score - a.score)
  androidOnly.sort((a, b) => b.score - a.score)

  const result: T[] = []

  // 1) Take from dual-platform games first (they satisfy both)
  for (const g of both) {
    if (result.length >= max) break
    result.push(g)
  }

  // 2) Then alternate between iosOnly and androidOnly to keep balance
  // Start with the platform that has more games to ensure better distribution
  let iosIndex = 0
  let androidIndex = 0
  let turn: 'ios' | 'android' = iosOnly.length >= androidOnly.length ? 'ios' : 'android'
  
  while (result.length < max && (iosIndex < iosOnly.length || androidIndex < androidOnly.length)) {
    if (turn === 'ios' && iosIndex < iosOnly.length) {
      result.push(iosOnly[iosIndex++])
      if (result.length >= max) break
      turn = 'android' // Switch to Android next
    } else if (turn === 'android' && androidIndex < androidOnly.length) {
      result.push(androidOnly[androidIndex++])
      if (result.length >= max) break
      turn = 'ios' // Switch to iOS next
    } else {
      // Current turn has no more games, switch to the other
      turn = turn === 'ios' ? 'android' : 'ios'
      // If both are exhausted, break
      if (iosIndex >= iosOnly.length && androidIndex >= androidOnly.length) break
    }
  }

  // 3) If still slots left, fill with any remaining highest-scored
  // Continue alternating if possible, otherwise fill from highest scores
  const remainingIos = iosOnly.slice(iosIndex)
  const remainingAndroid = androidOnly.slice(androidIndex)
  const remainingPool = [
    ...remainingIos,
    ...remainingAndroid
  ].sort((a, b) => b.score - a.score)
  
  for (const g of remainingPool) {
    if (result.length >= max) break
    // Avoid duplicates
    if (!result.some(r => r === g)) {
      result.push(g)
    }
  }
  
  console.log(`[BALANCED_EXTERNAL] Selected ${result.length} games: ${result.filter(g => {
    const p = (g.platforms || []).map(p => p.toLowerCase())
    return p.includes('ios') && p.includes('android')
  }).length} both, ${result.filter(g => {
    const p = (g.platforms || []).map(p => p.toLowerCase())
    return p.includes('ios') && !p.includes('android')
  }).length} iOS-only, ${result.filter(g => {
    const p = (g.platforms || []).map(p => p.toLowerCase())
    return p.includes('android') && !p.includes('ios')
  }).length} Android-only`)

  return result
}

