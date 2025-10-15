"use client"

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { 
  ThumbsUp, 
  Users, 
  Clock,
  Gamepad2,
  User,
  ExternalLink,
  X,
  Bell
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { AnimatePresence } from 'framer-motion'
import { useNotifications } from '@/hooks/useNotifications'

interface VotedGame {
  id: string
  title: string
  thumbnail?: string
  votesCount: number
}

interface FollowedUser {
  id: string
  name: string
  username: string
  image?: string
  type: 'user'
}

interface FollowedGame {
  id: string
  title: string
  thumbnail?: string
  type: 'game'
}


interface LastSeenProduct {
  id: string
  slug?: string
  title: string
  thumbnail?: string
  lastViewed: string
}

interface FeedSidebarProps {
  onFilterChange: (filterType: string, filterValue: string | null, displayName?: string) => void
  activeFilter: { type: string; value: string; displayName?: string } | null
}

export function FeedSidebar({ onFilterChange, activeFilter }: FeedSidebarProps) {
  const { data: session } = useSession()
  const [votedGames, setVotedGames] = useState<VotedGame[]>([])
  const [followedItems, setFollowedItems] = useState<(FollowedUser | FollowedGame)[]>([])
  const [lastSeenProducts, setLastSeenProducts] = useState<LastSeenProduct[]>([])
  const [loading, setLoading] = useState(true)
  const { notifications } = useNotifications()

  useEffect(() => {
    if (session?.user?.id) {
      fetchSidebarData()
    }
  }, [session?.user?.id])

  const fetchSidebarData = async () => {
    try {
      const [votesRes, followsRes, lastSeenRes] = await Promise.all([
        fetch('/api/feed/votes'),
        fetch('/api/feed/follows'),
        fetch('/api/feed/last-seen')
      ])

      if (votesRes.ok) {
        const votesData = await votesRes.json()
        setVotedGames(votesData.games || [])
      }

      if (followsRes.ok) {
        const followsData = await followsRes.json()
        setFollowedItems(followsData.items || [])
      }

      if (lastSeenRes.ok) {
        const lastSeenData = await lastSeenRes.json()
        setLastSeenProducts(lastSeenData.products?.slice(0, 3) || [])
      }
    } catch (error) {
      console.error('Error fetching sidebar data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterClick = (filterType: string, filterValue: string, displayName?: string) => {
    const isActive = activeFilter?.type === filterType && activeFilter?.value === filterValue
    onFilterChange(filterType, isActive ? null : filterValue, isActive ? undefined : displayName)
  }

  const clearAllFilters = () => {
    onFilterChange('', null)
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return `${Math.floor(diffInMinutes / 1440)}d ago`
  }

  if (loading) {
    return (
      <div className="w-full space-y-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="bg-slate-900/60 backdrop-blur-xl border border-slate-700/30 rounded-2xl">
            <CardHeader className="pb-3">
              <div className="h-4 bg-slate-700/50 rounded animate-pulse"></div>
            </CardHeader>
            <CardContent className="space-y-3">
              {[1, 2, 3].map((j) => (
                <div key={j} className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-slate-700/50 rounded-xl animate-pulse"></div>
                  <div className="flex-1 space-y-1">
                    <div className="h-3 bg-slate-700/50 rounded animate-pulse"></div>
                    <div className="h-2 bg-slate-700/30 rounded animate-pulse w-2/3"></div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="w-full space-y-6">
      {/* Active Filters */}
      <AnimatePresence>
        {activeFilter && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
          <Card className="bg-purple-900/20 backdrop-blur-xl border border-purple-500/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="bg-purple-500/20 text-purple-300 border-purple-400/30">
                    {activeFilter.type}: {activeFilter.displayName || activeFilter.value}
                  </Badge>
                </div>
                <button
                  onClick={clearAllFilters}
                  className="p-1 hover:bg-purple-500/10 rounded transition-colors"
                >
                  <X className="w-4 h-4 text-purple-400" />
                </button>
              </div>
            </CardContent>
          </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Votes Section */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="bg-slate-900/60 backdrop-blur-xl border border-slate-700/30 hover:border-purple-500/30 transition-all duration-300 rounded-2xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
              <ThumbsUp className="w-5 h-5 text-purple-400" />
              Votes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {votedGames.length === 0 ? (
              <p className="text-sm text-gray-400">No votes yet</p>
            ) : (
              votedGames.slice(0, 3).map((game, index) => (
                <motion.div
                  key={game.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + index * 0.05 }}
                >
                    <button
                    onClick={() => handleFilterClick('game', game.id, game.title)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 hover:bg-slate-800/50 ${
                      activeFilter?.type === 'game' && activeFilter?.value === game.id
                        ? 'bg-purple-500/20 border border-purple-400/30'
                        : 'hover:border-purple-500/20'
                    }`}
                  >
                    {game.thumbnail ? (
                      <Image
                        src={game.thumbnail}
                        alt={game.title}
                        width={32}
                        height={32}
                        className="w-8 h-8 rounded-xl object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-slate-700 rounded-xl flex items-center justify-center">
                        <Gamepad2 className="w-4 h-4 text-slate-400" />
                      </div>
                    )}
                    <div className="flex-1 text-left">
                      <p className="text-sm font-medium text-white truncate">{game.title}</p>
                      <p className="text-xs text-gray-400">{game.votesCount} votes</p>
                    </div>
                  </button>
                </motion.div>
              ))
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Follows Section */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="bg-slate-900/60 backdrop-blur-xl border border-slate-700/30 hover:border-purple-500/30 transition-all duration-300 rounded-2xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-400" />
              Follows
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {followedItems.length === 0 ? (
              <p className="text-sm text-gray-400">No follows yet</p>
            ) : (
              followedItems.slice(0, 3).map((item, index) => (
                <motion.div
                  key={`${item.type}-${item.id}`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + index * 0.05 }}
                >
                  <button
                    onClick={() => handleFilterClick(
                      item.type, 
                      item.id,
                      item.type === 'user' ? (item as FollowedUser).name : (item as FollowedGame).title
                    )}
                    className={`w-full flex items-center gap-3 p-2 rounded-lg transition-all duration-200 hover:bg-slate-800/50 ${
                      activeFilter?.type === item.type && activeFilter?.value === item.id
                        ? 'bg-purple-500/20 border border-purple-400/30'
                        : 'hover:border-purple-500/20'
                    }`}
                  >
                    {item.type === 'user' ? (
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={item.image} />
                        <AvatarFallback className="bg-purple-600 text-white text-xs">
                          {(item as FollowedUser).name?.[0]?.toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                    ) : (
                      <div className="w-8 h-8 bg-slate-700 rounded flex items-center justify-center">
                        <Gamepad2 className="w-4 h-4 text-slate-400" />
                      </div>
                    )}
                    <div className="flex-1 text-left">
                      <p className="text-sm font-medium text-white truncate">
                        {item.type === 'user' ? (item as FollowedUser).name : (item as FollowedGame).title}
                      </p>
                      <p className="text-xs text-gray-400">
                        {item.type === 'user' ? `@${(item as FollowedUser).username}` : 'Game'}
                      </p>
                    </div>
                  </button>
                </motion.div>
              ))
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Notifications Section */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="bg-slate-900/60 backdrop-blur-xl border border-slate-700/30 hover:border-purple-500/30 transition-all duration-300 rounded-2xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
              <Bell className="w-5 h-5 text-purple-400" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {notifications.length === 0 ? (
              <p className="text-sm text-gray-400">No notifications</p>
            ) : (
              notifications.map((notification, index) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.05 }}
                >
                  {notification.link ? (
                    <Link
                      href={notification.link}
                      className="block p-2 rounded-lg hover:bg-slate-800/50 transition-colors"
                    >
                      <div className="flex items-start gap-2">
                        <div className={`w-2 h-2 rounded-full mt-2 ${!notification.read ? 'bg-purple-400' : 'bg-slate-600'}`} />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-white">{notification.title}</p>
                          <p className="text-xs text-gray-400 mt-1">{notification.message}</p>
                          <p className="text-xs text-gray-500 mt-1">{formatTimeAgo(notification.createdAt)}</p>
                        </div>
                      </div>
                    </Link>
                  ) : (
                    <div className="p-2 rounded-lg">
                      <div className="flex items-start gap-2">
                        <div className={`w-2 h-2 rounded-full mt-2 ${!notification.read ? 'bg-purple-400' : 'bg-slate-600'}`} />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-white">{notification.title}</p>
                          <p className="text-xs text-gray-400 mt-1">{notification.message}</p>
                          <p className="text-xs text-gray-500 mt-1">{formatTimeAgo(notification.createdAt)}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Last Seen Section */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="bg-slate-900/60 backdrop-blur-xl border border-slate-700/30 hover:border-purple-500/30 transition-all duration-300 rounded-2xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-purple-400" />
              Last Seen
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {lastSeenProducts.length === 0 ? (
              <p className="text-sm text-gray-400">No recent views</p>
            ) : (
              lastSeenProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.05 }}
                >
                  <Link
                    href={`/product/${product.slug || product.id}`}
                    className="block w-full flex items-center gap-3 p-2 rounded-lg transition-all duration-200 hover:bg-slate-800/50"
                  >
                    {product.thumbnail ? (
                      <Image
                        src={product.thumbnail}
                        alt={product.title}
                        width={32}
                        height={32}
                        className="w-8 h-8 rounded object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-slate-700 rounded flex items-center justify-center">
                        <Gamepad2 className="w-4 h-4 text-slate-400" />
                      </div>
                    )}
                    <div className="flex-1 text-left">
                      <p className="text-sm font-medium text-white truncate">{product.title}</p>
                      <p className="text-xs text-gray-400">{formatTimeAgo(product.lastViewed)}</p>
                    </div>
                    <ExternalLink className="w-3 h-3 text-gray-400" />
                  </Link>
                </motion.div>
              ))
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
