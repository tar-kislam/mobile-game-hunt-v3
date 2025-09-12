import { redisClient } from '@/lib/redis'
import { prisma } from '@/lib/prisma'

type BadgeType = 'WISE_OWL' | 'FIRE_DRAGON' | 'CLEVER_FOX' | 'GENTLE_PANDA' | 'SWIFT_PUMA'

type UserBadges = {
  userId: string
  badges: BadgeType[]
}

const BADGE_KEY = 'badges:users'

interface BadgeInfo {
  type: BadgeType
  name: string
  animal: string
  emoji: string
  description: string
  story: string
  requirementType: 'comments' | 'votes' | 'games' | 'likes' | 'follows'
  requirementValue: number
  xpReward: number
  nextMilestone?: string
}

const BADGE_CONFIG: Record<BadgeType, BadgeInfo> = {
  WISE_OWL: {
    type: 'WISE_OWL',
    name: 'Wise Owl',
    animal: 'Owl',
    emoji: '🦉',
    description: 'Master of wisdom and knowledge sharing',
    story: 'The Wise Owl has spent countless nights studying the art of meaningful conversation. Known for their insightful comments and thoughtful discussions, they guide others through the vast forest of knowledge.',
    requirementType: 'comments',
    requirementValue: 50,
    xpReward: 100,
    nextMilestone: 'Reach 100 comments for the Elder Owl badge'
  },
  FIRE_DRAGON: {
    type: 'FIRE_DRAGON',
    name: 'Fire Dragon',
    animal: 'Dragon',
    emoji: '🐉',
    description: 'Creator of legendary games and adventures',
    story: 'The Fire Dragon breathes life into incredible gaming experiences. With each game they create, they forge new worlds and adventures that captivate players across the realm.',
    requirementType: 'games',
    requirementValue: 10,
    xpReward: 200,
    nextMilestone: 'Submit 25 games for the Ancient Dragon badge'
  },
  CLEVER_FOX: {
    type: 'CLEVER_FOX',
    name: 'Clever Fox',
    animal: 'Fox',
    emoji: '🦊',
    description: 'Sharp-eyed discoverer of hidden gems',
    story: 'The Clever Fox has an uncanny ability to spot the most promising games in the wild. Their votes help guide the community to the best gaming treasures.',
    requirementType: 'votes',
    requirementValue: 100,
    xpReward: 150,
    nextMilestone: 'Cast 250 votes for the Master Fox badge'
  },
  GENTLE_PANDA: {
    type: 'GENTLE_PANDA',
    name: 'Gentle Panda',
    animal: 'Panda',
    emoji: '🐼',
    description: 'Beloved creator with a caring heart',
    story: 'The Gentle Panda creates games that warm hearts and bring joy. Their creations are loved by many, spreading happiness throughout the gaming community.',
    requirementType: 'likes',
    requirementValue: 50,
    xpReward: 120,
    nextMilestone: 'Receive 100 likes for the Sacred Panda badge'
  },
  SWIFT_PUMA: {
    type: 'SWIFT_PUMA',
    name: 'Swift Puma',
    animal: 'Puma',
    emoji: '🐆',
    description: 'Fast follower of exciting adventures',
    story: 'The Swift Puma moves with lightning speed to follow the most exciting games and adventures. They never miss an opportunity to be part of something amazing.',
    requirementType: 'follows',
    requirementValue: 25,
    xpReward: 80,
    nextMilestone: 'Follow 50 games for the Thunder Puma badge'
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
    
    // Get user stats for badge checking
    const userStats = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        _count: {
          select: {
            products: true,
            votes: true,
            comments: true,
            follows: true
          }
        }
      }
    })

    if (!userStats) return newlyAwardedBadges

    // Check Wise Owl badge (50+ comments)
    if (!currentBadges.includes('WISE_OWL')) {
      if (userStats._count.comments >= 50) {
        const awarded = await awardBadge(userId, 'WISE_OWL')
        if (awarded) newlyAwardedBadges.push('WISE_OWL')
      }
    }
    
    // Check Fire Dragon badge (10+ games)
    if (!currentBadges.includes('FIRE_DRAGON')) {
      if (userStats._count.products >= 10) {
        const awarded = await awardBadge(userId, 'FIRE_DRAGON')
        if (awarded) newlyAwardedBadges.push('FIRE_DRAGON')
      }
    }
    
    // Check Clever Fox badge (100+ votes)
    if (!currentBadges.includes('CLEVER_FOX')) {
      if (userStats._count.votes >= 100) {
        const awarded = await awardBadge(userId, 'CLEVER_FOX')
        if (awarded) newlyAwardedBadges.push('CLEVER_FOX')
      }
    }
    
    // Check Gentle Panda badge (50+ likes received)
    if (!currentBadges.includes('GENTLE_PANDA')) {
      // Count likes received on user's products
      const likesReceived = await prisma.vote.count({
        where: {
          product: {
            userId: userId
          }
        }
      })
      if (likesReceived >= 50) {
        const awarded = await awardBadge(userId, 'GENTLE_PANDA')
        if (awarded) newlyAwardedBadges.push('GENTLE_PANDA')
      }
    }
    
    // Check Swift Puma badge (25+ follows)
    if (!currentBadges.includes('SWIFT_PUMA')) {
      if (userStats._count.follows >= 25) {
        const awarded = await awardBadge(userId, 'SWIFT_PUMA')
        if (awarded) newlyAwardedBadges.push('SWIFT_PUMA')
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
