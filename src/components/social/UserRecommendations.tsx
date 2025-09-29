"use client"

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { motion, AnimatePresence } from 'framer-motion'
import { UsersIcon, UserPlusIcon, SparklesIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { FollowButton } from '@/components/ui/follow-button'
import { Badge } from '@/components/ui/badge'

interface Recommendation {
  id: string
  username: string
  name: string
  image: string | null
  followersCount: number
  mutualConnections?: number
  reason: string
}

interface UserRecommendationsProps {
  userId?: string
  className?: string
}

export function UserRecommendations({ userId, className }: UserRecommendationsProps) {
  const { data: session } = useSession()
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!session?.user?.id) return

      setLoading(true)
      try {
        const params = new URLSearchParams()
        if (userId) params.append('userId', userId)
        params.append('limit', '5')

        const response = await fetch(`/api/recommendations/users?${params}`)
        const data = await response.json()
        
        if (data.recommendations) {
          setRecommendations(data.recommendations)
        }
      } catch (error) {
        console.error('Error fetching recommendations:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchRecommendations()
  }, [session?.user?.id, userId])

  if (!session?.user?.id || loading) {
    return null
  }

  if (recommendations.length === 0) {
    return null
  }

  return (
    <Card className={`bg-slate-900/60 backdrop-blur-xl border border-slate-700/30 ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center text-white">
          <SparklesIcon className="h-5 w-5 mr-2 text-purple-400" />
          Suggested Users
        </CardTitle>
        <p className="text-sm text-gray-400">
          Users you might want to follow
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        <AnimatePresence>
          {recommendations.map((user, index) => (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 hover:bg-slate-800/70 transition-colors"
            >
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user.image || undefined} />
                  <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-500 text-white text-sm">
                    {user.name?.[0]?.toUpperCase() || user.username?.[0]?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <h4 className="font-medium text-white truncate">
                      {user.name || user.username}
                    </h4>
                    <Badge 
                      variant="outline" 
                      className="text-xs border-purple-500/50 text-purple-400"
                    >
                      {user.followersCount} followers
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-400 truncate">
                    @{user.username}
                  </p>
                  <p className="text-xs text-purple-300 mt-1">
                    {user.reason}
                  </p>
                </div>
              </div>
              
              <FollowButton 
                userId={user.id}
                username={user.username}
                userDisplayName={user.name || user.username}
                className="ml-2"
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </CardContent>
    </Card>
  )
}
