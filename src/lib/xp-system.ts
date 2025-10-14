import { prisma } from './prisma'

// XP Action Constants
export const XP_ACTIONS = {
  POST_CREATED: 'POST_CREATED',
  POST_LIKED: 'POST_LIKED',
  POST_UNLIKED: 'POST_UNLIKED',
  POST_SHARED: 'POST_SHARED',
  COMMENT_CREATED: 'COMMENT_CREATED',
  COMMENT_DELETED: 'COMMENT_DELETED',
  REPLY_CREATED: 'REPLY_CREATED',
  REPLY_DELETED: 'REPLY_DELETED',
  LOGIN_DAILY: 'LOGIN_DAILY',
  BADGE_UNLOCKED: 'BADGE_UNLOCKED',
} as const

// XP Values Matrix
export const XP_VALUES = {
  [XP_ACTIONS.POST_CREATED]: 20,
  [XP_ACTIONS.POST_LIKED]: 5,
  [XP_ACTIONS.POST_UNLIKED]: -5,
  [XP_ACTIONS.POST_SHARED]: 10,
  [XP_ACTIONS.COMMENT_CREATED]: 10,
  [XP_ACTIONS.COMMENT_DELETED]: -10,
  [XP_ACTIONS.REPLY_CREATED]: 5,
  [XP_ACTIONS.REPLY_DELETED]: -5,
  [XP_ACTIONS.LOGIN_DAILY]: 2,
  [XP_ACTIONS.BADGE_UNLOCKED]: 0, // Badges don't give XP directly
} as const

// Badge Definitions
export const BADGE_DEFINITIONS = {
  FIRST_POST: {
    key: 'FIRST_POST',
    name: 'First Post',
    description: 'Created your first post',
    icon: '📝',
    category: 'milestone',
  },
  POST_MASTER: {
    key: 'POST_MASTER',
    name: 'Post Master',
    description: 'Created 10 posts',
    icon: '📚',
    category: 'milestone',
  },
  COMMUNITY_CONTRIBUTOR: {
    key: 'COMMUNITY_CONTRIBUTOR',
    name: 'Community Contributor',
    description: 'Reached 1000 total XP',
    icon: '🌟',
    category: 'milestone',
  },
  SOCIAL_BUTTERFLY: {
    key: 'SOCIAL_BUTTERFLY',
    name: 'Social Butterfly',
    description: 'Given 100 likes',
    icon: '💖',
    category: 'social',
  },
  SHARING_IS_CARING: {
    key: 'SHARING_IS_CARING',
    name: 'Sharing is Caring',
    description: 'Shared 10 posts',
    icon: '📤',
    category: 'social',
  },
  COMMENTATOR: {
    key: 'COMMENTATOR',
    name: 'Commentator',
    description: 'Created 50 comments',
    icon: '💬',
    category: 'social',
  },
  LEVEL_5_LEGEND: {
    key: 'LEVEL_5_LEGEND',
    name: 'Level 5 Legend',
    description: 'Reached level 5',
    icon: '🏆',
    category: 'milestone',
  },
  LEVEL_10_CHAMPION: {
    key: 'LEVEL_10_CHAMPION',
    name: 'Level 10 Champion',
    description: 'Reached level 10',
    icon: '👑',
    category: 'milestone',
  },
  DAILY_LOGIN: {
    key: 'DAILY_LOGIN',
    name: 'Daily Dedication',
    description: 'Logged in for 7 consecutive days',
    icon: '📅',
    category: 'dedication',
  },
} as const

// Level calculation function
export function calculateLevel(totalXp: number): number {
  if (totalXp < 0) return 1
  return Math.floor(Math.sqrt(totalXp / 100)) + 1
}

// Get XP required for next level
export function getXpForNextLevel(currentLevel: number): number {
  const nextLevelXp = Math.pow(currentLevel, 2) * 100
  const currentLevelXp = Math.pow(currentLevel - 1, 2) * 100
  return nextLevelXp - currentLevelXp
}

