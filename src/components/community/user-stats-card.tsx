"use client"
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import useSWR from 'swr'

interface UserStats {
  totalPosts: number
  totalLikes: number
  totalComments: number
  totalViews: number
  engagementRate: number
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

interface UserStatsCardProps {
  userId: string
}

export function UserStatsCard({ userId }: UserStatsCardProps) {
  const { data: stats, error } = useSWR<UserStats>(
    `/api/community/user/${userId}/stats`,
    fetcher,
    {
      refreshInterval: 30000, // Refresh every 30 seconds
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
    }
  )

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K'
    }
    return num.toString()
  }

  const formatPercentage = (rate: number) => {
    return Math.round(rate * 100) + '%'
  }

  const statsItems = [
    {
      icon: '📝',
      label: 'Posts',
      value: stats ? formatNumber(stats.totalPosts) : '...',
      color: 'text-blue-400'
    },
    {
      icon: '❤️',
      label: 'Likes',
      value: stats ? formatNumber(stats.totalLikes) : '...',
      color: 'text-red-400'
    },
    {
      icon: '💬',
      label: 'Comments',
      value: stats ? formatNumber(stats.totalComments) : '...',
      color: 'text-green-400'
    },
    {
      icon: '👀',
      label: 'Views',
      value: stats ? formatNumber(stats.totalViews) : '...',
      color: 'text-purple-400'
    },
    {
      icon: '⚡',
      label: 'Engagement',
      value: stats ? formatPercentage(stats.engagementRate) : '...',
      color: 'text-orange-400'
    }
  ]

  return (
    <Card className="bg-card/50 border-white/10 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold bg-gradient-to-r from-purple-500 to-pink-600 bg-clip-text text-transparent">
          My Community Profile
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {statsItems.map((item, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-lg">{item.icon}</span>
              <span className="text-sm text-muted-foreground">{item.label}</span>
            </div>
            <div className={`font-semibold transition-all duration-300 ${item.color} ${stats ? 'animate-pulse' : ''}`}>
              {item.value}
            </div>
          </div>
        ))}
        
        {error && (
          <div className="text-center text-sm text-red-400 mt-4">
            Failed to load stats
          </div>
        )}
      </CardContent>
    </Card>
  )
}
