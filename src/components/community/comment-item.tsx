'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { UserAvatarTooltip } from '@/components/ui/user-avatar-tooltip'
import { Heart, MessageCircle, Share, Edit2, Trash2, X, Check } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'
import { Textarea } from '@/components/ui/textarea'
import Link from 'next/link'
import type { CommunityCommentNode } from './types'

interface CommentItemProps {
  comment: CommunityCommentNode
  postId: string
  onUpdate?: () => void
  onReplyRequest?: (comment: CommunityCommentNode) => void
}

// Highlight mentions in comment content
function highlightMentions(text: string): React.ReactNode {
  if (!text) return text

  const mentionRegex = /@([a-zA-Z0-9_-]{1,30})/g
  const parts: React.ReactNode[] = []
  let lastIndex = 0
  let match

  while ((match = mentionRegex.exec(text)) !== null) {
    // Add text before mention
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index))
    }

    // Add mention as link
    const username = match[1]
    parts.push(
      <Link
        key={match.index}
        href={`/${username}`}
        className="text-blue-500 hover:text-blue-400 hover:underline font-medium"
      >
        @{username}
      </Link>
    )

    lastIndex = match.index + match[0].length
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex))
  }

  return parts.length > 0 ? <>{parts}</> : text
}

export function CommentItem({ comment, postId, onUpdate, onReplyRequest }: CommentItemProps) {
  const { data: session } = useSession()
  const [isLiked, setIsLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(comment.content)
  const [isDeleting, setIsDeleting] = useState(false)

  const isOwner = session?.user?.id === comment.user.id
  const isDeleted = comment.isDeleted

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
    if (onReplyRequest) {
      onReplyRequest(comment)
    } else {
      toast.info('Open this thread to reply')
    }
  }

  const handleEdit = () => {
    setIsEditing(true)
    setEditContent(comment.content)
  }

  const handleSaveEdit = async () => {
    if (!editContent.trim()) {
      toast.error('Comment cannot be empty')
      return
    }

    try {
      const response = await fetch(`/api/community/comments/${comment.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: editContent.trim()
        }),
      })

      if (response.ok) {
        toast.success('Comment updated')
        setIsEditing(false)
        onUpdate?.()
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || 'Failed to update comment')
      }
    } catch (error) {
      console.error('Error updating comment:', error)
      toast.error('Failed to update comment')
    }
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setEditContent(comment.content)
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this comment?')) {
      return
    }

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/community/comments/${comment.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('Comment deleted')
        onUpdate?.()
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || 'Failed to delete comment')
      }
    } catch (error) {
      console.error('Error deleting comment:', error)
      toast.error('Failed to delete comment')
    } finally {
      setIsDeleting(false)
    }
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
    const url = `${window.location.origin}/community/post/${postId}#comment-${comment.id}`
    navigator.clipboard.writeText(url)
    toast.success('Comment link copied to clipboard!')
  }

  if (isDeleted) {
    return (
      <div className="p-4 text-muted-foreground italic">
        This comment was deleted
      </div>
    )
  }

  return (
    <div className="space-y-3 group">
      <article className="relative rounded-2xl border border-cyan-500/10 bg-gradient-to-br from-[#050914]/85 via-[#050914]/70 to-[#071022]/80 p-4 md:p-5 shadow-[0_0_18px_rgba(14,165,233,0.08)] transition-all duration-300 group-hover:border-cyan-400/50 group-hover:shadow-[0_0_26px_rgba(14,165,233,0.2)]">
        <div className="flex flex-col gap-3 sm:flex-row sm:space-x-3 sm:gap-0">
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
              <div className="flex flex-wrap items-center gap-1 text-sm md:text-[15px]">
                <span className="font-semibold text-foreground">{comment.user.name}</span>
                {comment.user.username && (
                  <Link href={`/${comment.user.username}`} className="text-muted-foreground hover:text-blue-500">
                    @{comment.user.username}
                  </Link>
                )}
                <span className="text-muted-foreground">·</span>
                <span className="text-muted-foreground">{formatTimeAgo(comment.createdAt)}</span>
                {comment.updatedAt && comment.updatedAt !== comment.createdAt && (
                  <>
                    <span className="text-muted-foreground">·</span>
                    <span className="text-muted-foreground text-xs italic">edited</span>
                  </>
                )}
              </div>
              
              {isEditing ? (
                <div className="space-y-2">
                  <Textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="bg-transparent border border-border text-foreground min-h-[80px]"
                    maxLength={500}
                  />
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{editContent.length}/500</span>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleCancelEdit}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <X className="h-4 w-4 mr-1" />
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleSaveEdit}
                        disabled={!editContent.trim()}
                        className="bg-blue-500 hover:bg-blue-600 text-white"
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Save
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-foreground text-[15px] leading-relaxed break-words">
                  {highlightMentions(comment.content)}
                </p>
              )}
              
              <div className="flex flex-wrap items-center gap-3 text-muted-foreground pt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleReplyClick}
                  className="flex items-center space-x-2 rounded-full px-3 py-2 hover:text-blue-400 transition-colors min-h-[40px]"
                >
                  <MessageCircle className="h-5 w-5" />
                  <span className="text-sm">Reply</span>
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLikeClick}
                  className={`flex items-center space-x-2 rounded-full px-3 py-2 transition-colors min-h-[40px] ${
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
                  className="flex items-center space-x-2 rounded-full px-3 py-2 hover:text-green-400 transition-colors min-h-[40px]"
                >
                  <Share className="h-5 w-5" />
                </Button>

                {isOwner && !isEditing && (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleEdit}
                    className="flex items-center space-x-2 rounded-full px-3 py-2 hover:text-blue-400 transition-colors min-h-[40px]"
                    >
                      <Edit2 className="h-5 w-5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleDelete}
                      disabled={isDeleting}
                    className="flex items-center space-x-2 rounded-full px-3 py-2 hover:text-red-400 transition-colors min-h-[40px]"
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </article>
    </div>
  )
}
