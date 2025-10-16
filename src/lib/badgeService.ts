import { redisClient } from '@/lib/redis'
import { prisma } from '@/lib/prisma'
import { notify, notifyBadgeEarned } from '@/lib/notificationService'
import { badgeUnlocked, badgeClaimed } from '@/lib/notifications/messages'
import { awardBadgeXP } from './xpService'

type BadgeType = 'WISE_OWL' | 'FIRE_DRAGON' | 'CLEVER_FOX' | 'GENTLE_PANDA' | 'SWIFT_PUMA' | 'EXPLORER' | 'RISING_STAR' | 'PIONEER' | 'FIRST_LAUNCH'

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
  requirementType: 'comments' | 'votes' | 'games' | 'likes' | 'follows' | 'user_follows' | 'followers' | 'first_game' | 'registration_order'
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
  },
  EXPLORER: {
    type: 'EXPLORER',
    name: 'Explorer',
    animal: 'Explorer',
    emoji: '🧭',
    description: 'Adventurer who discovers new connections',
    story: 'The Explorer sets out on journeys to discover new friends and connections. With their compass always pointing toward new relationships, they build bridges across the community.',
    requirementType: 'user_follows',
    requirementValue: 10,
    xpReward: 100,
    nextMilestone: 'Follow 25 users for the Trailblazer badge'
  },
  RISING_STAR: {
    type: 'RISING_STAR',
    name: 'Rising Star',
    animal: 'Star',
    emoji: '⭐',
    description: 'Shining beacon that attracts followers',
    story: 'The Rising Star shines bright in the community sky, attracting followers with their engaging content and charismatic presence. They inspire others to join their journey.',
    requirementType: 'followers',
    requirementValue: 100,
    xpReward: 300,
    nextMilestone: 'Reach 500 followers for the Superstar badge'
  },
  PIONEER: {
    type: 'PIONEER',
    name: 'Pioneer',
    animal: 'Pioneer',
    emoji: '🛡️',
    description: 'One of the first 1000 users to join the platform',
    story: 'The Pioneer was among the first brave souls to venture into this new digital realm. Their early arrival helped shape the foundation of our community and paved the way for all who followed.',
    requirementType: 'registration_order',
    requirementValue: 1000,
    xpReward: 500,
    nextMilestone: 'Exclusive badge for platform pioneers'
  },
  FIRST_LAUNCH: {
    type: 'FIRST_LAUNCH',
    name: 'First Launch',
    animal: 'Target',
    emoji: '🎯',
    description: 'Successfully published your first game',
    story: 'The First Launch represents the moment when a creator takes their first step into the gaming world. This milestone marks the beginning of their journey as a game developer and showcases their courage to share their creation with the world.',
    requirementType: 'first_game',
    requirementValue: 1,
    xpReward: 150,
    nextMilestone: 'One-time achievement for your first game launch'
  }
}

/**
 * Check from the database (persistent storage) whether the user has already
 * been awarded the given badge. We purposefully avoid relying only on Redis
 * so that flushing the cache does not re-trigger XP awards.
 */
async function hasBadgePersisted(userId: string, badgeType: BadgeType): Promise<boolean> {
  try {
    const badgeInfo = BADGE_CONFIG[badgeType]
    // Look for any prior badge-related notification that encodes this badge
    // in its JSON meta. This acts as an idempotency guard across cache resets.
    const existing = await (prisma as any).notification.findFirst({
      where: {
        userId,
        type: { in: ['badge', 'badge_unlocked'] },
        OR: [
          {
            meta: {
              path: ['badgeId'],
              equals: badgeType
            }
          },
          {
            message: {
              contains: badgeInfo?.name ?? badgeType,
              mode: 'insensitive'
            }
          }
        ]
      },
      select: { id: true }
    })

    return Boolean(existing)
  } catch (err) {
    console.error('[BADGE SERVICE] Error checking persisted badge:', err)
    return false
  }
}

/**
 * Get all user badges from Redis
 */
export async function getAllUserBadges(): Promise<UserBadges[]> {
  try {
    if (!redisClient) return []
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
    const userBadges = allBadges.find(u => u.userId === userId)?.badges || []
    
    // Special handling for Pioneer badge - always include if eligible
    const isPioneerEligible = await checkPioneerEligibility(userId)
    if (isPioneerEligible && !userBadges.includes('PIONEER')) {
      // Before auto-award, ensure it wasn't already persisted in DB
      const alreadyPersisted = await hasBadgePersisted(userId, 'PIONEER')
      if (alreadyPersisted) {
        return [...userBadges, 'PIONEER']
      }
      // Auto-award Pioneer badge if user is eligible but doesn't have it
      console.log(`[BADGE SERVICE] Auto-awarding Pioneer badge to eligible user ${userId}`)
      await awardBadge(userId, 'PIONEER')
      return [...userBadges, 'PIONEER']
    }
    
    return userBadges
  } catch (error) {
    console.error('[BADGE SERVICE] Error getting user badges:', error)
    return []
  }
}

/**
 * Award a badge to a user and grant XP
 */
