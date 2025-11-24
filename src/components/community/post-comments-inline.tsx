'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { CommentComposer, CommentComposerHandle } from './comment-composer'
import { CommentItem } from './comment-item'
import { RepliesList } from './replies-list'

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

interface PostCommentsInlineProps {
  postId: string
  isOpen: boolean
  onCommentAdded?: () => void
  focusKey?: number
}

const COMMENTS_LIMIT = 20

export function PostCommentsInline({ postId, isOpen, onCommentAdded, focusKey = 0 }: PostCommentsInlineProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(false)
  const [cursor, setCursor] = useState<string | null>(null)
  const [initialized, setInitialized] = useState(false)
  const composerRef = useRef<CommentComposerHandle>(null)
  const composerContainerRef = useRef<HTMLDivElement>(null)
  const [replyTarget, setReplyTarget] = useState<{ commentId: string; displayName: string } | null>(null)
  const [replyRefreshKey, setReplyRefreshKey] = useState(0)

  const resetState = useCallback(() => {
    setComments([])
    setError(null)
    setHasMore(false)
    setCursor(null)
    setInitialized(false)
    setInitialLoading(false)
  }, [])

  useEffect(() => {
    resetState()
  }, [postId, resetState])

  const fetchComments = useCallback(
    async (loadMore = false) => {
      try {
        setLoading(true)
        if (!loadMore) {
          setInitialLoading(true)
        }

        const params = new URLSearchParams({
          limit: String(COMMENTS_LIMIT),
          order: 'latest'
        })

        if (loadMore && cursor) {
          params.set('cursor', cursor)
        }

        const response = await fetch(`/api/community/posts/${postId}/comments?${params.toString()}`)
        if (!response.ok) {
          throw new Error('Failed to load comments')
        }

        const data = await response.json()

        setComments((prev) => (loadMore ? [...prev, ...(data.comments || [])] : data.comments || []))
        setHasMore(Boolean(data.nextCursor))
        setCursor(data.nextCursor ?? null)
        setError(null)
      } catch (err) {
        console.error('[PostCommentsInline] fetch error', err)
        setError(err instanceof Error ? err.message : 'Failed to load comments')
      } finally {
        setLoading(false)
        setInitialLoading(false)
      }
    },
    [cursor, postId]
  )

  useEffect(() => {
    if (!isOpen) {
      return
    }

    if (!initialized) {
      setInitialized(true)
      fetchComments(false)
    }
  }, [fetchComments, initialized, isOpen])

  useEffect(() => {
    if (!isOpen) return
    if (focusKey > 0) {
      const timeout = setTimeout(() => composerRef.current?.focus(), 120)
      return () => clearTimeout(timeout)
    }
  }, [focusKey, isOpen])

  useEffect(() => {
    if (!isOpen) {
      setReplyTarget(null)
    }
  }, [isOpen])

  if (!isOpen) {
    return null
  }

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      fetchComments(true)
    }
  }

  const handleCommentSuccess = () => {
    onCommentAdded?.()
    fetchComments(false)
    if (replyTarget) {
      setReplyRefreshKey((key) => key + 1)
    }
    setReplyTarget(null)
  }

  const handleReplyCancel = () => {
    setReplyTarget(null)
  }

  const handleReplyRequest = (comment: Comment) => {
    const displayName = comment.user.username || comment.user.name || 'user'
    const mention = `@${comment.user.username || comment.user.name || 'user'} `
    setReplyTarget({
      commentId: comment.id,
      displayName
    })

    composerContainerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })

    const existing = composerRef.current?.getContent().trim()
    if (!existing) {
      composerRef.current?.setContent(mention)
    }
    composerRef.current?.focus()
  }

  const renderSkeleton = () => (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="rounded-2xl border border-cyan-500/5 bg-[#050914]/60 p-4 shadow-[0_0_12px_rgba(14,165,233,0.08)]">
          <div className="flex space-x-3">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )

  return (
    <div className="mt-4 rounded-2xl border border-cyan-500/20 bg-gradient-to-br from-[#05060f]/90 via-[#060a1b]/85 to-[#05060f]/90 shadow-[0_0_30px_rgba(14,165,233,0.12)]">
      <div className="p-5 space-y-4">
        {initialLoading && comments.length === 0 ? (
          renderSkeleton()
        ) : error ? (
          <div className="text-center py-6">
            <p className="text-red-400 mb-3">Failed to load comments</p>
            <Button
              onClick={() => fetchComments(false)}
              variant="outline"
              className="text-white border-white/20 hover:bg-white/10"
              disabled={loading}
            >
              Try again
            </Button>
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-6 text-sm text-muted-foreground">
            Be the first to start the conversation!
          </div>
        ) : (
          <>
            {comments.map((comment) => (
              <div
                key={comment.id}
                className="rounded-2xl border border-cyan-500/10 bg-[#060b1a]/60 p-4 shadow-[0_0_16px_rgba(14,165,233,0.08)] transition-all duration-300 hover:border-cyan-400/40"
              >
                <CommentItem
                  comment={comment}
                  postId={postId}
                  showReplies
                  onReplyRequest={handleReplyRequest}
                />

                {comment._count && comment._count.children > 0 && (
                  <RepliesList
                    parentId={comment.id}
                    postId={postId}
                    initialCount={comment._count.children}
                    onReplyRequest={handleReplyRequest}
                    refreshKey={replyRefreshKey}
                  />
                )}
              </div>
            ))}

            {hasMore && (
              <div className="pt-2">
                <Button
                  variant="ghost"
                  onClick={handleLoadMore}
                  disabled={loading}
                  className="w-full text-sm text-cyan-300 hover:text-white"
                >
                  {loading ? 'Loading...' : 'Load more comments'}
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      <div
        ref={composerContainerRef}
        className="border-t border-white/5 p-4 bg-black/20 rounded-b-2xl"
      >
        <CommentComposer
          ref={composerRef}
          postId={postId}
          parentId={replyTarget?.commentId ?? null}
          replyToName={replyTarget?.displayName}
          onSuccess={handleCommentSuccess}
          onCancel={handleReplyCancel}
          placeholder={replyTarget ? 'Write your reply...' : 'Share your thoughts...'}
        />
      </div>
    </div>
  )
}

