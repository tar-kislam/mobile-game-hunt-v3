import { prisma } from '@/lib/prisma'
import { calculateLevelProgress } from './xpCalculator'
import { notifyXPProgress } from '@/lib/notificationService'

export type XPAction = 'vote' | 'comment' | 'follow' | 'add_game' | 'badge'

export interface XPReward {
  action: XPAction
  amount: number
  description: string
}

export const XP_REWARDS: Record<XPAction, XPReward> = {
  vote: {
    action: 'vote',
    amount: 2,
    description: 'Voted on a game'
  },
  comment: {
    action: 'comment',
    amount: 3,
    description: 'Commented on a game'
  },
  follow: {
    action: 'follow',
    amount: 5,
    description: 'Followed a user'
  },
  add_game: {
    action: 'add_game',
    amount: 10,
    description: 'Added a new game'
  },
  badge: {
    action: 'badge',
    amount: 0, // Amount will be set dynamically based on badge
    description: 'Earned a badge'
  }
}

/**
 * Create level-up notifications for each level gained
 */
async function createLevelUpNotifications(
  userId: string, 
  previousLevel: number, 
  newLevel: number
): Promise<void> {
  try {
    // Create notifications for each level gained (handles multiple level jumps)
    for (let level = previousLevel + 1; level <= newLevel; level++) {
      // Check if notification already exists for this level (idempotency)
      const existingNotification = await prisma.notification.findFirst({
        where: {
          userId,
          type: 'LEVEL_UP',
          meta: {
            path: ['newLevel'],
            equals: level
          }
        }
      })

      if (!existingNotification) {
        await prisma.notification.create({
          data: {
            userId,
            type: 'LEVEL_UP',
            title: 'Level Up!',
            message: `You reached Level ${level} 🚀`,
            meta: {
              newLevel: level,
              previousLevel: level - 1
            },
            link: '/profile#badges',
            icon: 'trophy',
            read: false
          }
        })

        console.log(`[XP SERVICE] Created level-up notification for user ${userId} - Level ${level}`)
      }
    }
  } catch (error) {
    console.error('[XP SERVICE] Error creating level-up notifications:', error)
    // Don't fail XP award if notification creation fails
  }
}

/**
 * Award XP to a user for a specific action
 */
export async function awardXP(
  userId: string, 
  action: XPAction, 
  customAmount?: number
): Promise<{
  success: boolean
  xpAwarded: number
  newTotalXP: number
  levelUp: boolean
  newLevel: number
  previousLevel: number
}> {
  try {
    // Get current user XP
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { xp: true }
    })

    if (!user) {
      throw new Error('User not found')
    }

    const currentXP = user.xp
    const previousLevelProgress = calculateLevelProgress(currentXP)
    const previousLevel = previousLevelProgress.level

    // Determine XP amount
    let xpAmount: number
    if (customAmount !== undefined) {
      xpAmount = customAmount
    } else {
      xpAmount = XP_REWARDS[action].amount
    }

    // Update user's XP
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        xp: {
          increment: xpAmount
        }
      },
      select: { xp: true }
    })

    const newTotalXP = updatedUser.xp
    const newLevelProgress = calculateLevelProgress(newTotalXP)
    const newLevel = newLevelProgress.level
    const levelUp = newLevel > previousLevel

    // Create level-up notifications if user leveled up
    if (levelUp) {
      await createLevelUpNotifications(userId, previousLevel, newLevel)
    }

    // Send XP progress notification (for non-badge XP)
    if (action !== 'badge') {
      try {
        await notifyXPProgress(userId, xpAmount, XP_REWARDS[action].description)
        console.log(`[XP SERVICE] XP progress notification sent for user ${userId}: +${xpAmount} XP`)
      } catch (error) {
        console.error(`[XP SERVICE] Failed to send XP progress notification:`, error)
      }
    }

    // Dispatch XP update event for UI refresh (client-side only)
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('xp-updated', {
        detail: {
          userId,
          xpAwarded: xpAmount,
          newTotalXP,
          levelUp,
          newLevel,
          previousLevel,
          action
        }
      }))
    }

    return {
      success: true,
      xpAwarded: xpAmount,
      newTotalXP,
      levelUp,
      newLevel,
      previousLevel
    }
  } catch (error) {
    console.error('[XP SERVICE] Error awarding XP:', error)
    return {
      success: false,
      xpAwarded: 0,
      newTotalXP: 0,
      levelUp: false,
      newLevel: 1,
      previousLevel: 1
    }
  }
}

/**
 * Award XP for badge earning (used by badge service)
 */
export async function awardBadgeXP(userId: string, badgeType: string, xpAmount: number): Promise<boolean> {
  try {
    const result = await awardXP(userId, 'badge', xpAmount)
    return result.success
  } catch (error) {
    console.error('[XP SERVICE] Error awarding badge XP:', error)
    return false
  }
}

/**
 * Get user's current XP and level information
 */
export async function getUserXPInfo(userId: string): Promise<{
  totalXP: number
  level: number
  currentXP: number
  requiredXP: number
  remainingXP: number
  progressPercentage: number
} | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { xp: true }
    })

    if (!user) return null

    const levelProgress = calculateLevelProgress(user.xp)
    const progressPercentage = Math.round((levelProgress.currentXP / levelProgress.requiredXP) * 100)

    return {
      totalXP: user.xp,
      level: levelProgress.level,
      currentXP: levelProgress.currentXP,
      requiredXP: levelProgress.requiredXP,
      remainingXP: levelProgress.remainingXP,
      progressPercentage
    }
  } catch (error) {
    console.error('[XP SERVICE] Error getting user XP info:', error)
    return null
  }
}