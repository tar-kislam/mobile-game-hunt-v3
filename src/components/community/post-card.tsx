'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { UserAvatarTooltip } from '@/components/ui/user-avatar-tooltip'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Heart, MessageCircle, Share, Trash2 } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'
import { PollDisplay } from './enhanced-poll-display'

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

interface PostCardProps {
  post: Post
  onDelete?: (postId: string) => void
}

export function PostCard({ post, onDelete }: PostCardProps) {
  const { data: session } = useSession()
  const [isLiked, setIsLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(post._count.likes)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const handleLike = async () => {
    if (!session) {
      toast.error('Please sign in to like posts')
      return
    }

    try {
      const response = await fetch('/api/community/like', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ postId: post.id }),
      })

      if (response.ok) {
        const data = await response.json()
        setIsLiked(data.liked)
        setLikeCount(data.likeCount)
      }
    } catch (error) {
      console.error('Error liking post:', error)
    }
  }

  const handleCommentClick = () => {
    if (!session?.user?.id) {
      toast.error('Please sign in to comment')
      return
    }
    // Future: open comment input or navigate to detail
  }

  const handleShareClick = () => {
    if (!session?.user?.id) {
      toast.error('Please sign in to share posts')
      return
    }
    // Future: open share menu
  }

  const handleDelete = async () => {
    if (!session) {
      toast.error('Please sign in to delete posts')
      return
    }

    try {
      const response = await fetch(`/api/community/posts/${post.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        toast.success('Post deleted successfully')
        setIsDeleteDialogOpen(false)
        // Call the onDelete callback if provided
        if (onDelete) {
          onDelete(post.id)
        } else {
          // Fallback: reload only if no callback provided
          window.location.reload()
        }
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || 'Failed to delete post')
      }
    } catch (error) {
      console.error('Error deleting post:', error)
      toast.error('Failed to delete post')
    }
  }

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

  return (
    <Card className="bg-card/50 border-white/10 backdrop-blur-sm" data-post-id={post.id}>
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Post Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <UserAvatarTooltip
                userId={post.user.id}
                userName={post.user.name}
                userImage={post.user.image || null}
                size="md"
                requireAuthOnClick
              />
              <div>
                <p className="font-medium text-gray-200">{post.user.name}</p>
                <p className="text-sm text-gray-400">{formatTimeAgo(post.createdAt)}</p>
              </div>
            </div>
            {/* Delete button - only show for post owner */}
            {session?.user?.id === post.user.id && (
              <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <DialogTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-gray-400 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Delete Post</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <DialogContent className="sm:max-w-[425px] bg-gray-900 border-gray-700">
                  <DialogHeader>
                    <DialogTitle className="text-white">Delete Post</DialogTitle>
                    <DialogDescription className="text-gray-300">
                      Are you sure you want to delete this post? This action cannot be undone.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button
                      variant="secondary"
                      onClick={() => setIsDeleteDialogOpen(false)}
                      className="bg-gray-700 hover:bg-gray-600 text-white"
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={handleDelete}
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      Delete
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>

          {/* Post Content */}
          {post.content && (
            <div className="text-gray-200 whitespace-pre-wrap break-words">
              {post.content}
            </div>
          )}

          {/* Hashtags */}
          {post.hashtags && post.hashtags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {post.hashtags.map((hashtag, index) => (
                <Badge key={index} variant="secondary" className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                  #{hashtag}
                </Badge>
              ))}
            </div>
          )}

          {/* Images */}
          {post.images && post.images.length > 0 && (
            <div className="grid grid-cols-2 gap-2">
              {post.images.map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`Post image ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg border border-white/20"
                />
              ))}
            </div>
          )}

          {/* Poll Display */}
          {post.poll && (
            <PollDisplay
              postId={post.id}
              poll={{
                id: post.poll.id,
                question: post.poll.question,
                expiresAt: post.poll.expiresAt,
                isExpired: new Date(post.poll.expiresAt) < new Date()
              }}
              options={post.poll.options.map(option => ({
                id: option.id,
                text: option.text,
                votesCount: option._count.votes,
                percentage: 0 // Will be calculated by the component
              }))}
              userVote={null}
              hasVoted={false}
              totalVotes={post.poll.options.reduce((sum, opt) => sum + opt._count.votes, 0)}
            />
          )}

          {/* Post Actions */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-700">
            <div className="flex items-center space-x-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLike}
                className={`flex items-center space-x-2 ${
                  isLiked ? 'text-red-500' : 'text-gray-400 hover:text-red-500'
                }`}
              >
                <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
                <span>{likeCount}</span>
              </Button>
              <Button variant="ghost" size="sm" onClick={handleCommentClick} className="flex items-center space-x-2 text-gray-400 hover:text-blue-500">
                <MessageCircle className="h-4 w-4" />
                <span>{post._count.comments}</span>
              </Button>
              <Button variant="ghost" size="sm" onClick={handleShareClick} className="text-gray-400 hover:text-green-500">
                <Share className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
