"use client"

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { motion, AnimatePresence } from 'framer-motion'
import { GamepadIcon, MessageCircleIcon, ExternalLinkIcon, CalendarIcon, ThumbsUpIcon, EyeIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import Image from 'next/image'
import Link from 'next/link'

interface FeedItem {
  id: string
  title: string
  description: string
  tagline?: string
  thumbnail?: string
  url?: string
  platforms?: string[]
  createdAt: string
  user: {
    id: string
    username: string
    name: string
    image: string | null
  }
  votesCount?: number
  commentsCount?: number
  type: 'game' | 'comment'
  reason: string
  productId?: string
  productTitle?: string
}

export function Feed() {
  const { data: session } = useSession()
  const [feedItems, setFeedItems] = useState<FeedItem[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  const fetchFeed = async (pageNum = 1, append = false) => {
    if (!session?.user?.id) return

    setLoading(true)
    try {
      const response = await fetch(`/api/feed?page=${pageNum}&limit=10`)
      const data = await response.json()
      
      if (data.feed) {
        if (append) {
          setFeedItems(prev => [...prev, ...data.feed])
        } else {
          setFeedItems(data.feed)
        }
        setHasMore(data.pagination.hasMore)
      }
    } catch (error) {
      console.error('Error fetching feed:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadMore = () => {
    const nextPage = page + 1
    setPage(nextPage)
    fetchFeed(nextPage, true)
  }

  useEffect(() => {
    fetchFeed()
  }, [session?.user?.id])

  if (!session?.user?.id) {
    return (
      <Card className="bg-slate-900/60 backdrop-blur-xl border border-slate-700/30 shadow-2xl shadow-purple-500/10">
        <CardContent className="p-8 text-center">
          <h3 className="text-xl font-semibold text-white mb-2">Sign in required</h3>
          <p className="text-gray-400">Please sign in to view your feed.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <AnimatePresence>
        {loading && feedItems.length === 0 ? (
          <Card className="bg-slate-900/60 backdrop-blur-xl border border-slate-700/30 shadow-2xl shadow-purple-500/10">
            <CardContent className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400 mx-auto mb-4"></div>
              <p className="text-gray-300">Loading your feed...</p>
            </CardContent>
          </Card>
        ) : feedItems.length === 0 ? (
          <Card className="bg-slate-900/60 backdrop-blur-xl border border-slate-700/30 shadow-2xl shadow-purple-500/10">
            <CardContent className="p-8 text-center">
              <h3 className="text-xl font-semibold text-white mb-2">No activity yet</h3>
              <p className="text-gray-400 mb-4">
                Follow some users to see their latest games and activity in your feed.
              </p>
              <Button asChild className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700">
                <Link href="/leaderboard">Discover Users</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {feedItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="group bg-slate-900/60 backdrop-blur-xl border border-slate-700/30 hover:border-purple-500/60 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-purple-500/20">
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row">
                      {/* Game Thumbnail - Left Side */}
                      <div className="md:w-1/3 relative">
                        {item.thumbnail && item.type === 'game' ? (
                          <div className="relative w-full h-48 md:h-full min-h-[200px] rounded-l-lg overflow-hidden">
                            <Image
                              src={item.thumbnail}
                              alt={item.title}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                              unoptimized
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                          </div>
                        ) : (
                          <div className="w-full h-48 md:h-full min-h-[200px] bg-gradient-to-br from-purple-900/50 to-blue-900/50 rounded-l-lg flex items-center justify-center">
                            <GamepadIcon className="h-16 w-16 text-purple-400/50" />
                          </div>
                        )}
                      </div>

                      {/* Game Details - Right Side */}
                      <div className="md:w-2/3 p-6 flex flex-col justify-between">
                        <div className="space-y-4">
                          {/* User Info */}
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={item.user.image || undefined} />
                              <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-500 text-white text-xs">
                                {item.user.name?.[0]?.toUpperCase() || item.user.username?.[0]?.toUpperCase() || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <Link 
                              href={`/${item.user.username}`}
                              className="text-sm font-medium text-purple-400 hover:text-purple-300 transition-colors"
                            >
                              {item.user.name || item.user.username}
                            </Link>
                            <Badge variant="outline" className="text-xs border-purple-500/50 text-purple-400">
                              {item.type === 'game' ? 'New Game' : 'New Comment'}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              {new Date(item.createdAt).toLocaleDateString()}
                            </span>
                          </div>

                          {/* Game Title */}
                          <h3 className="text-xl font-bold text-white group-hover:text-purple-300 transition-colors">
                            {item.title}
                          </h3>
                          
                          {/* Description */}
                          {item.description && (
                            <p className="text-gray-300 line-clamp-2 leading-relaxed">
                              {item.description}
                            </p>
                          )}

                          {/* Platform Tags */}
                          {item.platforms && item.platforms.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {item.platforms.map((platform, idx) => (
                                <Badge 
                                  key={idx} 
                                  variant="secondary" 
                                  className="bg-purple-500/20 text-purple-300 border-purple-500/30 text-xs"
                                >
                                  {platform}
                                </Badge>
                              ))}
                            </div>
                          )}

                          {/* Stats Counters */}
                          <div className="flex items-center space-x-4 text-sm text-gray-400">
                            <div className="flex items-center space-x-1">
                              <ThumbsUpIcon className="h-4 w-4 text-yellow-400" />
                              <span>{item.votesCount || 0} votes</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <MessageCircleIcon className="h-4 w-4 text-blue-400" />
                              <span>{item.commentsCount || 0} comments</span>
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons - Bottom Right */}
                        <div className="flex items-center justify-end space-x-3 mt-6">
                          {item.type === 'game' && item.url && (
                            <Button
                              size="sm"
                              onClick={() => window.open(item.url, '_blank')}
                              className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white border-0 shadow-lg hover:shadow-purple-500/25 transition-all duration-300"
                            >
                              <GamepadIcon className="h-4 w-4 mr-2" />
                              Play Game
                            </Button>
                          )}
                          
                          {item.type === 'game' ? (
                            <Button
                              variant="outline"
                              size="sm"
                              asChild
                              className="border-purple-500/50 text-purple-400 hover:bg-purple-500/10 hover:border-purple-400/70 transition-all duration-300"
                            >
                              <Link href={`/product/${item.id}`}>
                                <EyeIcon className="h-4 w-4 mr-2" />
                                View Details
                              </Link>
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              asChild
                              className="border-blue-500/50 text-blue-400 hover:bg-blue-500/10 hover:border-blue-400/70 transition-all duration-300"
                            >
                              <Link href={`/product/${item.productId}`}>
                                <MessageCircleIcon className="h-4 w-4 mr-2" />
                                View Discussion
                              </Link>
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Load More Button */}
      {hasMore && feedItems.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex justify-center"
        >
          <Button
            onClick={loadMore}
            disabled={loading}
            variant="outline"
            className="border-purple-500/50 text-purple-400 hover:bg-purple-500/10 hover:border-purple-400/70 transition-all duration-300"
          >
            {loading ? 'Loading...' : 'Load More'}
          </Button>
        </motion.div>
      )}
    </div>
  )
}
