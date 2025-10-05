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
  
  const handleDeletePost = (postId: string) => {
    setItems(items.filter(post => post.id !== postId))
    if (onDeletePost) {
      onDeletePost(postId)
    }
  }

  return (
    <div className="space-y-3">
      {items.map((post) => (
        <PostCard 
          key={post.id} 
          post={post}
          onDelete={handleDeletePost}
        />
      ))}
    </div>
  )
}