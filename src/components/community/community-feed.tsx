"use client"
import { useState } from 'react'
import { PostCard } from './post-card'

interface Post {
  id: string
  content: string
  images?: string[]
  hashtags?: string[]
  createdAt: string
  user: {
    id: string
    name: string
    image?: string
  }
  _count: {
    likes: number
    comments: number
  }
  poll?: {
    id: string
    question: string
    expiresAt: string
    options: {
      id: string
      text: string
      _count: {
        votes: number
      }
    }[]
  }
}

interface CommunityFeedProps {
  posts: Post[]
  currentUserId?: string
  onTagClick?: (tag: string) => void
  onToggleLike?: (postId: string) => Promise<void> | void
  onDeletePost?: (postId: string) => void
}

export function CommunityFeed({ posts, currentUserId, onTagClick, onToggleLike, onDeletePost }: CommunityFeedProps) {
  const [items, setItems] = useState<Post[]>(posts)
  const [expandedMap, setExpandedMap] = useState<Record<string, boolean>>({})
  const [focusMap, setFocusMap] = useState<Record<string, number>>({})

  const handleDeletePost = (postId: string) => {
    setItems((prev) => prev.filter((post) => post.id !== postId))
    setExpandedMap((prev) => {
      const next = { ...prev }
      delete next[postId]
      return next
    })
    onDeletePost?.(postId)
  }

  const handleToggleComments = (postId: string) => {
    setExpandedMap((prev) => ({
      ...prev,
      [postId]: !prev[postId]
    }))
  }

  const handleReplyRequest = (postId: string) => {
    setExpandedMap((prev) => ({
      ...prev,
      [postId]: true
    }))

    setFocusMap((prev) => ({
      ...prev,
      [postId]: (prev[postId] || 0) + 1
    }))
  }

  const handleCommentAdded = (postId: string) => {
    setItems((prev) =>
      prev.map((post) =>
        post.id === postId
          ? {
              ...post,
              _count: {
                ...post._count,
                comments: (post._count.comments || 0) + 1
              }
            }
          : post
      )
    )
  }

  return (
    <div className="space-y-3">
      {items.map((post) => (
        <PostCard 
          key={post.id} 
          post={post}
          onDelete={handleDeletePost}
          isCommentsOpen={Boolean(expandedMap[post.id])}
          onToggleComments={() => handleToggleComments(post.id)}
          onCommentAdded={() => handleCommentAdded(post.id)}
          onReplyRequest={() => handleReplyRequest(post.id)}
          focusKey={focusMap[post.id] || 0}
        />
      ))}
    </div>
  )
}