'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { CommentItem } from './comment-item'
import { CommentComposer } from './comment-composer'
import { RepliesList } from './replies-list'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'

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

interface CommentsThreadProps {
  postId: string
}

export function CommentsThread({ postId }: CommentsThreadProps) {
  const { data: session } = useSession()
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(false)
  const [cursor, setCursor] = useState<string | null>(null)
  const [showComposer, setShowComposer] = useState(false)

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
      
      const response = await fetch(`/api/posts/${postId}/comments?${params}`)
      
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
    fetchComments(false) // Refresh the list
    setShowComposer(false)
  }

  const handleReplySuccess = () => {
    // Refresh to get updated counts
    fetchComments(false)
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
      {/* Comment Composer */}
      <div className="bg-card/50 border-white/10 backdrop-blur-sm rounded-xl p-4">
        {!session?.user?.id ? (
          <div className="text-center py-4">
            <p className="text-gray-400">Please sign in to comment</p>
          </div>
        ) : !showComposer ? (
          <Button
            onClick={() => setShowComposer(true)}
            className="w-full bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white"
          >
            Add a comment...
          </Button>
        ) : (
          <CommentComposer
            postId={postId}
            parentId={null}
            onSuccess={handleCommentSuccess}
            placeholder="Share your thoughts..."
            autoFocus
          />
        )}
      </div>

      {/* Comments List */}
      {comments.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-400 mb-2">No comments yet</p>
          <p className="text-gray-500 text-sm">Be the first to start the conversation!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="bg-card/50 border-white/10 backdrop-blur-sm rounded-xl p-4">
              <CommentItem
                comment={comment}
                postId={postId}
                showReplies={true}
                onReplySuccess={handleReplySuccess}
              />
              
              {/* Replies */}
              {comment._count && comment._count.children > 0 && (
                <RepliesList
                  parentId={comment.id}
                  postId={postId}
                  initialCount={comment._count.children}
                  onReplyAdded={handleReplySuccess}
                />
              )}
            </div>
          ))}
          
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
    </div>
  )
}
