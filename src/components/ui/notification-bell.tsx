"use client"

import { useState } from "react"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"
import useSWR from 'swr'
import { formatDistanceToNow } from "date-fns"

interface Notification {
  id: string
  type: string
  message: string
  postId?: string
  isRead: boolean
  createdAt: string
  user: {
    id: string
    name: string
    image?: string
  }
}

interface NotificationData {
  notifications: Notification[]
  unreadCount: number
}

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false)
  
  const fetcher = (url: string) => fetch(url).then(r => r.json())
  
  const { data: notificationData, mutate } = useSWR<NotificationData>(
    '/api/notifications?limit=5',
    fetcher,
    {
      refreshInterval: 30000, // Refresh every 30 seconds
      revalidateOnFocus: true
    }
  )

  const handleNotificationClick = async (notificationId: string) => {
    try {
      await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId })
      })
      
      // Refresh notifications
      mutate()
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const getNotificationLink = (notification: Notification) => {
    if (notification.postId) {
      return `/community/post/${notification.postId}`
    }
    return '/community'
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'like':
        return '❤️'
      case 'comment':
        return '💬'
      case 'follow':
        return '👥'
      default:
        return '🔔'
    }
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="relative h-9 w-9 rounded-full hover:bg-purple-500/10 hover:text-purple-400 transition-all duration-200"
        >
          <Bell className="h-5 w-5" />
          {notificationData?.unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-purple-500 hover:bg-purple-600"
            >
              {notificationData.unreadCount > 9 ? '9+' : notificationData.unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent 
        className="w-80 rounded-2xl shadow-lg border-gray-700 bg-gray-900/95 backdrop-blur-sm" 
        align="end"
        sideOffset={8}
      >
        <Card className="border-0 bg-transparent shadow-none">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
              <Bell className="h-5 w-5 text-purple-400" />
              Notifications
              {notificationData?.unreadCount > 0 && (
                <Badge variant="secondary" className="bg-purple-500/20 text-purple-300 border-purple-500/30 text-xs">
                  {notificationData.unreadCount} new
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          
          <CardContent className="p-0">
            <div className="max-h-80 overflow-y-auto">
              {!notificationData?.notifications || notificationData.notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
                  <div className="text-4xl mb-2">🎉</div>
                  <p className="text-gray-300 font-medium">You're all caught up!</p>
                  <p className="text-gray-500 text-sm">No new notifications</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {notificationData.notifications.map((notification, index) => (
                    <div key={notification.id}>
                      <Link
                        href={getNotificationLink(notification)}
                        onClick={() => handleNotificationClick(notification.id)}
                        className={`block p-3 hover:bg-purple-500/10 transition-colors duration-200 ${
                          !notification.isRead ? 'bg-purple-500/5 border-l-2 border-purple-500' : ''
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="text-lg flex-shrink-0 mt-0.5">
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium ${
                              !notification.isRead ? 'text-white' : 'text-gray-300'
                            }`}>
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                            </p>
                          </div>
                          {!notification.isRead && (
                            <div className="w-2 h-2 bg-purple-500 rounded-full flex-shrink-0 mt-2"></div>
                          )}
                        </div>
                      </Link>
                      {index < notificationData.notifications.length - 1 && (
                        <Separator className="bg-gray-700" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {notificationData?.notifications && notificationData.notifications.length > 0 && (
              <>
                <Separator className="bg-gray-700" />
                <div className="p-3">
                  <Link
                    href="/notifications"
                    className="block w-full text-center text-sm text-purple-400 hover:text-purple-300 transition-colors duration-200"
                    onClick={() => setIsOpen(false)}
                  >
                    View all notifications
                  </Link>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
