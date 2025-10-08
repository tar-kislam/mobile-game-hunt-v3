import { prisma } from '@/lib/prisma'

export type NotificationType = 'welcome' | 'milestone' | 'progress' | 'achievement' | 'reminder' | 'xp' | 'level_up' | 'badge_unlocked' | 'badge_claimed' | 'badge' | 'follow' | 'vote' | 'system'

export interface NotificationMetadata {
  badgeId?: string
  badgeName?: string
  xpReward?: number
  xpAmount?: number
  oldLevel?: number
  newLevel?: number
  followerId?: string
  followedId?: string
  productId?: string
  fromUserId?: string
  [key: string]: any
}

/**
 * Notification Service - Handles user notifications
 * 
 * This service provides helper functions for creating and managing user notifications
 * with real-time updates and proper database integration.
 */

/**
 * Create a new notification for a user with idempotency check
 * 
 * @param userId - User ID to send notification to
 * @param message - Notification message
 * @param type - Type of notification
 * @param metadata - Additional metadata for the notification
 * @param title - Optional title for the notification
 * @param link - Optional link for the notification
 * @param icon - Optional icon for the notification
 * @returns Created notification or existing notification if duplicate
 */
export async function notify(
  userId: string, 
  message: string, 
  type: NotificationType,
  metadata?: NotificationMetadata,
  title?: string,
  link?: string,
  icon?: string
): Promise<{
  id: string
  userId: string
  message: string
  type: string
  read: boolean
  createdAt: Date
  meta?: any
  title?: string
  link?: string
  icon?: string
}> {
  try {
    if (!(prisma as any).notification) {
      // Notifications table not available; return a synthetic object
      const now = new Date()
      console.warn('[NOTIFICATION] prisma.notification is undefined. Returning synthetic notification.')
      return { id: 'synthetic', userId, message, type, read: false, createdAt: now }
    }
    // Check for existing welcome notification to prevent duplicates
    if (type === 'welcome') {
      const existingWelcome = await (prisma as any).notification.findFirst({
        where: {
          userId,
          type: 'welcome'
        }
      })

      if (existingWelcome) {
        console.log(`[NOTIFICATION] Welcome notification already exists for user ${userId}, skipping`)
        return existingWelcome
      }
    }

    const notification = await (prisma as any).notification.create({
      data: {
        userId,
        message,
        type,
        title: title || null,
        meta: metadata || null,
        link: link || null,
        icon: icon || null,
        read: false
      }
    })

    console.log(`[NOTIFICATION] Created ${type} notification for user ${userId}: ${message}`)
    
    // Emit real-time event for client-side updates
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('notification-created', {
        detail: { 
          userId, 
          notification: {
            id: notification.id,
            type,
            message,
            title,
            meta: metadata,
            link,
            icon,
            read: false,
            createdAt: notification.createdAt
          }
        }
      }))
    }

    // Also emit a more specific event for immediate UI updates
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('new-notification', {
        detail: {
          notification: {
            id: notification.id,
            type,
            message,
            title,
            meta: metadata,
            link,
            icon,
            read: false,
            createdAt: notification.createdAt
          }
        }
      }))
    }

    return notification
  } catch (error) {
    console.error('[NOTIFICATION] Error creating notification:', error)
    throw error
  }
}

/**
 * Get notifications for a user
 * 
 * @param userId - User ID to get notifications for
 * @param limit - Maximum number of notifications to return (default: 10)
 * @returns Array of notifications
 */
export async function getUserNotifications(
  userId: string, 
  limit: number = 10
): Promise<Array<{
  id: string
  message: string
  type: string
  read: boolean
  createdAt: Date
}>> {
  try {
    if (!(prisma as any).notification) {
      console.warn('[NOTIFICATION] prisma.notification is undefined. Returning empty list.')
      return []
    }
    const notifications = await (prisma as any).notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true,
        message: true,
        type: true,
        read: true,
        createdAt: true
      }
    })

    return notifications
  } catch (error) {
    console.error('[NOTIFICATION] Error getting user notifications:', error)
    throw error
  }
}

/**
 * Get unread notification count for a user
 * 
 * @param userId - User ID to get count for
 * @returns Number of unread notifications
 */
export async function getUnreadCount(userId: string): Promise<number> {
  try {
    if (!(prisma as any).notification) {
      console.warn('[NOTIFICATION] prisma.notification is undefined. Returning 0 count.')
      return 0
    }
    const count = await (prisma as any).notification.count({
      where: {
        userId,
        read: false
      }
    })

    return count
  } catch (error) {
    console.error('[NOTIFICATION] Error getting unread count:', error)
    throw error
  }
}

/**
 * Mark notification as read
 * 
 * @param notificationId - Notification ID to mark as read
 * @returns Updated notification
 */