// Get XP progress for current level
export function getXpProgress(currentXp: number, currentLevel: number): {
  currentLevelXp: number
  nextLevelXp: number
  progress: number
  xpNeeded: number
} {
  const currentLevelXp = Math.pow(currentLevel - 1, 2) * 100
  const nextLevelXp = Math.pow(currentLevel, 2) * 100
  const progress = ((currentXp - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100
  const xpNeeded = nextLevelXp - currentXp

  return {
    currentLevelXp,
    nextLevelXp,
    progress: Math.max(0, Math.min(100, progress)),
    xpNeeded: Math.max(0, xpNeeded),
  }
}

// Add XP for an action
export async function addXp(
  userId: string,
  action: keyof typeof XP_ACTIONS,
  referenceId?: string,
  customXpAmount?: number
): Promise<{ success: boolean; xpDelta: number; message?: string }> {
  try {
    const xpDelta = customXpAmount !== undefined ? customXpAmount : XP_VALUES[action]
    
    // Don't add XP if the amount is 0 (but allow custom amounts even if action default is 0)
    if (xpDelta === 0 && customXpAmount === undefined) {
      return { success: true, xpDelta: 0 }
    }

    // Check if this exact action already exists and is not reverted
    const existingLog = await prisma.userXpLog.findFirst({
      where: {
        userId,
        action: XP_ACTIONS[action],
        referenceId: referenceId || null,
        reverted: false,
      },
    })

    // Prevent duplicate XP for the same action
    if (existingLog) {
      return { 
        success: false, 
        xpDelta: 0, 
        message: 'XP already awarded for this action' 
      }
    }

    // Create XP log entry
    await prisma.userXpLog.create({
      data: {
        userId,
        action: XP_ACTIONS[action],
        xpDelta,
        referenceId: referenceId || null,
      },
    })

    // Recalculate user's total XP and level
    await recalculateUserXp(userId)

    return { success: true, xpDelta }
  } catch (error) {
    console.error('Error adding XP:', error)
    return { success: false, xpDelta: 0, message: 'Failed to add XP' }
  }
}

// Remove XP by reverting a specific action
export async function removeXp(
  userId: string,
  action: keyof typeof XP_ACTIONS,
  referenceId?: string
): Promise<{ success: boolean; xpDelta: number; message?: string }> {
  try {
    // Find the XP log entry to revert
    const existingLog = await prisma.userXpLog.findFirst({
      where: {
        userId,
        action: XP_ACTIONS[action],
        referenceId: referenceId || null,
        reverted: false,
      },
    })

    if (!existingLog) {
      return { 
        success: false, 
        xpDelta: 0, 
        message: 'No XP found to remove for this action' 
      }
    }

    // Mark the log entry as reverted
    await prisma.userXpLog.update({
      where: { id: existingLog.id },
      data: { reverted: true },
    })

    // Recalculate user's total XP and level
    await recalculateUserXp(userId)

    return { success: true, xpDelta: -existingLog.xpDelta }
  } catch (error) {
    console.error('Error removing XP:', error)
    return { success: false, xpDelta: 0, message: 'Failed to remove XP' }
  }
}

// Recalculate user's total XP and level
export async function recalculateUserXp(userId: string): Promise<void> {
  try {
    // Get sum of all non-reverted XP changes
    const xpResult = await prisma.userXpLog.aggregate({
      where: {
        userId,
        reverted: false,
      },
      _sum: {
        xpDelta: true,
      },
    })

    const totalXp = Math.max(0, xpResult._sum.xpDelta || 0) // Ensure XP never goes below 0
    const newLevel = calculateLevel(totalXp)

    // Update user's XP and level
    await prisma.user.update({
      where: { id: userId },
      data: {
        xp: totalXp,
        level: newLevel,
      },
    })

    // Check for badge unlocks after XP change
    await checkAndAwardBadges(userId)
  } catch (error) {
    console.error('Error recalculating user XP:', error)
  }
}

// Check and award badges based on user's current stats
export async function checkAndAwardBadges(userId: string): Promise<string[]> {
  const newlyAwardedBadges: string[] = []

  try {
    // Get user's current stats
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        posts: true,
        likes: true,
        postComments: true,
        badges: true,
      },
    })

    if (!user) return newlyAwardedBadges

    const stats = {
      totalXp: user.xp,
      totalLevel: user.level,
      postCount: user.posts.length,
      likesGiven: user.likes.length,
      commentCount: user.postComments.length,
      existingBadges: user.badges.map(b => b.badgeKey),
    }

    // Check each badge definition
    for (const [key, definition] of Object.entries(BADGE_DEFINITIONS)) {
      // Skip if user already has this badge
      if (stats.existingBadges.includes(definition.key)) continue

      let shouldAward = false

      switch (definition.key) {
        case 'FIRST_POST':
          shouldAward = stats.postCount >= 1
          break
        case 'POST_MASTER':
          shouldAward = stats.postCount >= 10
          break
        case 'COMMUNITY_CONTRIBUTOR':
          shouldAward = stats.totalXp >= 1000
          break
        case 'SOCIAL_BUTTERFLY':
          shouldAward = stats.likesGiven >= 100
          break
        case 'SHARING_IS_CARING':
          // This would need to be tracked separately - for now skip
          break
        case 'COMMENTATOR':
          shouldAward = stats.commentCount >= 50
          break
        case 'LEVEL_5_LEGEND':
          shouldAward = stats.totalLevel >= 5
          break
        case 'LEVEL_10_CHAMPION':
          shouldAward = stats.totalLevel >= 10
          break
        case 'DAILY_LOGIN':
          // This would need daily login tracking - for now skip
          break
      }

      if (shouldAward) {
        // Award the badge
        await prisma.userBadge.create({
          data: {
            userId,
            badgeKey: definition.key,
          },
        })

        newlyAwardedBadges.push(definition.key)

        // Add XP log entry for badge unlock (0 XP)
        await prisma.userXpLog.create({
          data: {
            userId,
            action: XP_ACTIONS.BADGE_UNLOCKED,
            xpDelta: 0,
            referenceId: definition.key,
          },
        })
      }
    }

    // Ensure badge definitions exist in database
    await ensureBadgeDefinitionsExist()

  } catch (error) {
    console.error('Error checking and awarding badges:', error)
  }

  return newlyAwardedBadges
}

