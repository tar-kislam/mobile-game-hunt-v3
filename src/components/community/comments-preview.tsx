'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { CommentItem } from './comment-item'
import Link from 'next/link'

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
  children?: Comment[]
}

interface CommentsPreviewProps {
  postId: string
  limit?: number
  onCommentAdded?: () => void
}

export function CommentsPreview({ postId, limit = 3, onCommentAdded }: CommentsPreviewProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchComments = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`/api/posts/${postId}/comments?preview=true&limit=${limit}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch comments')
      }
      
      const data = await response.json()
      setComments(data.comments || [])
    } catch (err) {
      console.error('Error fetching comments:', err)
      setError(err instanceof Error ? err.message : 'Failed to load comments')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchComments()
  }, [postId, limit])

  const handleCommentAdded = () => {
    fetchComments()
    onCommentAdded?.()
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: limit }).map((_, i) => (
          <div key={i} className="flex space-x-3">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-4">
        <p className="text-gray-400 text-sm">Failed to load comments</p>
        <Button
          variant="ghost"
          size="sm"
          onClick={fetchComments}
          className="mt-2 text-blue-400 hover:text-blue-300"
        >
          Try again
        </Button>
      </div>
    )
  }

  if (comments.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-gray-400 text-sm">No comments yet</p>
        <p className="text-gray-500 text-xs mt-1">Be the first to comment!</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {comments.map((comment) => (
          <CommentItem
            key={comment.id}
            comment={comment}
            postId={postId}
            showReplies={false}
            onReplySuccess={handleCommentAdded}
          />
        ))}
      </div>
      
      <div className="text-center">
        <Link href={`/community/post/${postId}`}>
          <Button
            variant="ghost"
            size="sm"
            className="text-blue-400 hover:text-blue-300 text-sm"
          >
            View all comments
          </Button>
        </Link>
      </div>
    </div>
  )
}