export async function awardBadge(userId: string, badgeType: BadgeType): Promise<boolean> {
  try {
    // DB-level idempotency guard: if this badge was already awarded in the past,
    // do not re-award and do not grant XP again (survives Redis flushes).
    const alreadyPersisted = await hasBadgePersisted(userId, badgeType)
    if (alreadyPersisted) {
      return false
    }

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
    
    // Grant XP reward using the XP system
    const badgeInfo = BADGE_CONFIG[badgeType]
    try {
      const xpResult = await awardBadgeXP(userId, badgeType, badgeInfo.xpReward)
      if (xpResult) {
        console.log(`[BADGE SERVICE] Awarded ${badgeInfo.xpReward} XP for badge ${badgeType}`)
      } else {
        console.warn(`[BADGE SERVICE] Failed to award XP for badge ${badgeType}`)
      }
    } catch (error) {
      console.error(`[BADGE SERVICE] Error awarding XP for badge ${badgeType}:`, error)
    }
    
    // Send notification about badge earned
    try {
      await notifyBadgeEarned(userId, badgeInfo.name, badgeType, badgeInfo.xpReward)
      console.log(`[BADGE SERVICE] Notification sent for badge ${badgeType} to user ${userId}`)
    } catch (error) {
      console.error(`[BADGE SERVICE] Failed to send notification for badge ${badgeType}:`, error)
    }
    
    // Special handling for Pioneer badge - mark as permanent
    if (badgeType === 'PIONEER') {
      console.log(`[BADGE SERVICE] Pioneer badge awarded to user ${userId} - marked as permanent`)
    }
    
    return true // Badge was newly awarded
  } catch (error) {
    console.error('[BADGE SERVICE] Error awarding badge:', error)
    return false
  }
}

/**
 * Check if user is eligible for Pioneer badge based on registration order
 */
export async function checkPioneerEligibility(userId: string): Promise<boolean> {
  try {
    // Get user's registration order by counting users created before them
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { createdAt: true }
    })

    if (!user) return false

    // Count users created before this user
    const usersBeforeCount = await prisma.user.count({
      where: {
        createdAt: {
          lt: user.createdAt
        }
      }
    })

    // User is eligible if they are within the first 1000 users
    return usersBeforeCount < 1000
  } catch (error) {
    console.error('[BADGE SERVICE] Error checking Pioneer eligibility:', error)
    return false
  }
}

/**
 * Check and award badges based on user activity
 */
export async function checkAndAwardBadges(userId: string): Promise<BadgeType[]> {
  const newlyAwardedBadges: BadgeType[] = []
  
  try {
    // Check if user is admin - admins don't get badges for their actions
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    })
    
    if (user?.role === 'ADMIN') {
      console.log(`[BADGE SERVICE] Skipping badge check for admin user ${userId}`)
      return newlyAwardedBadges
    }
    
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
            following: true
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
      if (userStats._count.following >= 25) {
        const awarded = await awardBadge(userId, 'SWIFT_PUMA')
        if (awarded) newlyAwardedBadges.push('SWIFT_PUMA')
      }
    }
    
    // Check Explorer badge (10+ user follows)
    if (!currentBadges.includes('EXPLORER')) {
      const userFollows = await prisma.follow.count({
        where: { followerId: userId }
      })
      if (userFollows >= 10) {
        const awarded = await awardBadge(userId, 'EXPLORER')
        if (awarded) newlyAwardedBadges.push('EXPLORER')
      }
    }
    
    // Check Rising Star badge (100+ followers)
    if (!currentBadges.includes('RISING_STAR')) {
      const followers = await prisma.follow.count({
        where: { followingId: userId }
      })
      if (followers >= 100) {
        const awarded = await awardBadge(userId, 'RISING_STAR')
        if (awarded) newlyAwardedBadges.push('RISING_STAR')
      }
    }
    
    // Check Pioneer badge (first 1000 users)
    if (!currentBadges.includes('PIONEER')) {
      const isEligible = await checkPioneerEligibility(userId)
      if (isEligible) {
        const awarded = await awardBadge(userId, 'PIONEER')
        if (awarded) newlyAwardedBadges.push('PIONEER')
      }
    }
    
    // Check First Launch badge (first game published)
    if (!currentBadges.includes('FIRST_LAUNCH')) {
      const publishedGames = await prisma.product.count({
        where: {
          userId: userId,
          status: 'PUBLISHED'
        }
      })
      if (publishedGames >= 1) {
        const awarded = await awardBadge(userId, 'FIRST_LAUNCH')
        if (awarded) newlyAwardedBadges.push('FIRST_LAUNCH')
      }
    }
    
    // Send notifications for newly awarded badges
    for (const badgeType of newlyAwardedBadges) {
      try {
        const badgeInfo = BADGE_CONFIG[badgeType]
        await notify(userId, badgeUnlocked(badgeInfo.name), 'badge_unlocked')
      } catch (notificationError) {
        console.error(`[BADGE SERVICE] Error sending badge unlocked notification for ${badgeType}:`, notificationError)
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
