'use client'

import { useMemo, useState, useEffect } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'
import { MessageCircle, Edit2, Trash2, Share2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { UserAvatarTooltip } from '@/components/ui/user-avatar-tooltip'
import { ProductCommentComposer } from './product-comment-composer'
import { UpvoteButton } from '@/components/ui/upvote-button'
import { toggleVoteState, type ProductCommentNode } from '@/lib/comments/product-comment-utils'

interface ProductCommentItemProps {
  comment: ProductCommentNode
  productId: string
  productSlug?: string | null
  depth?: number
  onReplyAdded: (parentId: string, reply: ProductCommentNode) => void
  onCommentUpdated: (comment: ProductCommentNode) => void
  onCommentDeleted: (commentId: string) => void
}

function highlightMentions(content: string) {
  const mentionRegex = /@([a-zA-Z0-9_-]{1,30})/g
  const parts: React.ReactNode[] = []
  let lastIndex = 0
  let match

  while ((match = mentionRegex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      parts.push(content.substring(lastIndex, match.index))
    }

    const username = match[1]
    parts.push(
      <Link
        key={`${username}-${match.index}`}
        href={`/${username}`}
        className="text-blue-400 hover:text-blue-300 hover:underline"
      >
        @{username}
      </Link>
    )

    lastIndex = match.index + match[0].length
  }

  if (lastIndex < content.length) {
    parts.push(content.substring(lastIndex))
  }

  return parts.length > 0 ? <>{parts}</> : content
}

export function ProductCommentItem({
  comment,
  productId,
  productSlug,
  depth = 0,
  onReplyAdded,
  onCommentUpdated,
  onCommentDeleted
}: ProductCommentItemProps) {
  const { data: session } = useSession()
  const [showReplyComposer, setShowReplyComposer] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(comment.content)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [localComment, setLocalComment] = useState(comment)

  useEffect(() => {
    setLocalComment(comment)
  }, [comment])

  const isOwner = session?.user?.id === localComment.user?.id
  const borderClasses = depth > 0 ? 'border-l border-white/5 pl-4 ml-4' : ''

  const formattedTimestamp = useMemo(() => {
    const date = new Date(localComment.createdAt)
    return date.toLocaleString()
  }, [localComment.createdAt])

  const handleShare = () => {
    if (typeof window === 'undefined') return
    const anchor = `#comment-${localComment.id}`
    const url = `${window.location.origin}/product/${productSlug ?? productId}${anchor}`
    navigator.clipboard.writeText(url)
    toast.success('Comment link copied to clipboard!')
  }

  const handleUpvote = async () => {
    if (!session?.user?.id) {
      toast.error('Please sign in to upvote comments')
      return
    }

    const previousState = { ...localComment }
    const optimistic = toggleVoteState(localComment.isUpvoted, localComment.upvoteCount)
    setLocalComment((prev) => ({
      ...prev,
      isUpvoted: optimistic.isUpvoted,
      upvoteCount: optimistic.upvoteCount
    }))

    try {
      const response = await fetch(`/api/products/comments/${localComment.id}/upvote`, { method: 'POST' })
      if (!response.ok) {
        throw new Error('Failed to update vote')
      }
      const data = await response.json()
      const updated = {
        ...localComment,
        isUpvoted: data.isUpvoted,
        upvoteCount: data.upvoteCount
      }
      setLocalComment(updated)
      onCommentUpdated(updated)
    } catch (error) {
      console.error('[PRODUCT COMMENT][UPVOTE] error', error)
      toast.error('Failed to update vote')
      setLocalComment(previousState)
    }
  }

  const handleReplySuccess = (reply: ProductCommentNode) => {
    setShowReplyComposer(false)
    onReplyAdded(localComment.id, reply)
  }

  const handleUpdateSuccess = (updated: ProductCommentNode) => {
    setLocalComment(updated)
    onCommentUpdated(updated)
    setIsEditing(false)
    setEditContent(updated.content)
  }

  const handleEditSave = async () => {
    if (!session?.user?.id) {
      toast.error('Please sign in to edit comments')
      return
    }

    if (!editContent.trim()) {
      toast.error('Comment cannot be empty')
      return
    }

    setIsSaving(true)
    try {
      const response = await fetch(`/api/products/comments/${localComment.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: editContent.trim() })
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        throw new Error(error?.error || 'Failed to update comment')
      }

      const data: ProductCommentNode = await response.json()
      handleUpdateSuccess(data)
      toast.success('Comment updated')
    } catch (error) {
      console.error('[PRODUCT COMMENT][EDIT] error', error)
      toast.error(error instanceof Error ? error.message : 'Failed to update comment')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!session?.user?.id) {
      toast.error('Please sign in to delete comments')
      return
    }

    if (!confirm('Are you sure you want to delete this comment?')) {
      return
    }

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/products/comments/${localComment.id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        throw new Error(error?.error || 'Failed to delete comment')
      }

      setLocalComment((prev) => ({
        ...prev,
        isDeleted: true,
        status: 'hidden',
        content: 'This comment was deleted.'
      }))
      onCommentDeleted(localComment.id)
      toast.success('Comment deleted')
    } catch (error) {
      console.error('[PRODUCT COMMENT][DELETE] error', error)
      toast.error(error instanceof Error ? error.message : 'Failed to delete comment')
    } finally {
      setIsDeleting(false)
    }
  }

  if (localComment.isDeleted) {
    return (
      <div className={`rounded-xl border border-white/5 bg-white/5 p-4 text-sm italic text-muted-foreground ${borderClasses}`}>
        This comment was deleted
      </div>
    )
  }

  return (
    <div className={`space-y-4 ${borderClasses}`} id={`comment-${localComment.id}`}>
      <div className="rounded-2xl border border-white/5 bg-white/5 p-4">
        <div className="flex items-start space-x-3">
          <UserAvatarTooltip
            userId={localComment.user?.id || ''}
            userName={localComment.user?.name || 'User'}
            userImage={localComment.user?.image || null}
            size="sm"
          />
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold">{localComment.user?.name || 'Anonymous'}</span>
              {localComment.user?.username && (
                <Link
                  href={`/${localComment.user.username}`}
                  className="text-sm text-muted-foreground hover:text-blue-400"
                >
                  @{localComment.user.username}
                </Link>
              )}
              <span className="text-xs text-muted-foreground">{formattedTimestamp}</span>
            </div>

            {isEditing ? (
              <div className="mt-3 space-y-2">
                <textarea
                  className="w-full rounded-lg border border-white/10 bg-transparent p-2 text-sm"
                  value={editContent}
                  onChange={(event) => setEditContent(event.target.value)}
                  maxLength={1000}
                />
                <div className="flex justify-end space-x-2 text-xs text-muted-foreground">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setIsEditing(false)
                      setEditContent(localComment.content)
                    }}
                    disabled={isSaving}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleEditSave}
                    disabled={isSaving || !editContent.trim()}
                  >
                    {isSaving ? 'Saving...' : 'Save'}
                  </Button>
                </div>
              </div>
            ) : (
              <p className="mt-3 text-sm leading-relaxed text-foreground">
                {highlightMentions(localComment.content)}
              </p>
            )}

            <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <div>
                <UpvoteButton
                  initialVotes={localComment.upvoteCount}
                  isUpvoted={localComment.isUpvoted}
                  onVoteChange={async () => {
                    await handleUpvote()
                  }}
                  size="sm"
                  variant="ghost"
                />
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center space-x-2 px-2 text-muted-foreground hover:text-blue-400"
                onClick={() => {
                  if (!session?.user?.id) {
                    toast.error('Please sign in to reply')
                    return
                  }
                  setShowReplyComposer((prev) => !prev)
                }}
              >
                <MessageCircle className="h-4 w-4" />
                <span>Reply</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleShare}
                className="flex items-center space-x-2 px-2 text-muted-foreground hover:text-green-400"
              >
                <Share2 className="h-4 w-4" />
                <span>Share</span>
              </Button>
              {isOwner && !isEditing && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                    className="px-2 text-muted-foreground hover:text-blue-400"
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="px-2 text-muted-foreground hover:text-red-400"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>

        {showReplyComposer && (
          <div className="mt-4">
            <ProductCommentComposer
              productId={productId}
              parentId={localComment.id}
              replyToName={localComment.user?.username || localComment.user?.name || 'user'}
              placeholder={`Reply to ${localComment.user?.name || 'this comment'}...`}
              onSuccess={handleReplySuccess}
              autoFocus
            />
          </div>
        )}
      </div>

      {localComment.replies.length > 0 && (
        <div className="space-y-4">
          {localComment.replies.map((reply) => (
            <ProductCommentItem
              key={reply.id}
              comment={reply}
              productId={productId}
              productSlug={productSlug}
              depth={depth + 1}
              onReplyAdded={onReplyAdded}
              onCommentUpdated={onCommentUpdated}
              onCommentDeleted={onCommentDeleted}
            />
          ))}
        </div>
      )}
    </div>
  )
}

