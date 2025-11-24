"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { XIcon, Check, ExternalLink } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import { getShareAction, SUPPORTED_PLATFORMS } from '@/lib/social/shareUrls'
import { ShareTextOptions } from '@/lib/social/shareText'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { SocialPlatformIcon } from '@/components/ui/social-platform-icons'

interface ShareGameModalProps {
  isOpen: boolean
  onClose: () => void
  gameTitle: string
  gameUrl: string
  shortPitch?: string | null
  thumbnail?: string | null
  gameId?: string
  onDontShowAgain?: (gameId: string) => void
}

/**
 * Normalize URL to always use the live site URL
 */
function normalizeUrl(url: string): string {
  const DEFAULT_SITE_URL = 'https://mobilegamehunt.com'
  if (!url) return DEFAULT_SITE_URL
  
  // Replace localhost with production URL
  const normalized = url.replace(/https?:\/\/localhost(:\d+)?/g, DEFAULT_SITE_URL)
  
  // If it's a relative path, make it absolute
  if (normalized.startsWith('/')) {
    return `${DEFAULT_SITE_URL}${normalized}`
  }
  
  // If it doesn't start with http, assume it's a path
  if (!normalized.startsWith('http')) {
    return `${DEFAULT_SITE_URL}${normalized.startsWith('/') ? '' : '/'}${normalized}`
  }
  
  return normalized
}

