'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { UserAvatarTooltip } from '@/components/ui/user-avatar-tooltip'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Heart, Share2, Copy, Twitter, Linkedin, MessageCircle, Trash2, X } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'
import { PollDisplay } from './enhanced-poll-display'
import { handleShareAction } from '@/lib/xp-system'

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
  const [sharePopoverOpen, setSharePopoverOpen] = useState(false)
  const [imageModalOpen, setImageModalOpen] = useState(false)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)

  const handleLike = async () => {
    if (!session?.user?.id) {
      toast.error('Please sign in to like posts')
      return
    }

    // Optimistic update
    const newLiked = !isLiked
    const newCount = newLiked ? likeCount + 1 : likeCount - 1
    setIsLiked(newLiked)
    setLikeCount(newCount)

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
      } else {
        // Revert optimistic update
        setIsLiked(!newLiked)
        setLikeCount(!newLiked ? likeCount + 1 : likeCount - 1)
        toast.error('Failed to like post')
      }
    } catch (error) {
      // Revert optimistic update
      setIsLiked(!newLiked)
      setLikeCount(!newLiked ? likeCount + 1 : likeCount - 1)
      toast.error('Failed to like post')
    }
  }

  const getPostUrl = () => {
    if (typeof window !== 'undefined') {
      return `${window.location.origin}/community/post/${post.id}`
    }
    return ''
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(getPostUrl())
      toast.success('Link copied to clipboard!')
      setSharePopoverOpen(false)
    } catch (error) {
      toast.error('Failed to copy link')
    }
  }

  const handleShareToPlatform = async (platform: string) => {
    const url = getPostUrl()
    let shareUrl = ''

    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}`
        break
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`
        break
      case 'reddit':
        shareUrl = `https://reddit.com/submit?url=${encodeURIComponent(url)}`
        break
      case 'whatsapp':
        shareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(url)}`
        break
      default:
        return
    }

    window.open(shareUrl, '_blank', 'noopener,noreferrer')
    
    // Award XP for sharing (only for external platforms)
    if (session?.user?.id && ['twitter', 'linkedin', 'reddit', 'whatsapp'].includes(platform)) {
      try {
        const xpResult = await handleShareAction(session.user.id, post.id)
        if (xpResult.success && xpResult.xpDelta > 0) {
          console.log(`[XP] Awarded ${xpResult.xpDelta} XP to user ${session.user.id} for sharing`)
        }
      } catch (xpError) {
        console.error('[XP] Error awarding XP for sharing:', xpError)
        // Don't show error to user for XP failures
      }
    }
    
    setSharePopoverOpen(false)
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

  const handleImageClick = (index: number) => {
    setSelectedImageIndex(index)
    setImageModalOpen(true)
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
            <div className="mt-3">
              {post.images.length === 1 ? (
                // Single image - Twitter style large display
                <div className="relative">
                  <img
                    src={post.images[0]}
                    alt={`Post image`}
                    className="w-full max-h-96 object-cover rounded-xl border border-white/10 cursor-pointer hover:opacity-95 transition-opacity"
                    onClick={() => handleImageClick(0)}
                  />
                </div>
              ) : post.images.length === 2 ? (
                // Two images - side by side
                <div className="grid grid-cols-2 gap-2">
                  {post.images.map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={`Post image ${index + 1}`}
                      className="w-full h-48 object-cover rounded-xl border border-white/10 cursor-pointer hover:opacity-95 transition-opacity"
                      onClick={() => handleImageClick(index)}
                    />
                  ))}
                </div>
              ) : post.images.length === 3 ? (
                // Three images - one large, two small
                <div className="grid grid-cols-2 gap-2">
                  <img
                    src={post.images[0]}
                    alt={`Post image 1`}
                    className="w-full h-48 object-cover rounded-xl border border-white/10 cursor-pointer hover:opacity-95 transition-opacity"
                    onClick={() => handleImageClick(0)}
                  />
                  <div className="grid grid-rows-2 gap-2">
                    {post.images.slice(1).map((image, index) => (
                      <img
                        key={index + 1}
                        src={image}
                        alt={`Post image ${index + 2}`}
                        className="w-full h-23 object-cover rounded-xl border border-white/10 cursor-pointer hover:opacity-95 transition-opacity"
                        onClick={() => handleImageClick(index + 1)}
                      />
                    ))}
                  </div>
                </div>
              ) : (
                // Four or more images - 2x2 grid with more indicator
                <div className="grid grid-cols-2 gap-2">
                  {post.images.slice(0, 4).map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={image}
                        alt={`Post image ${index + 1}`}
                        className="w-full h-32 object-cover rounded-xl border border-white/10 cursor-pointer hover:opacity-95 transition-opacity"
                        onClick={() => handleImageClick(index)}
                      />
                      {index === 3 && post.images && post.images.length > 4 && (
                        <div className="absolute inset-0 bg-black/60 rounded-xl flex items-center justify-center cursor-pointer hover:bg-black/70 transition-colors"
                             onClick={() => handleImageClick(0)}>
                          <span className="text-white font-semibold text-lg">
                            +{post.images.length - 4}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
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
              {/* Like Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLike}
                className={`flex items-center space-x-2 transition-colors ${
                  isLiked ? 'text-red-500 hover:text-red-600' : 'text-gray-400 hover:text-red-500'
                }`}
              >
                <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
                <span className="text-sm">{likeCount}</span>
              </Button>

              {/* Share Button with Popover */}
              <Popover open={sharePopoverOpen} onOpenChange={setSharePopoverOpen}>
                <PopoverTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="flex items-center space-x-2 text-gray-400 hover:text-green-500 transition-colors"
                  >
                    <Share2 className="h-5 w-5" />
                    <span className="text-sm">Share</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-48 p-2" align="center">
                  <div className="flex flex-col gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCopyLink}
                      className="flex items-center space-x-2 justify-start text-sm hover:bg-muted/40"
                    >
                      <Copy className="h-4 w-4" />
                      <span>Copy Link</span>
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleShareToPlatform('twitter')}
                      className="flex items-center space-x-2 justify-start text-sm hover:bg-muted/40"
                    >
                      <Twitter className="h-4 w-4" />
                      <span>Share to X</span>
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleShareToPlatform('linkedin')}
                      className="flex items-center space-x-2 justify-start text-sm hover:bg-muted/40"
                    >
                      <Linkedin className="h-4 w-4" />
                      <span>Share to LinkedIn</span>
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleShareToPlatform('reddit')}
                      className="flex items-center space-x-2 justify-start text-sm hover:bg-muted/40"
                    >
                      <MessageCircle className="h-4 w-4" />
                      <span>Share to Reddit</span>
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleShareToPlatform('whatsapp')}
                      className="flex items-center space-x-2 justify-start text-sm hover:bg-muted/40"
                    >
                      <MessageCircle className="h-4 w-4" />
                      <span>Share to WhatsApp</span>
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>
      </CardContent>

      {/* Image Modal */}
      <Dialog open={imageModalOpen} onOpenChange={setImageModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] bg-black/95 border-gray-700 p-0 overflow-hidden">
          <DialogTitle className="sr-only">
            Post Image {selectedImageIndex + 1} of {post.images?.length || 1}
          </DialogTitle>
          <div className="relative">
            {/* Close Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setImageModalOpen(false)}
              className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/70 text-white border-0"
            >
              <X className="h-6 w-6" />
            </Button>

            {/* Image Display */}
            {post.images && post.images.length > 0 && post.images[selectedImageIndex] && (
              <div className="flex items-center justify-center min-h-[60vh]">
                <img
                  src={post.images[selectedImageIndex]}
                  alt={`Post image ${selectedImageIndex + 1}`}
                  className="max-w-full max-h-[80vh] object-contain rounded-lg"
                />
              </div>
            )}

            {/* Navigation for multiple images */}
            {post.images && post.images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                {post.images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`w-3 h-3 rounded-full transition-colors ${
                      index === selectedImageIndex 
                        ? 'bg-white' 
                        : 'bg-white/50 hover:bg-white/70'
                    }`}
                    aria-label={`View image ${index + 1}`}
                  />
                ))}
              </div>
            )}

            {/* Image Counter */}
            {post.images && post.images.length > 1 && (
              <div className="absolute top-4 left-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                {selectedImageIndex + 1} / {post.images.length}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  )
}