export async function markAsRead(notificationId: string): Promise<{
  id: string
  read: boolean
}> {
  try {
    if (!(prisma as any).notification) {
      console.warn('[NOTIFICATION] prisma.notification is undefined. Returning synthetic read state.')
      return { id: notificationId, read: true }
    }
    const notification = await (prisma as any).notification.update({
      where: { id: notificationId },
      data: { read: true },
      select: { id: true, read: true }
    })

    return notification
  } catch (error) {
    console.error('[NOTIFICATION] Error marking notification as read:', error)
    throw error
  }
}

/**
 * Mark all notifications as read for a user
 * 
 * @param userId - User ID to mark all notifications as read
 * @returns Number of notifications marked as read
 */
export async function markAllAsRead(userId: string): Promise<number> {
  try {
    if (!(prisma as any).notification) {
      console.warn('[NOTIFICATION] prisma.notification is undefined. Returning 0 updated.')
      return 0
    }
    const result = await (prisma as any).notification.updateMany({
      where: {
        userId,
        read: false
      },
      data: { read: true }
    })

    console.log(`[NOTIFICATION] Marked ${result.count} notifications as read for user ${userId}`)
    return result.count
  } catch (error) {
    console.error('[NOTIFICATION] Error marking all notifications as read:', error)
    throw error
  }
}

/**
 * Get notification icon based on type
 * 
 * @param type - Notification type
 * @returns Icon emoji
 */
export function getNotificationIcon(type: NotificationType): string {
  const icons: Record<NotificationType, string> = {
    welcome: '🎉',
    milestone: '🕹️',
    progress: '⚡️',
    achievement: '🏆',
    reminder: '👋',
    xp: '⚡️',
    level_up: '🏆',
    badge_unlocked: '🎖️',
    badge_claimed: '🎉',
    badge: '🎖️',
    follow: '👥',
    vote: '⭐',
    system: '🔔'
  }
  
  return icons[type] || '🔔'
}

// ===== SPECIFIC NOTIFICATION HELPERS =====

/**
 * Create a badge notification when a user earns a badge
 */
export async function notifyBadgeEarned(
  userId: string,
  badgeName: string,
  badgeId: string,
  xpReward: number
) {
  const message = `🎖️ Congratulations! You earned the "${badgeName}" badge! +${xpReward} XP`
  
  return await notify(
    userId,
    message,
    'badge',
    {
      badgeId,
      badgeName,
      xpReward
    },
    'Badge Earned!',
    '/profile#badges',
    '🎖️'
  )
}

/**
 * Create an XP progress notification when user gains XP
 */
export async function notifyXPProgress(
  userId: string,
  xpAmount: number,
  source: string = 'activity'
) {
  const message = `⚡️ +${xpAmount} XP earned from ${source}!`
  
  return await notify(
    userId,
    message,
    'xp',
    {
      xpAmount,
      source
    },
    'XP Gained!',
    '/profile',
    '⚡️'
  )
}

/**
 * Create a level up notification when user reaches a new level
 */
export async function notifyLevelUp(
  userId: string,
  oldLevel: number,
  newLevel: number
) {
  const message = `🏆 Level Up! You reached Level ${newLevel}! 🚀`
  
  return await notify(
    userId,
    message,
    'level_up',
    {
      oldLevel,
      newLevel
    },
    'Level Up!',
    '/profile',
    '🏆'
  )
}

/**
 * Create a follow notification when someone follows a user
 */
export async function notifyFollow(
  followedUserId: string,
  followerUserId: string,
  followerName: string
) {
  const message = `${followerName} started following you!`
  
  return await notify(
    followedUserId,
    message,
    'follow',
    {
      followerId: followerUserId,
      followedId: followedUserId,
      fromUserId: followerUserId
    },
    'New Follower!',
    `/@${followerName}`,
    '👥'
  )
}

/**
 * Create a vote notification when someone votes on a user's game
 */
export async function notifyVote(
  gameOwnerUserId: string,
  voterUserId: string,
  voterName: string,
  gameTitle: string,
  gameId: string
) {
  const message = `${voterName} voted on your game "${gameTitle}"! ⭐`
  
  return await notify(
    gameOwnerUserId,
    message,
    'vote',
    {
      productId: gameId,
      fromUserId: voterUserId
    },
    'New Vote!',
    `/product/${gameId}`,
    '⭐'
  )
}

/**
 * Create a system notification for general announcements
 */
export async function notifySystem(
  userId: string,
  message: string,
  title?: string,
  link?: string
) {
  return await notify(
    userId,
    message,
    'system',
    {},
    title || 'System Notification',
    link,
    '🔔'
  )
}
