import { prisma } from '@/lib/prisma'

export type NotificationType = 'welcome' | 'milestone' | 'progress' | 'achievement' | 'reminder' | 'xp' | 'level_up' | 'badge_unlocked' | 'badge_claimed'

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
 * @returns Created notification or existing notification if duplicate
 */
export async function notify(
  userId: string, 
  message: string, 
  type: NotificationType
): Promise<{
  id: string
  userId: string
  message: string
  type: string
  read: boolean
  createdAt: Date
}> {
  try {
    // Check for existing welcome notification to prevent duplicates
    if (type === 'welcome') {
      const existingWelcome = await prisma.notification.findFirst({
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

    const notification = await prisma.notification.create({
      data: {
        userId,
        message,
        type,
        read: false
      }
    })

    console.log(`[NOTIFICATION] Created ${type} notification for user ${userId}: ${message}`)
    
    // Emit real-time event (placeholder for now - can be enhanced with WebSocket/Pusher)
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('notification-created', {
        detail: { userId, notification }
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
    const notifications = await prisma.notification.findMany({
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
    const count = await prisma.notification.count({
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
    const notification = await prisma.notification.update({
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
    const result = await prisma.notification.updateMany({
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
    badge_claimed: '🎉'
  }
  
  return icons[type] || '🔔'
}
