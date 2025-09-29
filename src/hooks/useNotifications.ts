"use client"

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'

// Function to format notification message based on type and metadata
function formatNotificationMessage(notification: Notification): string {
  const { type, message, meta } = notification
  
  // If message is already provided, use it
  if (message) {
    return message
  }
  
  // Format message based on type and metadata
  switch (type) {
    case 'badge':
      const badgeName = meta?.badgeName || 'Badge'
      const xpReward = meta?.xpReward || 0
      return `🎖️ Badge Earned! ${badgeName} +${xpReward} XP`
    
    case 'xp':
      const xpAmount = meta?.xpAmount || 0
      return `⚡️ You gained ${xpAmount} XP!`
    
    case 'level_up':
    case 'LEVEL_UP':
      const newLevel = meta?.newLevel || 1
      return `🎉 Level Up! You reached level ${newLevel}!`
    
    case 'follow':
      const followerName = meta?.followerName || 'Someone'
      return `👥 ${followerName} started following you`
    
    case 'vote':
      return `👍 You voted for a game`
    
    case 'system':
    default:
      return message || '🔔 System notification'
  }
}

interface Notification {
  id: string
  message: string
  type: string
  read: boolean
  createdAt: string
  title?: string
  icon?: string
  meta?: any
  link?: string
}

interface UseNotificationsReturn {
  notifications: Notification[]
  unreadCount: number
  loading: boolean
  markAsRead: (id: string) => Promise<void>
  markAllAsRead: () => Promise<void>
  refreshNotifications: () => Promise<void>
  isDropdownOpen: boolean
  setIsDropdownOpen: (open: boolean) => void
}

export function useNotifications(): UseNotificationsReturn {
  const { data: session } = useSession()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [lastNotificationId, setLastNotificationId] = useState<string | null>(null)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  const fetchNotifications = useCallback(async () => {
    if (!session?.user?.id) return

    setLoading(true)
    try {
      const response = await fetch('/api/notifications?limit=20')
      const data = await response.json()
      
      if (data.notifications) {
        const newNotifications = data.notifications
        
        // Check for new notifications
        if (lastNotificationId && newNotifications.length > 0) {
          const latestNotification = newNotifications[0]
          if (latestNotification.id !== lastNotificationId) {
            // Show toast for new notification
            toast.success(latestNotification.message, {
              duration: 4000,
              position: 'top-right',
            })
          }
        }
        
        setNotifications(newNotifications)
        setUnreadCount(data.unreadCount || 0)
        
        if (newNotifications.length > 0) {
          setLastNotificationId(newNotifications[0].id)
        }
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setLoading(false)
    }
  }, [session?.user?.id, lastNotificationId])

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PATCH'
      })
      
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId ? { ...notif, read: true } : notif
        )
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }, [])

  const markAllAsRead = useCallback(async () => {
    try {
      await fetch('/api/notifications/mark-all-read', {
        method: 'PATCH'
      })
      
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, read: true }))
      )
      setUnreadCount(0)
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
    }
  }, [])

  const refreshNotifications = useCallback(async () => {
    await fetchNotifications()
  }, [fetchNotifications])

  // Handle dropdown open/close and auto-mark visible notifications as read
  const handleDropdownToggle = useCallback(async (open: boolean) => {
    setIsDropdownOpen(open)
    
    if (open && unreadCount > 0) {
      // When dropdown opens, mark all visible notifications as read
      try {
        const visibleNotificationIds = notifications
          .filter(notif => !notif.read)
          .slice(0, 5) // Only mark the first 5 visible notifications as read
          .map(notif => notif.id)
        
        if (visibleNotificationIds.length > 0) {
          await fetch('/api/notifications/mark-multiple-read', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ notificationIds: visibleNotificationIds })
          })
          
          // Update local state
          setNotifications(prev => 
            prev.map(notif => 
              visibleNotificationIds.includes(notif.id) 
                ? { ...notif, read: true } 
                : notif
            )
          )
          setUnreadCount(prev => Math.max(0, prev - visibleNotificationIds.length))
        }
      } catch (error) {
        console.error('Error marking visible notifications as read:', error)
      }
    }
  }, [unreadCount, notifications])

  useEffect(() => {
    fetchNotifications()
    
    // Polling for real-time notifications (every 30 seconds)
    const interval = setInterval(fetchNotifications, 30000)
    
    // Listen for real-time notification events
    const handleNewNotification = (event: CustomEvent) => {
      const { notification } = event.detail
      if (notification && notification.userId === session?.user?.id) {
        // Add new notification to the top of the list
        setNotifications(prev => [notification, ...prev])
        setUnreadCount(prev => prev + 1)
        
        // Show toast for new notification
        toast.success(formatNotificationMessage(notification), {
          duration: 4000,
          position: 'top-right',
        })
      }
    }

    // Add event listeners
    window.addEventListener('new-notification', handleNewNotification as EventListener)
    
    return () => {
      clearInterval(interval)
      window.removeEventListener('new-notification', handleNewNotification as EventListener)
    }
  }, [fetchNotifications, session?.user?.id])

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    refreshNotifications,
    isDropdownOpen,
    setIsDropdownOpen: handleDropdownToggle,
  }
}
