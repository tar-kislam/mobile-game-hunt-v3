'use client'

import { Heart, Share2, Copy, Twitter, Linkedin, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'
import { useState } from 'react'
import { handleShareAction } from '@/lib/xp-system'

interface PostActionBarProps {
  postId: string
  likeCount: number
  isLiked?: boolean
  onLikeUpdate?: (liked: boolean, newCount: number) => void
}

export function PostActionBar({ 
  postId, 
  likeCount, 
  isLiked = false,
  onLikeUpdate 
}: PostActionBarProps) {
  const { data: session } = useSession()
  const [localIsLiked, setLocalIsLiked] = useState(isLiked)
  const [localLikeCount, setLocalLikeCount] = useState(likeCount)
  const [sharePopoverOpen, setSharePopoverOpen] = useState(false)

  const handleLike = async () => {
    if (!session?.user?.id) {
      toast.error('Please sign in to like posts')
      return
    }

    // Optimistic update
    const newLiked = !localIsLiked
    const newCount = newLiked ? localLikeCount + 1 : localLikeCount - 1
    setLocalIsLiked(newLiked)
    setLocalLikeCount(newCount)
    onLikeUpdate?.(newLiked, newCount)

    try {
      const response = await fetch('/api/community/like', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId })
      })

      if (response.ok) {
        const data = await response.json()
        setLocalIsLiked(data.liked)
        setLocalLikeCount(data.likeCount)
        onLikeUpdate?.(data.liked, data.likeCount)
      } else {
        // Revert optimistic update
        setLocalIsLiked(!newLiked)
        setLocalLikeCount(!newLiked ? localLikeCount + 1 : localLikeCount - 1)
        toast.error('Failed to like post')
      }
    } catch (error) {
      // Revert optimistic update
      setLocalIsLiked(!newLiked)
      setLocalLikeCount(!newLiked ? localLikeCount + 1 : localLikeCount - 1)
      toast.error('Failed to like post')
    }
  }

  const getPostUrl = () => {
    if (typeof window !== 'undefined') {
      return window.location.href
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
        const xpResult = await handleShareAction(session.user.id, postId)
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

  return (
    <div className="flex items-center justify-between px-4 py-3">
      {/* Like Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleLike}
        className={`flex items-center space-x-2 transition-colors ${
          localIsLiked ? 'text-red-500 hover:text-red-600' : 'text-muted-foreground hover:text-red-500'
        }`}
      >
        <Heart className={`h-5 w-5 ${localIsLiked ? 'fill-current' : ''}`} />
        <span className="text-sm">{localLikeCount}</span>
      </Button>

      {/* Share Button with Popover */}
      <Popover open={sharePopoverOpen} onOpenChange={setSharePopoverOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center space-x-2 text-muted-foreground hover:text-green-500 transition-colors"
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
  )
}