// Ensure all badge definitions exist in the database
export async function ensureBadgeDefinitionsExist(): Promise<void> {
  try {
    for (const [key, definition] of Object.entries(BADGE_DEFINITIONS)) {
      await prisma.badgeDefinition.upsert({
        where: { key: definition.key },
        update: {
          name: definition.name,
          description: definition.description,
          icon: definition.icon,
          category: definition.category,
        },
        create: {
          key: definition.key,
          name: definition.name,
          description: definition.description,
          icon: definition.icon,
          category: definition.category,
        },
      })
    }
  } catch (error) {
    console.error('Error ensuring badge definitions exist:', error)
  }
}

// Get user's XP history
export async function getUserXpHistory(
  userId: string,
  limit: number = 20,
  offset: number = 0
) {
  try {
    const xpLogs = await prisma.userXpLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    })

    return xpLogs
  } catch (error) {
    console.error('Error getting user XP history:', error)
    return []
  }
}

// Get user's badges
export async function getUserBadges(userId: string) {
  try {
    const badges = await prisma.userBadge.findMany({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
          },
        },
      },
      orderBy: { earnedAt: 'desc' },
    })

    return badges
  } catch (error) {
    console.error('Error getting user badges:', error)
    return []
  }
}

// Get leaderboard by XP
export async function getXpLeaderboard(limit: number = 10) {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        username: true,
        image: true,
        xp: true,
        level: true,
      },
      orderBy: [
        { xp: 'desc' },
        { createdAt: 'asc' }, // Tiebreaker for same XP
      ],
      take: limit,
    })

    return users
  } catch (error) {
    console.error('Error getting XP leaderboard:', error)
    return []
  }
}

// Handle like/unlike with XP
export async function handleLikeAction(
  userId: string,
  postId: string,
  isLiked: boolean
): Promise<{ success: boolean; xpDelta: number; message?: string }> {
  try {
    if (isLiked) {
      // User is liking the post
      return await addXp(userId, 'POST_LIKED', postId)
    } else {
      // User is unliking the post
      return await removeXp(userId, 'POST_LIKED', postId)
    }
  } catch (error) {
    console.error('Error handling like action:', error)
    return { success: false, xpDelta: 0, message: 'Failed to process like action' }
  }
}

// Handle post creation with XP
export async function handlePostCreation(userId: string, postId: string) {
  return await addXp(userId, 'POST_CREATED', postId)
}

// Handle post deletion with XP
export async function handlePostDeletion(userId: string, postId: string) {
  return await removeXp(userId, 'POST_CREATED', postId)
}

// Handle share action with XP
export async function handleShareAction(userId: string, postId: string) {
  return await addXp(userId, 'POST_SHARED', postId)
}
