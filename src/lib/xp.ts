/**
 * XP and Level calculation utilities
 */

export interface XpProgress {
  currentLevel: number
  currentXp: number
  xpToNextLevel: number
  progressPercentage: number
  totalXpForCurrentLevel: number
  totalXpForNextLevel: number
}

/**
 * Calculate XP progress for a given user XP
 * Uses the same formula as the existing system:
 * Level 1 → 100 XP
 * Level 2 → 200 XP (total 300 XP)
 * Level 3 → 300 XP (total 600 XP)
 * Level 4 → 400 XP (total 1000 XP)
 * Each level requires +100 XP more than the previous level
 */
export function calculateXpProgress(userXp: number): XpProgress {
  if (userXp < 0) userXp = 0

  // Handle edge case: 0 XP
  if (userXp === 0) {
    return {
      currentLevel: 1,
      currentXp: 0,
      xpToNextLevel: 100,
      progressPercentage: 0,
      totalXpForCurrentLevel: 0,
      totalXpForNextLevel: 100
    }
  }

  // Calculate current level using cumulative XP requirements
  let currentLevel = 1
  let totalXpForCurrentLevel = 0
  
  // Find the highest level where cumulative XP <= userXp
  while (totalXpForCurrentLevel + (currentLevel * 100) <= userXp) {
    totalXpForCurrentLevel += currentLevel * 100
    currentLevel++
  }
  
  // Calculate XP progress within current level
  const currentXp = userXp - totalXpForCurrentLevel
  const xpRequiredForNextLevel = currentLevel * 100
  const totalXpForNextLevel = totalXpForCurrentLevel + xpRequiredForNextLevel
  const xpToNextLevel = totalXpForNextLevel - userXp
  
  // Progress percentage (0-100)
  const progressPercentage = Math.round((currentXp / xpRequiredForNextLevel) * 100)

  return {
    currentLevel,
    currentXp,
    xpToNextLevel,
    progressPercentage,
    totalXpForCurrentLevel,
    totalXpForNextLevel
  }
}

/**
 * Get XP requirements for a specific level
 */
export function getXpRequirementsForLevel(level: number): number {
  return level * 100
}

/**
 * Get total XP required to reach a specific level
 */
export function getTotalXpForLevel(level: number): number {
  let totalXp = 0
  for (let i = 1; i < level; i++) {
    totalXp += getXpRequirementsForLevel(i)
  }
  return totalXp
}

/**
 * Format XP progress for display
 */
export function formatXpProgress(userXp: number): string {
  const progress = calculateXpProgress(userXp)
  return `${progress.currentXp} / ${progress.currentLevel * 100} XP`
}

/**
 * Format level badge text
 */
export function formatLevelBadge(userXp: number): string {
  const progress = calculateXpProgress(userXp)
  return `Level ${progress.currentLevel}`
}

/**
 * Format XP to next level text
 */
export function formatXpToNextLevel(userXp: number): string {
  const progress = calculateXpProgress(userXp)
  return `${progress.xpToNextLevel} XP to Level ${progress.currentLevel + 1}`
}
