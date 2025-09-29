"use client"

import { useState } from 'react'
import { Bell, BellRing, Trophy, Rocket, UserPlus, MessageCircle, ThumbsUp, Zap, Star, Shield, Gamepad2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { useNotifications } from '@/hooks/useNotifications'

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

interface NotificationBellProps {
  className?: string
}

// Function to format notification message based on type and metadata
function formatNotificationMessage(notification: Notification) {
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
      return notification.message || '🔔 System notification'
  }
}

// Function to get appropriate icon for notification type
function getNotificationIcon(type: string, icon?: string) {
  // Handle custom icons first
  if (icon === 'trophy' || type === 'LEVEL_UP') {
    return <Trophy className="h-4 w-4 text-yellow-500" />
  }
  if (icon === 'rocket') {
    return <Rocket className="h-4 w-4 text-blue-500" />
  }
  
  // Handle new notification types
  switch (type) {
    case 'badge':
      return <Shield className="h-4 w-4 text-yellow-500" />
    case 'xp':
      return <Zap className="h-4 w-4 text-blue-500" />
    case 'level_up':
    case 'LEVEL_UP':
      return <Trophy className="h-4 w-4 text-yellow-500" />
    case 'follow':
      return <UserPlus className="h-4 w-4 text-green-500" />
    case 'vote':
      return <ThumbsUp className="h-4 w-4 text-purple-500" />
    case 'comment':
      return <MessageCircle className="h-4 w-4 text-blue-500" />
    case 'system':
      return <Bell className="h-4 w-4 text-gray-500" />
    case 'welcome':
      return <Gamepad2 className="h-4 w-4 text-green-500" />
    case 'milestone':
      return <Star className="h-4 w-4 text-yellow-500" />
    case 'progress':
      return <Zap className="h-4 w-4 text-blue-500" />
    case 'achievement':
      return <Trophy className="h-4 w-4 text-yellow-500" />
    case 'reminder':
      return <Bell className="h-4 w-4 text-orange-500" />
    default:
      return <Bell className="h-4 w-4 text-gray-500" />
  }
}

export function NotificationBell({ className }: NotificationBellProps) {
  const { data: session } = useSession()
  const { notifications, unreadCount, markAsRead, markAllAsRead, isDropdownOpen, setIsDropdownOpen } = useNotifications()

  // Don't show for unauthenticated users
  if (!session?.user?.id) {
    return null
  }

  return (
    <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={`relative p-2 hover:bg-purple-500/10 transition-colors ${className}`}
        >
          <motion.div
            animate={unreadCount > 0 ? { scale: [1, 1.1, 1] } : {}}
            transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
          >
            {unreadCount > 0 ? (
              <BellRing className="h-5 w-5 text-purple-400" />
            ) : (
              <Bell className="h-5 w-5 text-gray-400" />
            )}
          </motion.div>
          
          {unreadCount > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1"
            >
              <Badge 
                variant="destructive" 
                className="h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs font-bold bg-red-500 hover:bg-red-500"
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </Badge>
            </motion.div>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent 
        align="end" 
        className="w-80 bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 shadow-2xl"
      >
        <div className="p-3 border-b border-slate-700/50">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-white">Notifications</h3>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                className="text-xs text-purple-400 hover:text-purple-300"
              >
                Mark all read
              </Button>
            )}
          </div>
        </div>

        <div className="max-h-96 overflow-y-auto">
          <AnimatePresence>
            {notifications.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-4 text-center text-gray-400"
              >
                No notifications yet
              </motion.div>
            ) : (
              // Sort notifications by newest first (createdAt desc)
              [...notifications]
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .slice(0, 5)
                .map((notification, index) => (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <DropdownMenuItem
                      className={`p-3 cursor-pointer hover:bg-purple-500/10 ${
                        !notification.read ? 'bg-purple-500/5' : ''
                      }`}
                      onClick={() => markAsRead(notification.id)}
                    >
                      <div className="flex items-start space-x-3 flex-1">
                        <div className="flex-shrink-0 mt-0.5">
                          {getNotificationIcon(notification.type, notification.icon)}
                        </div>
                        <div className="flex-1 space-y-1 min-w-0">
                          {notification.title && (
                            <p className={`text-sm font-medium ${!notification.read ? 'text-white' : 'text-gray-300'}`}>
                              {notification.title}
                            </p>
                          )}
                          <p className={`text-sm ${!notification.read ? 'text-white font-medium' : 'text-gray-300'}`}>
                            {formatNotificationMessage(notification)}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(notification.createdAt).toLocaleString()}
                          </p>
                        </div>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-purple-500 rounded-full flex-shrink-0 mt-2" />
                        )}
                      </div>
                    </DropdownMenuItem>
                  </motion.div>
                ))
            )}
          </AnimatePresence>
        </div>

        <DropdownMenuSeparator className="bg-slate-700/50" />
        
        <DropdownMenuItem asChild>
          <Link 
            href="/notifications" 
            className="p-3 text-center text-purple-400 hover:text-purple-300 hover:bg-purple-500/10"
          >
            View all notifications
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}