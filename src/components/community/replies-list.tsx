'use client'

import { useState, useEffect } from 'react'
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
}

interface RepliesListProps {
  parentId: string
  postId: string
  initialCount?: number
  onReplyAdded?: () => void
}

export function RepliesList({ parentId, postId, initialCount = 0, onReplyAdded }: RepliesListProps) {
  const [replies, setReplies] = useState<Comment[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(false)
  const [cursor, setCursor] = useState<string | null>(null)
  const [showReplies, setShowReplies] = useState(false)

  const fetchReplies = async (loadMore = false) => {
    try {
      setLoading(true)
      setError(null)
      
      const params = new URLSearchParams({
        limit: '10'
      })
      
      if (loadMore && cursor) {
        params.set('cursor', cursor)
      }
      
      const response = await fetch(`/api/comments/${parentId}/replies?${params}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch replies')
      }
      
      const data = await response.json()
      
      if (loadMore) {
        setReplies(prev => [...prev, ...data.replies])
      } else {
        setReplies(data.replies || [])
      }
      
      setHasMore(!!data.nextCursor)
      setCursor(data.nextCursor || null)
    } catch (err) {
      console.error('Error fetching replies:', err)
      setError(err instanceof Error ? err.message : 'Failed to load replies')
    } finally {
      setLoading(false)
    }
  }

  const handleLoadMore = () => {
    fetchReplies(true)
  }

  const handleReplyAdded = () => {
    fetchReplies(false) // Refresh the list
    onReplyAdded?.()
  }

  if (initialCount === 0) {
    return null
  }

  return (
    <div className="ml-11 border-l-2 border-gray-700 pl-4 space-y-3">
      {!showReplies ? (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setShowReplies(true)
            fetchReplies(false)
          }}
          className="text-blue-400 hover:text-blue-300 text-sm p-0 h-auto"
        >
          View {initialCount} {initialCount === 1 ? 'reply' : 'replies'}
        </Button>
      ) : (
        <>
          {loading && replies.length === 0 ? (
            <div className="space-y-3">
              {Array.from({ length: Math.min(initialCount, 3) }).map((_, i) => (
                <div key={i} className="flex space-x-3">
                  <Skeleton className="h-6 w-6 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-8 w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {replies.map((reply) => (
                  <CommentItem
                    key={reply.id}
                    comment={reply}
                    postId={postId}
                    showReplies={false}
                    onReplySuccess={handleReplyAdded}
                  />
                ))}
              </div>
              
              {error && (
                <div className="text-center py-2">
                  <p className="text-red-400 text-sm">Failed to load replies</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => fetchReplies(false)}
                    className="mt-1 text-blue-400 hover:text-blue-300"
                  >
                    Try again
                  </Button>
                </div>
              )}
              
              {hasMore && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLoadMore}
                  disabled={loading}
                  className="text-blue-400 hover:text-blue-300 text-sm"
                >
                  {loading ? 'Loading...' : 'Load more replies'}
                </Button>
              )}
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowReplies(false)}
                className="text-gray-400 hover:text-gray-300 text-sm"
              >
                Hide replies
              </Button>
            </>
          )}
        </>
      )}
    </div>
  )
}
