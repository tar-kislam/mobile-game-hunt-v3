import { prisma } from '@/lib/prisma'
import { toast } from 'sonner'

/**
 * XP Service - Handles user experience points and level calculations
 * 
 * This service provides helper functions for managing user XP and levels
 * without modifying existing business logic. These functions can be called
 * inside existing flows to add XP and handle level progression.
 */

/**
 * Calculate level from XP amount
 * Formula: Math.floor(xp / 100) + 1
 * 
 * @param xp - Experience points
 * @returns Level number
 * 
 * @example
 * getLevelFromXP(0)    // Level 1
 * getLevelFromXP(150)  // Level 2
 * getLevelFromXP(350)  // Level 4
 */
export function getLevelFromXP(xp: number): number {
  return Math.floor(xp / 100) + 1
}

/**
 * Add XP to a user and handle level progression
 * 
 * This function:
 * 1. Increments user.xp by the specified amount
 * 2. Calculates new level based on new XP total
 * 3. Updates user.level if the new level is higher
 * 4. Returns the updated user object
 * 
 * @param userId - User ID to add XP to
 * @param amount - Amount of XP to add (must be positive)
 * @returns Updated user object with new XP and level
 * 
 * @throws Error if user not found or amount is invalid
 */
export async function addXP(userId: string, amount: number): Promise<{
  id: string
  name: string | null
  email: string
  xp: number
  level: number
}> {
  // Validate input
  if (amount <= 0) {
    throw new Error('XP amount must be positive')
  }

  if (!userId || typeof userId !== 'string') {
    throw new Error('Valid userId is required')
  }

  try {
    // Get current user data
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        xp: true,
        level: true
      }
    })

    if (!currentUser) {
      throw new Error('User not found')
    }

    // Calculate new XP and level
    const newXP = currentUser.xp + amount
    const newLevel = getLevelFromXP(newXP)

    // Update user with new XP and level (if level increased)
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        xp: newXP,
        level: newLevel > currentUser.level ? newLevel : currentUser.level
      },
      select: {
        id: true,
        name: true,
        email: true,
        xp: true,
        level: true
      }
    })

    // Show toast notification for level up
    if (newLevel > currentUser.level) {
      console.log(`[XP SERVICE] User ${userId} leveled up from ${currentUser.level} to ${newLevel}`)
      
      // Show level up toast notification
      toast.success(`🚀 You reached Level ${newLevel}!`, {
        description: `Congratulations! You've gained ${amount} XP and leveled up!`,
        duration: 5000,
      })
    }

    return updatedUser
  } catch (error) {
    console.error('[XP SERVICE] Error adding XP:', error)
    throw error
  }
}

/**
 * Add XP with first-time bonus logic
 * 
 * This function checks if it's the user's first time performing an action
 * and awards bonus XP accordingly.
 * 
 * @param userId - User ID to add XP to
 * @param baseAmount - Base XP amount to award
 * @param bonusAmount - Bonus XP for first-time action
 * @param actionType - Type of action ('vote', 'comment', 'submit')
 * @returns Updated user object with new XP and level
 */
export async function addXPWithBonus(
  userId: string, 
  baseAmount: number, 
  bonusAmount: number, 
  actionType: 'vote' | 'comment' | 'submit' | 'like' | 'follow'
): Promise<{
  id: string
  name: string | null
  email: string
  xp: number
  level: number
  isFirstTime: boolean
}> {
  try {
    // Check if user has performed this action before
    let isFirstTime = false
    
    switch (actionType) {
      case 'vote':
        const existingVote = await prisma.vote.findFirst({
          where: { userId }
        })
        isFirstTime = !existingVote
        break
        
      case 'comment':
        const existingComment = await prisma.postComment.findFirst({
          where: { userId }
        })
        isFirstTime = !existingComment
        break
        
      case 'submit':
        const existingProduct = await prisma.product.findFirst({
          where: { userId }
        })
        isFirstTime = !existingProduct
        break
        
      case 'like':
        const existingLike = await prisma.vote.findFirst({
          where: { userId }
        })
        isFirstTime = !existingLike
        break
        
      case 'follow':
        const existingFollow = await prisma.follow.findFirst({
          where: { userId }
        })
        isFirstTime = !existingFollow
        break
        
      default:
        isFirstTime = false
    }

    // Calculate total XP amount
    const totalAmount = baseAmount + (isFirstTime ? bonusAmount : 0)

    // Add XP
    const updatedUser = await addXP(userId, totalAmount)

    // Log bonus if awarded
    if (isFirstTime) {
      console.log(`[XP SERVICE] First-time ${actionType} bonus: ${bonusAmount} XP awarded to user ${userId}`)
    }

    return {
      ...updatedUser,
      isFirstTime
    }
  } catch (error) {
    console.error('[XP SERVICE] Error adding XP with bonus:', error)
    throw error
  }
}

/**
 * Get user's current XP and level information
 * 
 * @param userId - User ID to get XP info for
 * @returns User XP and level data
 */
export async function getUserXPInfo(userId: string): Promise<{
  id: string
  name: string | null
  email: string
  xp: number
  level: number
  xpToNextLevel: number
  xpProgress: number
}> {
  if (!userId || typeof userId !== 'string') {
    throw new Error('Valid userId is required')
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        xp: true,
        level: true
      }
    })

    if (!user) {
      throw new Error('User not found')
    }

    // Calculate XP progress to next level
    const currentLevelXP = (user.level - 1) * 100
    const nextLevelXP = user.level * 100
    const xpToNextLevel = nextLevelXP - user.xp
    const xpProgress = ((user.xp - currentLevelXP) / 100) * 100

    return {
      ...user,
      xpToNextLevel: Math.max(0, xpToNextLevel),
      xpProgress: Math.min(100, Math.max(0, xpProgress))
    }
  } catch (error) {
    console.error('[XP SERVICE] Error getting user XP info:', error)
    throw error
  }
}

/**
 * Get leaderboard of users by XP
 * 
 * @param limit - Number of users to return (default: 10)
 * @returns Array of users sorted by XP descending
 */
export async function getXPLeaderboard(limit: number = 10): Promise<Array<{
  id: string
  name: string | null
  email: string
  xp: number
  level: number
  rank: number
}>> {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        xp: true,
        level: true
      },
      orderBy: {
        xp: 'desc'
      },
      take: limit
    })

    return users.map((user, index) => ({
      ...user,
      rank: index + 1
    }))
  } catch (error) {
    console.error('[XP SERVICE] Error getting XP leaderboard:', error)
    throw error
  }
}
