/**
 * Notification Message Helpers
 * 
 * This module provides utility functions to compose human-friendly notification messages
 * for XP, level, and badge events.
 */

/**
 * Generate XP gained notification message
 * 
 * @param amount - Amount of XP gained
 * @returns Formatted message
 */
export function xpGained(amount: number): string {
  return `⚡ +${amount} XP gained!`
}

/**
 * Generate level reached notification message
 * 
 * @param level - Level number reached
 * @returns Formatted message
 */
export function levelReached(level: number): string {
  return `🏆 Level ${level} reached! Keep going!`
}

/**
 * Generate badge unlocked notification message
 * 
 * @param title - Badge title
 * @returns Formatted message
 */
export function badgeUnlocked(title: string): string {
  return `🎖️ ${title} badge unlocked! Click to claim your reward!`
}

/**
 * Generate badge claimed notification message
 * 
 * @param title - Badge title
 * @param xp - XP reward amount
 * @returns Formatted message
 */
export function badgeClaimed(title: string, xp: number): string {
  return `🎉 ${title} unlocked! +${xp} XP added`
}

/**
 * Generate milestone notification message
 * 
 * @param action - Action performed (e.g., "first game", "first comment")
 * @returns Formatted message
 */
export function milestoneReached(action: string): string {
  return `🎯 ${action} milestone reached! Great progress!`
}
