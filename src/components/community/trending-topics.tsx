"use client"
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, Hash, Heart } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { CommunitySearchSimple } from './community-search-simple'
import { Skeleton } from '@/components/ui/skeleton'

interface HashtagStats {
  tag: string
  score: number
  likes: number
  mentions: number
}

interface TrendingData {
  hashtags: HashtagStats[]
  posts: any[]
  lastUpdated: string
}

interface TrendingTopicsProps {
  topics: string[]
  trendingData?: TrendingData
  isLoading?: boolean
  onSelectTag?: (tag: string) => void
  onSimpleSearch?: (query: string) => void
  onSimpleSearchClear?: () => void
}

export function TrendingTopics({ topics, trendingData, isLoading, onSelectTag, onSimpleSearch, onSimpleSearchClear }: TrendingTopicsProps) {
  const router = useRouter()
  const handleClick = (raw: string) => {
    const tag = raw.replace(/^#/, '')
    if (onSelectTag) return onSelectTag(tag)
    router.push(`/community?hashtag=${encodeURIComponent(tag)}`)
  }

  // Use trending data if available, fallback to topics array
  const displayItems = trendingData?.hashtags || topics.map(tag => ({ tag, likes: 0, mentions: 0, score: 0 }))
  return (
    <div className="space-y-4">
      {/* Simple Search Bar */}
      {onSimpleSearch && onSimpleSearchClear && (
        <CommunitySearchSimple 
          onSearch={onSimpleSearch}
          onClear={onSimpleSearchClear}
        />
      )}
      
      {/* Trending Topics Card */}
      <Card className="bg-card/50 border-white/10 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-orange-500" />
            <span className="bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent">
              Trending in Community
            </span>
          </CardTitle>
        </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-background/30">
                <div className="flex items-center space-x-3">
                  <Skeleton className="w-6 h-6 rounded-full" />
                  <div className="flex items-center space-x-2">
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                </div>
                <Skeleton className="h-4 w-8" />
              </div>
            ))}
          </div>
        ) : displayItems.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-muted-foreground text-sm">
              No trending topics yet
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {displayItems.map((item, index) => {
              const tag = typeof item === 'string' ? item : item.tag
              const clean = (tag || '').toString().replace(/^#+/, '')
              const display = clean
              const likes = typeof item === 'object' ? item.likes : 0
              const mentions = typeof item === 'object' ? item.mentions : 0
              
              return (
              <div
                key={tag}
                className="flex items-center justify-between p-3 rounded-lg bg-background/30 hover:bg-background/50 transition-colors cursor-pointer group"
                onClick={() => handleClick(clean)}
              >
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs font-bold">
                    {index + 1}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Hash className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium group-hover:text-blue-400 transition-colors">
                      {display}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  {likes > 0 && (
                    <div className="flex items-center space-x-1">
                      <Heart className="h-3 w-3 text-red-500" />
                      <span>{likes}</span>
                    </div>
                  )}
                  <span className="text-xs">
                    {likes > 0 ? `${likes} likes` : `#${index + 1}`}
                  </span>
                </div>
              </div>
              )
            })}
          </div>
        )}
        
        <div className="mt-4 pt-4 border-t border-white/10">
          <p className="text-xs text-muted-foreground text-center">
            Based on likes and hashtags from the last 7 days
          </p>
        </div>
      </CardContent>
    </Card>
    </div>
  )
}
