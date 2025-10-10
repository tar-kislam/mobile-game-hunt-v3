'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { UserAvatarTooltip } from '@/components/ui/user-avatar-tooltip'
import { Heart, MessageCircle, Share } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'
// import { CommentComposer } from './comment-composer'

interface Comment {
  id: string
  content: string
  createdAt: string
  user: {
    id: string
    name: string
    username?: string
    image?: string
  }
  _count?: {
    children: number
  }
}

interface CommentItemProps {
  comment: Comment
  postId: string
  showReplies?: boolean
  onReplySuccess?: () => void
}

export function CommentItem({ comment, postId, showReplies = false, onReplySuccess }: CommentItemProps) {
  const { data: session } = useSession()
  const [showReplyComposer, setShowReplyComposer] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    return `${diffDays}d ago`
  }

  const handleReplyClick = () => {
    if (!session?.user?.id) {
      toast.error('Please sign in to reply')
      return
    }
    setShowReplyComposer(!showReplyComposer)
  }

  const handleLikeClick = () => {
    if (!session?.user?.id) {
      toast.error('Please sign in to like comments')
      return
    }
    // TODO: Implement like functionality
    toast.info('Like functionality coming soon')
  }

  const handleShareClick = () => {
    if (!session?.user?.id) {
      toast.error('Please sign in to share comments')
      return
    }
    // TODO: Implement share functionality
    toast.info('Share functionality coming soon')
  }

  const handleReplySuccess = () => {
    setShowReplyComposer(false)
    onReplySuccess?.()
  }

  return (
    <div className="space-y-3">
      <article className="p-4 hover:bg-muted/30 transition-colors">
        <div className="flex space-x-3">
          <div className="flex-shrink-0">
            <UserAvatarTooltip
              userId={comment.user.id}
              userName={comment.user.name}
              userImage={comment.user.image || null}
              size="sm"
            />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="space-y-3">
              <div className="flex items-center space-x-1">
                <span className="font-semibold text-foreground text-[15px]">{comment.user.name}</span>
                {comment.user.username && (
                  <span className="text-muted-foreground text-[15px]">@{comment.user.username}</span>
                )}
                <span className="text-muted-foreground text-[15px]">·</span>
                <span className="text-muted-foreground text-[15px]">{formatTimeAgo(comment.createdAt)}</span>
              </div>
              
              <p className="text-foreground text-[15px] leading-relaxed break-words">
                {comment.content}
              </p>
              
              <div className="flex items-center space-x-6 text-muted-foreground pt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleReplyClick}
                  className="flex items-center space-x-2 hover:text-blue-500 transition-colors p-1 h-auto"
                >
                  <MessageCircle className="h-5 w-5" />
                  <span className="text-sm">Reply</span>
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLikeClick}
                  className={`flex items-center space-x-2 transition-colors p-1 h-auto ${
                    isLiked ? 'text-red-500 hover:text-red-600' : 'hover:text-red-500'
                  }`}
                >
                  <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
                  <span className="text-sm">{likeCount}</span>
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleShareClick}
                  className="flex items-center space-x-2 hover:text-green-500 transition-colors p-1 h-auto"
                >
                  <Share className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </article>
      
      {/* Inline Reply Composer - TEMPORARILY REMOVED */}
      {/* {showReplyComposer && (
        <div className="ml-11 border-l-2 border-border/40 pl-4">
          <CommentComposer
            postId={postId}
            parentId={comment.id}
            onSuccess={handleReplySuccess}
            placeholder={`Reply to ${comment.user.name}...`}
            replyToName={comment.user.username || comment.user.name}
            autoFocus
          />
        </div>
      )} */}
    </div>
  )
}
