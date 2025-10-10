'use client'

import { MoreHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { UserAvatarTooltip } from '@/components/ui/user-avatar-tooltip'

interface OriginalPostCardProps {
  post: {
    id: string
    content: string | null
    createdAt: string | Date
    hashtags?: any
    images?: any
    user: {
      id: string
      name: string | null
      username?: string | null
      image?: string | null
    }
    _count?: {
      likes: number
    }
  }
}

export function OriginalPostCard({ post }: OriginalPostCardProps) {

  const formatTimeAgo = (dateInput: string | Date) => {
    const date = new Date(dateInput)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m`
    if (diffHours < 24) return `${diffHours}h`
    return `${diffDays}d`
  }


  // Extract hashtags from content
  const extractHashtags = (content: string): string[] => {
    const hashtagRegex = /#[\w]+/g
    const matches = content.match(hashtagRegex) || []
    return [...new Set(matches)] // Remove duplicates
  }

  const hashtags = post.content ? extractHashtags(post.content) : []

  return (
    <article className="p-4 hover:bg-muted/30 transition-colors space-y-3">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <UserAvatarTooltip
            userId={post.user.id}
            userName={post.user.name}
            userImage={post.user.image || null}
            size="md"
          />
          <div className="flex items-center space-x-1">
            <span className="font-semibold text-foreground text-[15px]">{post.user.name || 'Unknown'}</span>
            {post.user.username && (
              <span className="text-muted-foreground text-[15px]">@{post.user.username}</span>
            )}
            <span className="text-muted-foreground text-[15px]">·</span>
            <span className="text-muted-foreground text-[15px]">{formatTimeAgo(post.createdAt)}</span>
          </div>
        </div>
        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </div>

      {/* Content */}
      {post.content && (
        <div className="space-y-3">
          <div className="text-foreground text-[15px] leading-relaxed break-words">
            {post.content}
          </div>
          
          {/* Hashtags */}
          {hashtags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {hashtags.map((hashtag, index) => (
                <span 
                  key={index} 
                  className="text-primary/80 text-sm hover:text-primary cursor-pointer transition-colors"
                >
                  {hashtag}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Images/Media placeholder */}
      {post.images && (
        <div className="mt-3">
          {/* Image display logic would go here */}
          <div className="text-muted-foreground text-sm">Media content</div>
        </div>
      )}
    </article>
  )
}


