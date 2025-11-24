'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { CommentComposer, CommentComposerHandle } from './comment-composer'
import { CommentTree } from './comment-tree'
import type { CommunityCommentNode } from './types'

interface CommentsThreadProps {
  postId: string
}

export function CommentsThread({ postId }: CommentsThreadProps) {
  const [comments, setComments] = useState<CommunityCommentNode[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(false)
  const [cursor, setCursor] = useState<string | null>(null)
  const composerRef = useRef<CommentComposerHandle>(null)
  const composerContainerRef = useRef<HTMLDivElement>(null)
  const [replyTarget, setReplyTarget] = useState<{ commentId: string; displayName: string } | null>(null)

  const fetchComments = async (loadMore = false) => {
    try {
      setLoading(true)
      setError(null)
      
      const params = new URLSearchParams({
        limit: '20',
        order: 'latest'
      })
      
      if (loadMore && cursor) {
        params.set('cursor', cursor)
      }
      
      const response = await fetch(`/api/community/posts/${postId}/comments?${params}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch comments')
      }
      
      const data = await response.json()
      
      if (loadMore) {
        setComments(prev => [...prev, ...data.comments])
      } else {
        setComments(data.comments || [])
      }
      
      setHasMore(!!data.nextCursor)
      setCursor(data.nextCursor || null)
    } catch (err) {
      console.error('Error fetching comments:', err)
      setError(err instanceof Error ? err.message : 'Failed to load comments')
    } finally {
      setLoading(false)
    }
  }

  const handleLoadMore = () => {
    fetchComments(true)
  }

  const handleCommentSuccess = () => {
    fetchComments(false)
    setReplyTarget(null)
  }

  const handleReplyCancel = () => {
    setReplyTarget(null)
  }

  const handleReplyRequest = (comment: CommunityCommentNode) => {
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

  useEffect(() => {
    fetchComments()
  }, [postId])

  if (loading && comments.length === 0) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="bg-card/50 border-white/10 backdrop-blur-sm rounded-xl p-4">
            <div className="flex space-x-3">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-12 w-full" />
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-400 mb-4">Failed to load comments</p>
        <Button
          variant="outline"
          onClick={() => fetchComments(false)}
          className="text-white border-gray-600 hover:bg-gray-800"
        >
          Try again
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Comments List */}
      {comments.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-400 mb-2">No comments yet</p>
          <p className="text-gray-500 text-sm">Be the first to start the conversation!</p>
        </div>
      ) : (
        <div className="space-y-4">
          <CommentTree
            comments={comments}
                postId={postId}
                onReplyRequest={handleReplyRequest}
            variant="detail"
          />
          
          {/* Load More */}
          {hasMore && (
            <div className="text-center py-4">
              <Button
                variant="outline"
                onClick={handleLoadMore}
                disabled={loading}
                className="text-white border-gray-600 hover:bg-gray-800"
              >
                {loading ? 'Loading...' : 'Load more comments'}
              </Button>
            </div>
          )}
        </div>
      )}

      <div ref={composerContainerRef} className="bg-card/50 border-white/10 backdrop-blur-sm rounded-xl p-4">
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