export function ShareGameModal({
  isOpen,
  onClose,
  gameTitle,
  gameUrl,
  shortPitch,
  thumbnail,
  gameId,
  onDontShowAgain,
}: ShareGameModalProps) {
  const [dontShowAgain, setDontShowAgain] = useState(false)
  const [copiedPlatform, setCopiedPlatform] = useState<string | null>(null)
  const [openingPlatform, setOpeningPlatform] = useState<string | null>(null)

  // Always use production URL
  const normalizedGameUrl = normalizeUrl(gameUrl)
  const normalizedThumbnail = thumbnail ? normalizeUrl(thumbnail) : null

  const shareOptions: ShareTextOptions = {
    gameTitle,
    gameUrl: normalizedGameUrl,
    shortPitch: shortPitch || null,
    thumbnail: normalizedThumbnail,
    siteUrl: 'https://mobilegamehunt.com',
  }

  const handleClose = () => {
    if (dontShowAgain && gameId && onDontShowAgain) {
      onDontShowAgain(gameId)
    }
    setDontShowAgain(false)
    setCopiedPlatform(null)
    setOpeningPlatform(null)
    onClose()
  }

  // Handle ESC key
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        handleClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscKey)
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey)
    }
  }, [isOpen])

  const handleShare = async (platform: string) => {
    const action = getShareAction(platform, shareOptions)

    if (action.type === 'url' && action.url) {
      // Open share URL in new window
      setOpeningPlatform(platform)
      window.open(action.url, '_blank', 'noopener,noreferrer')
      
      // Show confirmation
      setTimeout(() => {
        setOpeningPlatform(null)
        toast.success(`Opening ${SUPPORTED_PLATFORMS.find(p => p.id === platform)?.name || platform}...`)
      }, 300)
    } else if (action.type === 'copy' && action.text) {
      // Copy to clipboard
      try {
        await navigator.clipboard.writeText(action.text)
        setCopiedPlatform(platform)
        
        // If there's a redirect URL (Instagram, TikTok), redirect after copying
        if (action.redirectUrl) {
          toast.success(`Share text copied! Opening ${SUPPORTED_PLATFORMS.find(p => p.id === platform)?.name || platform}...`)
          setTimeout(() => {
            window.open(action.redirectUrl, '_blank', 'noopener,noreferrer')
            setCopiedPlatform(null)
          }, 500)
        } else {
          toast.success(`Share text copied! Paste it into your post on ${SUPPORTED_PLATFORMS.find(p => p.id === platform)?.name || platform}.`)
          // Reset copied state after 2 seconds
          setTimeout(() => {
            setCopiedPlatform(null)
          }, 2000)
        }
      } catch (error) {
        toast.error('Failed to copy to clipboard')
      }
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent 
        className="w-[96vw] sm:w-auto sm:max-w-2xl rounded-none sm:rounded-2xl bg-black/60 backdrop-blur-xl border border-white/10 shadow-[0_0_36px_rgba(168,85,247,0.45)] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0 data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95"
        showCloseButton={false}
      >
        {/* Custom close button */}
        <button
          onClick={handleClose}
          aria-label="Close"
          className="absolute right-3 top-3 h-7 w-7 grid place-items-center rounded-full bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white transition z-10"
        >
          <XIcon className="w-4 h-4" />
        </button>

        <AnimatePresence mode="wait">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <DialogHeader className="space-y-4">
              {/* Title with Logo */}
              <div className="flex items-center justify-center gap-3">
                <div className="relative w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0">
                  <img
                    src="/logo/mgh.png"
                    alt="MobileGameHunt Logo"
                    className="object-contain w-full h-full"
                  />
                </div>
                <DialogTitle className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
                  Share your game with the world
                </DialogTitle>
              </div>
              
              {/* Enhanced Subtitle */}
              <DialogDescription asChild>
                <div className="text-center text-gray-300 text-sm sm:text-base space-y-1">
                  <p className="leading-relaxed">
                    Share your game and profile with one click to get more players and feedback from the indie community.
                  </p>
                  <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">
                    Games that are actively shared are much more likely to get playtests and feedback.
                  </p>
                </div>
              </DialogDescription>
            </DialogHeader>

            <div className="mt-6 space-y-5">
              {/* Social platform buttons grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                {SUPPORTED_PLATFORMS.map((platform) => {
                  const isCopied = copiedPlatform === platform.id
                  const isOpening = openingPlatform === platform.id
                  
                  return (
                    <motion.button
                      key={platform.id}
                      onClick={() => handleShare(platform.id)}
                      disabled={isOpening}
                      className="group relative flex flex-col items-center justify-center gap-3 p-5 sm:p-6 rounded-2xl border border-white/10 bg-gray-900/50 hover:bg-gray-900/80 transition-all duration-200 hover:border-purple-500/50 hover:shadow-[0_0_20px_rgba(168,85,247,0.3)] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                      whileHover={{ scale: 1.03, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {/* Platform Icon */}
                      <div className="flex items-center justify-center">
                        <SocialPlatformIcon 
                          platform={platform.id} 
                          size={32}
                          className="text-gray-300 group-hover:text-white transition-colors"
                        />
                      </div>
                      
                      {/* Platform Name */}
                      <span className="text-xs sm:text-sm font-medium text-gray-200 group-hover:text-white transition-colors text-center">
                        {platform.name}
                      </span>
                      
                      {/* Status indicators */}
                      {isCopied && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="absolute inset-0 flex items-center justify-center bg-green-500/20 rounded-2xl backdrop-blur-sm"
                        >
                          <Check className="w-6 h-6 text-green-400" />
                        </motion.div>
                      )}
                      
                      {isOpening && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="absolute inset-0 flex items-center justify-center bg-purple-500/20 rounded-2xl backdrop-blur-sm"
                        >
                          <ExternalLink className="w-6 h-6 text-purple-400 animate-pulse" />
                        </motion.div>
                      )}
                    </motion.button>
                  )
                })}
              </div>

              {/* Don't show again checkbox */}
              {gameId && (
                <div className="flex items-center justify-center space-x-2 pt-4 border-t border-white/10">
                  <Checkbox
                    id="dont-show-again"
                    checked={dontShowAgain}
                    onCheckedChange={(checked) => setDontShowAgain(checked === true)}
                    className="border-white/20"
                  />
                  <Label
                    htmlFor="dont-show-again"
                    className="text-sm text-gray-400 cursor-pointer hover:text-gray-300 transition-colors"
                  >
                    Don't show this again for this game
                  </Label>
                </div>
              )}

              {/* Close button */}
              <div className="flex justify-center pt-2">
                <Button
                  variant="ghost"
                  onClick={handleClose}
                  className="text-gray-400 hover:text-white text-sm"
                >
                  Not now
                </Button>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  )
}


