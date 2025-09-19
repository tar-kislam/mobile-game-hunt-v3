"use client"

import { useState, useEffect, useCallback, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Bell, 
  BellRing, 
  Check, 
  CheckCheck, 
  Trash2, 
  Trophy, 
  Rocket, 
  UserPlus, 
  MessageCircle, 
  ThumbsUp,
  Zap,
  Star,
  Shield,
  Gamepad2,
  Eye,
  EyeOff,
  Filter,
  ChevronDown
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'
import { LazyShuffle } from '@/components/LazyComponents'
import { useNotifications } from '@/hooks/useNotifications'

// Function to get appropriate icon for notification type
function getNotificationIcon(type: string, icon?: string) {
  if (icon === 'trophy' || type === 'LEVEL_UP') {
    return <Trophy className="h-5 w-5 text-yellow-500" />
  }
  if (icon === 'rocket') {
    return <Rocket className="h-5 w-5 text-blue-500" />
  }
  
  switch (type) {
    case 'badge':
      return <Shield className="h-5 w-5 text-yellow-500" />
    case 'xp':
      return <Zap className="h-5 w-5 text-blue-500" />
    case 'level_up':
    case 'LEVEL_UP':
      return <Trophy className="h-5 w-5 text-yellow-500" />
    case 'follow':
      return <UserPlus className="h-5 w-5 text-green-500" />
    case 'comment':
      return <MessageCircle className="h-5 w-5 text-blue-500" />
    case 'vote':
      return <ThumbsUp className="h-5 w-5 text-purple-500" />
    case 'system':
      return <Bell className="h-5 w-5 text-gray-500" />
    default:
      return <Bell className="h-5 w-5 text-gray-500" />
  }
}

// Function to format notification message based on type and metadata
function formatNotificationMessage(notification: any): string {
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

export default function NotificationsPage() {
  const { data: session } = useSession()
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [filter, setFilter] = useState<'all' | 'unread' | 'badge' | 'follow' | 'xp'>('all')
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const loadMoreRef = useRef<HTMLDivElement | null>(null)
  const { notifications, unreadCount, markAsRead, markAllAsRead, loading, refreshNotifications } = useNotifications()

  const loadMore = async () => {
    if (isLoadingMore || !hasMore) return
    
    setIsLoadingMore(true)
    try {
      // For now, we'll use the hook's refresh function
      // In a real implementation, you'd want to implement pagination in the hook
      await refreshNotifications()
      setPage(prev => prev + 1)
      
      // Disable infinite scroll after loading more to prevent excessive API calls
      if (page >= 3) { // Limit to 3 pages to prevent excessive loading
        setHasMore(false)
      }
    } catch (error) {
      console.error('Error loading more notifications:', error)
    } finally {
      setIsLoadingMore(false)
    }
  }

  // Filter notifications based on selected filter
  const filteredNotifications = notifications.filter(notification => {
    switch (filter) {
      case 'unread':
        return !notification.read
      case 'badge':
        return notification.type === 'badge'
      case 'follow':
        return notification.type === 'follow'
      case 'xp':
        return notification.type === 'xp' || notification.type === 'level_up' || notification.type === 'LEVEL_UP'
      default:
        return true
    }
  })

  // Infinite scroll setup
  const setupInfiniteScroll = useCallback(() => {
    if (observerRef.current) {
      observerRef.current.disconnect()
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
          loadMore()
        }
      },
      { threshold: 0.5 } // Increased threshold to reduce frequency
    )

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current)
    }
  }, [hasMore, isLoadingMore])

  useEffect(() => {
    setupInfiniteScroll()
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [setupInfiniteScroll])

  const getFilterLabel = (filterType: string) => {
    switch (filterType) {
      case 'all': return 'All'
      case 'unread': return 'Unread'
      case 'badge': return 'Badges'
      case 'follow': return 'Follows'
      case 'xp': return 'XP'
      default: return 'All'
    }
  }

  if (!session?.user?.id) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Sign in required</h2>
            <p className="text-gray-600">Please sign in to view your notifications.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const totalNotifications = notifications.length
  const readCount = totalNotifications - unreadCount

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center mb-4">
            <BellRing className="h-8 w-8 text-purple-400 mr-3" />
            <LazyShuffle
              text="Notifications"
              shuffleDirection="right"
              duration={0.35}
              animationMode="evenodd"
              shuffleTimes={1}
              ease="power3.out"
              stagger={0.03}
              threshold={0.1}
              loop={true}
              loopDelay={3}
              className="text-4xl font-bold text-foreground"
            />
      </div>
          <p className="text-lg text-muted-foreground">
            Stay updated with your latest activity
          </p>
        </motion.div>

        {/* Filter Dropdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex justify-center mb-6"
        >
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="bg-card border-border hover:bg-accent hover:text-accent-foreground"
              >
                <Filter className="h-4 w-4 mr-2" />
                {getFilterLabel(filter)}
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-card border-border">
              <DropdownMenuItem 
                onClick={() => setFilter('all')}
                className="text-card-foreground hover:bg-accent hover:text-accent-foreground"
              >
                All
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setFilter('unread')}
                className="text-card-foreground hover:bg-accent hover:text-accent-foreground"
              >
                Unread
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setFilter('badge')}
                className="text-card-foreground hover:bg-accent hover:text-accent-foreground"
              >
                Badges
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setFilter('follow')}
                className="text-card-foreground hover:bg-accent hover:text-accent-foreground"
              >
                Follows
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setFilter('xp')}
                className="text-card-foreground hover:bg-accent hover:text-accent-foreground"
              >
                XP
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </motion.div>

        {/* Bento Grid - Top Row with 3 Small Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
        >
          {/* Total Notifications Card */}
          <Card className="group hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-purple-500/10 group-hover:bg-purple-500/20 transition-colors">
                    <Bell className="h-5 w-5 text-purple-400" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-card-foreground">{totalNotifications}</div>
                    <div className="text-sm text-muted-foreground">Total</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Unread Notifications Card */}
          <Card className="group hover:shadow-lg hover:shadow-red-500/20 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-red-500/10 group-hover:bg-red-500/20 transition-colors">
                    <EyeOff className="h-5 w-5 text-red-400" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-card-foreground">{unreadCount}</div>
                    <div className="text-sm text-muted-foreground">Unread</div>
            </div>
          </div>
                    </div>
            </CardContent>
          </Card>

          {/* Read Notifications Card */}
          <Card className="group hover:shadow-lg hover:shadow-green-500/20 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-green-500/10 group-hover:bg-green-500/20 transition-colors">
                    <Eye className="h-5 w-5 text-green-400" />
                    </div>
                  <div>
                    <div className="text-2xl font-bold text-card-foreground">{readCount}</div>
                    <div className="text-sm text-muted-foreground">Read</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Actions */}
        {unreadCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex justify-center mb-6"
          >
            <Button
              onClick={markAllAsRead}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <CheckCheck className="h-4 w-4 mr-2" />
              Mark All as Read
            </Button>
          </motion.div>
        )}

        {/* Recent Notifications - Large Bento Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-semibold text-card-foreground flex items-center">
                <BellRing className="h-5 w-5 text-purple-400 mr-2" />
                Recent Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <AnimatePresence>
                {loading && filteredNotifications.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading notifications...</p>
                  </div>
                ) : filteredNotifications.length === 0 ? (
                  <div className="text-center py-8">
                    <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-card-foreground mb-2">No notifications found</h3>
                    <p className="text-muted-foreground">
                      {filter === 'all' 
                        ? "You'll see notifications here when someone follows you or interacts with your content."
                        : `No ${getFilterLabel(filter).toLowerCase()} notifications found.`
                      }
                    </p>
                  </div>
                ) : (
                  filteredNotifications.map((notification, index) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card 
                        className={`group hover:scale-[1.02] hover:shadow-lg hover:shadow-purple-500/30 transition-all duration-300 ${
                          !notification.read 
                            ? 'shadow-lg shadow-purple-500/20' 
                            : 'hover:shadow-purple-500/10'
                        }`}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start space-x-3">
                            {/* Left: Icon */}
                            <div className="flex-shrink-0 mt-1">
                              <div className="p-2 rounded-lg bg-purple-500/10 group-hover:bg-purple-500/20 transition-colors">
                                {getNotificationIcon(notification.type, notification.icon)}
                              </div>
                            </div>
                            
                            {/* Center: Message */}
                            <div className="flex-1 min-w-0">
                              {notification.title && (
                                <h4 className={`text-sm font-medium mb-1 ${
                                  !notification.read ? 'text-card-foreground' : 'text-muted-foreground'
                                }`}>
                                  {notification.title}
                                </h4>
                              )}
                              <p 
                                className={`text-sm mb-2 cursor-default ${
                                  !notification.read ? 'text-card-foreground font-medium' : 'text-muted-foreground'
                                }`}
                                title={formatNotificationMessage(notification)}
                              >
                                {formatNotificationMessage(notification).length > 60 
                                  ? `${formatNotificationMessage(notification).substring(0, 60)}...`
                                  : formatNotificationMessage(notification)
                                }
                              </p>
                              
                              {/* Bottom: Date */}
                              <p className="text-xs text-muted-foreground">
                                {new Date(notification.createdAt).toLocaleString()}
                              </p>
                            </div>
                            
                            {/* Right: Status Indicator */}
                            <div className="flex-shrink-0 flex items-center">
                              {!notification.read ? (
                                <div className="w-3 h-3 bg-purple-500 rounded-full shadow-lg shadow-purple-500/50 animate-pulse" />
                              ) : (
                                <div className="p-1 rounded-full bg-green-500/20">
                                  <Check className="h-3 w-3 text-green-400" />
            </div>
          )}
                            </div>
                          </div>
                          
                          {/* Mark as Read Button (only for unread notifications) */}
                          {!notification.read && (
                            <div className="mt-3 flex justify-end">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => markAsRead(notification.id)}
                                className="text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 rounded-lg text-xs"
                              >
                                <Check className="h-3 w-3 mr-1" />
                                Mark as Read
                              </Button>
            </div>
          )}
        </CardContent>
      </Card>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>

              {/* Load More Button / Infinite Scroll */}
              {hasMore && filteredNotifications.length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-center pt-4"
                >
                  <div ref={loadMoreRef} className="w-full flex justify-center">
                    <Button
                      onClick={loadMore}
                      disabled={isLoadingMore}
                      className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium px-8 py-3 rounded-full shadow-lg hover:shadow-purple-500/30 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                      {isLoadingMore ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2"></div>
                          Loading...
                        </>
                      ) : (
                        <>
                          <BellRing className="h-4 w-4 mr-2" />
                          Load More
                        </>
                      )}
                    </Button>
      </div>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}