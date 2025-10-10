'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { CommentItem } from './comment-item'

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

interface CommentsListProps {
  postId: string
}

export function CommentsList({ postId }: CommentsListProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(false)
  const [cursor, setCursor] = useState<string | null>(null)

  const fetchComments = async (loadMore = false) => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({ limit: '20', order: 'oldest' })
      if (loadMore && cursor) params.set('cursor', cursor)

      const response = await fetch(`/api/posts/${postId}/comments?${params.toString()}`)
      if (!response.ok) throw new Error('Failed to load comments')
      const data = await response.json()

      if (loadMore) setComments(prev => [...prev, ...data.comments])
      else setComments(data.comments || [])

      // Debug logging
      console.log('[COMMENTS LIST] Post ID:', postId)
      console.log('[COMMENTS LIST] Comments count:', data.comments?.length || 0)
      console.log('[COMMENTS LIST] Sample comment:', data.comments?.[0])

      setHasMore(!!data.nextCursor)
      setCursor(data.nextCursor || null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load comments')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchComments(false) }, [postId])

  if (loading && comments.length === 0) {
    return (
      <div className="space-y-0">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="p-4 border-b border-border">
            <div className="flex space-x-3">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="flex items-center space-x-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
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
        <p className="text-red-500 mb-4">{error}</p>
        <Button variant="outline" onClick={() => fetchComments(false)} className="text-foreground border-border hover:bg-muted">
          Try again
        </Button>
      </div>
    )
  }

  if (comments.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground mb-2">Be the first to reply 👇</p>
      </div>
    )
  }

  return (
    <div className="space-y-0">
      {comments.map((comment) => (
        <div key={comment.id} className="border-b border-border/40 last:border-b-0">
          <CommentItem comment={comment} postId={postId} showReplies />
        </div>
      ))}

      {hasMore && (
        <div className="text-center py-4 border-t border-border/40">
          <Button 
            variant="ghost" 
            onClick={() => fetchComments(true)} 
            disabled={loading} 
            className="text-muted-foreground hover:text-foreground"
          >
            {loading ? 'Loading...' : 'Load more comments'}
          </Button>
        </div>
      )}
    </div>
  )
}


