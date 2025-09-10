"use client"
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, Hash } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface TrendingTopicsProps {
  topics: string[]
  onSelectTag?: (tag: string) => void
}

export function TrendingTopics({ topics, onSelectTag }: TrendingTopicsProps) {
  const router = useRouter()
  const handleClick = (raw: string) => {
    const tag = raw.replace(/^#/, '')
    if (onSelectTag) return onSelectTag(tag)
    router.push(`/community?hashtag=${encodeURIComponent(tag)}`)
  }
  return (
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
        {topics.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-muted-foreground text-sm">
              No trending topics yet
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {topics.map((topic, index) => {
              const clean = (topic || '').toString().replace(/^#+/, '')
              const display = clean
              return (
              <div
                key={topic}
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
                <div className="text-sm text-muted-foreground">
                  #{index + 1}
                </div>
              </div>
              )
            })}
          </div>
        )}
        
        <div className="mt-4 pt-4 border-t border-white/10">
          <p className="text-xs text-muted-foreground text-center">
            Based on posts from the last 7 days
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
