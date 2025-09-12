import { redisClient } from '@/lib/redis'
import { prisma } from '@/lib/prisma'

type BadgeType = 'EARLY_HUNTER' | 'TOP_VOTER' | 'EXPLORER' | 'BUILDER'

type UserBadges = {
  userId: string
  badges: BadgeType[]
}

const BADGE_KEY = 'badges:users'

interface BadgeInfo {
  type: BadgeType
  name: string
  description: string
  emoji: string
  criteria: string
}

const BADGE_CONFIG: Record<BadgeType, BadgeInfo> = {
  EARLY_HUNTER: {
    type: 'EARLY_HUNTER',
    name: 'Early Hunter',
    description: 'One of the first users to join the platform',
    emoji: '🎯',
    criteria: 'Joined within first 100 users'
  },
  TOP_VOTER: {
    type: 'TOP_VOTER',
    name: 'Top Voter',
    description: 'Consistently votes on quality games',
    emoji: '🏆',
    criteria: 'Voted on 50+ games'
  },
  EXPLORER: {
    type: 'EXPLORER',
    name: 'Explorer',
    description: 'Discovers and shares new games',
    emoji: '🧭',
    criteria: 'Commented on 25+ games'
  },
  BUILDER: {
    type: 'BUILDER',
    name: 'Builder',
    description: 'Creates and submits games to the platform',
    emoji: '🔨',
    criteria: 'Submitted 5+ games'
  }
}

/**
 * Get all user badges from Redis
 */
export async function getAllUserBadges(): Promise<UserBadges[]> {
  try {
    const raw = await redisClient.get(BADGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch (error) {
    console.error('[BADGE SERVICE] Error getting user badges:', error)
    return []
  }
}

/**
 * Get badges for a specific user
 */
export async function getUserBadges(userId: string): Promise<BadgeType[]> {
  try {
    const allBadges = await getAllUserBadges()
    const userBadges = allBadges.find(u => u.userId === userId)
    return userBadges?.badges || []
  } catch (error) {
    console.error('[BADGE SERVICE] Error getting user badges:', error)
    return []
  }
}

/**
 * Award a badge to a user
 */
export async function awardBadge(userId: string, badgeType: BadgeType): Promise<boolean> {
  try {
    const allBadges = await getAllUserBadges()
    const existingUser = allBadges.find(u => u.userId === userId)
    
    if (existingUser) {
      // Check if user already has this badge
      if (existingUser.badges.includes(badgeType)) {
        return false // Badge already exists
      }
      existingUser.badges.push(badgeType)
    } else {
      // Create new user badge entry
      allBadges.push({ userId, badges: [badgeType] })
    }
    
    await redisClient.set(BADGE_KEY, JSON.stringify(allBadges))
    return true // Badge was newly awarded
  } catch (error) {
    console.error('[BADGE SERVICE] Error awarding badge:', error)
    return false
  }
}

/**
 * Check and award badges based on user activity
 */
export async function checkAndAwardBadges(userId: string): Promise<BadgeType[]> {
  const newlyAwardedBadges: BadgeType[] = []
  
  try {
    // Get current user badges
    const currentBadges = await getUserBadges(userId)
    
    // Check Early Hunter badge (first 100 users)
    if (!currentBadges.includes('EARLY_HUNTER')) {
      const userCount = await prisma.user.count()
      if (userCount <= 100) {
        const awarded = await awardBadge(userId, 'EARLY_HUNTER')
        if (awarded) newlyAwardedBadges.push('EARLY_HUNTER')
      }
    }
    
    // Check Top Voter badge (50+ votes)
    if (!currentBadges.includes('TOP_VOTER')) {
      const voteCount = await prisma.vote.count({ where: { userId } })
      if (voteCount >= 50) {
        const awarded = await awardBadge(userId, 'TOP_VOTER')
        if (awarded) newlyAwardedBadges.push('TOP_VOTER')
      }
    }
    
    // Check Explorer badge (25+ comments)
    if (!currentBadges.includes('EXPLORER')) {
      const commentCount = await prisma.productComment.count({ where: { userId } })
      if (commentCount >= 25) {
        const awarded = await awardBadge(userId, 'EXPLORER')
        if (awarded) newlyAwardedBadges.push('EXPLORER')
      }
    }
    
    // Check Builder badge (5+ submissions)
    if (!currentBadges.includes('BUILDER')) {
      const submissionCount = await prisma.product.count({ where: { userId } })
      if (submissionCount >= 5) {
        const awarded = await awardBadge(userId, 'BUILDER')
        if (awarded) newlyAwardedBadges.push('BUILDER')
      }
    }
    
    return newlyAwardedBadges
  } catch (error) {
    console.error('[BADGE SERVICE] Error checking badges:', error)
    return []
  }
}

/**
 * Get badge information by type
 */
export function getBadgeInfo(badgeType: BadgeType): BadgeInfo {
  return BADGE_CONFIG[badgeType]
}

/**
 * Get all badge configurations
 */
export function getAllBadgeConfigs(): Record<BadgeType, BadgeInfo> {
  return BADGE_CONFIG
}
