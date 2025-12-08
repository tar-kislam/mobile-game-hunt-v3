"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ExternalLink, ArrowUpIcon, X, AlertCircle } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { QuestGameResult } from "@/lib/quest/types"
import { useSession } from "next-auth/react"
import { motion, AnimatePresence } from "framer-motion"

interface QuestGameCardProps {
  game: QuestGameResult
}

export function QuestGameCard({ game }: QuestGameCardProps) {
  const { data: session } = useSession()
  const [feedbackSent, setFeedbackSent] = useState(false)
  const [showFeedback, setShowFeedback] = useState(false)
  
  // Debug: Log session status
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    console.log('[QuestGameCard] Session:', !!session, 'Feedback sent:', feedbackSent, 'Show feedback:', showFeedback)
  }

  const handleFeedback = async (reason: 'NOT_MY_STYLE' | 'WRONG_PLATFORM' | 'NOT_INTERESTED' | 'OTHER') => {
    if (!session || feedbackSent) return

    try {
      // For external games, use title as identifier since id might be null
      const gameIdentifier = game.id || game.title || 'unknown'
      
      const response = await fetch('/api/quest/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          gameId: gameIdentifier,
          reason,
          matchRank: game.matchRank,
          gameTitle: game.title,
          gameSource: game.source, // Include source (internal/external)
          gameStore: game.store, // Include store for external games
        }),
      })

      if (response.ok) {
        setFeedbackSent(true)
        setShowFeedback(false)
        
        // Redirect to game URL after feedback
        setTimeout(() => {
          if (game.source === 'internal' && game.links.internalProductUrl) {
            window.location.href = game.links.internalProductUrl
          } else if (game.source === 'external' && game.links.externalStoreUrl) {
            window.open(game.links.externalStoreUrl, '_blank', 'noopener,noreferrer')
          }
        }, 500) // Small delay to show feedback confirmation
      } else {
        const errorData = await response.json().catch(() => ({}))
        console.error('Failed to send feedback:', errorData)
      }
    } catch (error) {
      console.error('Failed to send feedback:', error)
    }
  }

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't navigate if clicking on feedback buttons
    const target = e.target as HTMLElement
    if (target.closest('.feedback-container') || target.closest('button') || target.closest('a')) {
      return
    }
    
    if (game.source === 'external' && game.links.externalStoreUrl) {
      e.preventDefault()
      const url = game.links.externalStoreUrl
      
      // Validate URL before opening
      if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
        console.log('[QuestGameCard] Opening external store URL:', url)
        window.open(url, '_blank', 'noopener,noreferrer')
      } else {
        console.error('[QuestGameCard] Invalid external store URL:', url)
      }
    }
    // For internal games, Link component will handle navigation
  }

  const cardContent = (
    <Card className="overflow-hidden bg-card hover:shadow-lg transition-all duration-300 border border-white/10 shadow-lg rounded-xl hover:shadow-black/20 h-full flex flex-col cursor-pointer group">
      {/* Game Image */}
      <div className="relative aspect-square bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
        {game.thumbnailUrl ? (
          game.source === 'external' ? (
            // External games: use regular img tag to avoid Next.js Image domain restrictions
            <img
              src={game.thumbnailUrl}
              alt={game.title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              onError={(e) => {
                e.currentTarget.onerror = null
                e.currentTarget.style.display = 'none'
                if (e.currentTarget.parentElement) {
                  const fallback = e.currentTarget.parentElement.querySelector('.fallback-icon')
                  if (fallback) {
                    (fallback as HTMLElement).style.display = 'flex'
                  }
                }
              }}
            />
          ) : (
            // Internal games: use Next.js Image component
            <Image
              src={game.thumbnailUrl}
              alt={game.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              unoptimized={true}
              onError={(e) => {
                e.currentTarget.onerror = null
                e.currentTarget.style.display = 'none'
                if (e.currentTarget.parentElement) {
                  const fallback = e.currentTarget.parentElement.querySelector('.fallback-icon')
                  if (fallback) {
                    (fallback as HTMLElement).style.display = 'flex'
                  }
                }
              }}
            />
          )
        ) : null}
        
        {/* Fallback icon */}
        <div className={`fallback-icon absolute inset-0 flex items-center justify-center text-4xl text-gray-400 ${game.thumbnailUrl ? 'hidden' : ''}`}>
          <img src="/logo/logo-gamepad.webp" alt="Game" className="w-16 h-16 opacity-50" />
        </div>

        {/* Match Badge - Top Left */}
        <div className="absolute top-3 left-3">
          <Badge 
            className="bg-black/70 text-white text-xs px-2 py-1 rounded-md font-medium border-0"
          >
            #{game.matchRank} Match
          </Badge>
        </div>

        {/* Top Right Badge - Verified or Store */}
        <div className="absolute top-2 right-2 flex gap-2">
          {game.source === 'internal' && game.verified ? (
            <Badge 
              variant="secondary" 
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-sm border-0"
            >
              ✓ Verified
            </Badge>
          ) : game.source === 'external' && game.store ? (
            <Badge 
              variant="secondary" 
              className="bg-black/70 text-white text-xs font-bold px-2 py-1 rounded-full shadow-sm border-0"
            >
              {game.store === 'apple_app_store' ? '🍎 App Store' : '▶️ Play Store'}
            </Badge>
          ) : null}

          {/* Upvote badge - only for internal games */}
          {game.source === 'internal' && game.metrics?.likes !== undefined && (
            <Badge 
              variant="secondary" 
              className="bg-[rgb(60,41,100)] text-white text-xs font-bold px-2 py-1 rounded-full shadow-sm"
            >
              ⭐ {game.metrics.likes}
            </Badge>
          )}
        </div>
      </div>

      {/* Game Info */}
      <CardContent className="p-3 flex-1 flex flex-col">
        {/* Title */}
        <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100 line-clamp-1 mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {game.title}
        </h3>

        {/* Short Pitch */}
        {game.shortPitch && (
          <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2 mb-2">
            {game.shortPitch}
          </p>
        )}

        {/* Why this game? - Match explanation */}
        {game.source === 'internal' && game.reasons && game.reasons.length > 0 && (
          <div className="mb-2">
            <p className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">
              Matched:
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
              {game.reasons.join(' • ')}
            </p>
          </div>
        )}

        {/* Categories */}
        {game.categories.length > 0 && (
          <div className="mb-2">
            <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
              {game.categories.slice(0, 2).join(' • ')}
            </p>
          </div>
        )}

        {/* Stats - Only for internal games */}
        {game.source === 'internal' && (
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-2 mt-auto">
            <div className="flex items-center gap-3">
              {game.metrics?.likes !== undefined && (
                <div className="flex items-center gap-1">
                  <ArrowUpIcon className="w-3 h-3" />
                  <span className="font-medium">{game.metrics.likes}</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-1">
              <ExternalLink className="w-3 h-3" />
            </div>
          </div>
        )}

        {/* Feedback buttons - For ALL games (internal and external) and authenticated users */}
        {session && !feedbackSent && (
          <div 
            className="feedback-container mt-2 pt-2 border-t border-gray-200 dark:border-gray-700 relative z-10" 
            onClick={(e) => {
              e.stopPropagation()
              e.preventDefault()
            }}
            onMouseDown={(e) => {
              e.stopPropagation()
            }}
          >
            {!showFeedback ? (
              <motion.button
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  console.log('[QuestGameCard] Feedback button clicked, opening feedback modal')
                  setShowFeedback(true)
                }}
                className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 flex items-center gap-1 w-full py-1.5 px-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.2 }}
                style={{ pointerEvents: 'auto' }}
              >
                <AlertCircle className="w-3.5 h-3.5" />
                <span className="font-medium">Not right for me?</span>
              </motion.button>
            ) : (
              <AnimatePresence>
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{
                    duration: 0.3,
                    ease: [0.22, 1, 0.36, 1]
                  }}
                  className="flex flex-col gap-1"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">Why not?</span>
                    <motion.button
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        setShowFeedback(false)
                      }}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      whileHover={{ scale: 1.1, rotate: 90 }}
                      whileTap={{ scale: 0.9 }}
                      transition={{ duration: 0.2 }}
                    >
                      <X className="w-3 h-3" />
                    </motion.button>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1, duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs h-7 px-3 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200 dark:border-purple-800 hover:from-purple-100 hover:to-pink-100 dark:hover:from-purple-800/30 dark:hover:to-pink-800/30"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          handleFeedback('WRONG_PLATFORM')
                        }}
                      >
                        Wrong Platform
                      </Button>
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.15, duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs h-7 px-3 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200 dark:border-purple-800 hover:from-purple-100 hover:to-pink-100 dark:hover:from-purple-800/30 dark:hover:to-pink-800/30"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          handleFeedback('NOT_MY_STYLE')
                        }}
                      >
                        Not My Style
                      </Button>
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2, duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs h-7 px-3 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200 dark:border-purple-800 hover:from-purple-100 hover:to-pink-100 dark:hover:from-purple-800/30 dark:hover:to-pink-800/30"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          handleFeedback('NOT_INTERESTED')
                        }}
                      >
                        Not Interested
                      </Button>
                    </motion.div>
                  </div>
                </motion.div>
              </AnimatePresence>
            )}
          </div>
        )}

        {/* Feedback sent confirmation */}
        <AnimatePresence>
          {feedbackSent && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{
                duration: 0.3,
                ease: [0.22, 1, 0.36, 1]
              }}
              className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700"
            >
              <p className="text-xs text-green-600 dark:text-green-400 font-medium flex items-center gap-1">
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                >
                  ✓
                </motion.span>
                <span>Thanks for your feedback! Redirecting...</span>
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* External games - show store link hint */}
        {game.source === 'external' && (
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-auto pt-2">
            <div className="flex items-center justify-end gap-1">
              <span>View in store</span>
              <ExternalLink className="w-3 h-3" />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )

  // Wrap in Link for internal games, plain div for external (handled by onClick)
  // But prevent navigation when clicking on feedback buttons
  if (game.source === 'internal' && game.links.internalProductUrl) {
    return (
      <Link 
        href={game.links.internalProductUrl}
        className="block"
        onClick={(e) => {
          // Don't navigate if clicking on feedback buttons
          const target = e.target as HTMLElement
          if (target.closest('.feedback-container') || target.closest('button')) {
            e.preventDefault()
            return
          }
          handleCardClick(e)
        }}
      >
        {cardContent}
      </Link>
    )
  }

  return (
    <div onClick={handleCardClick}>
      {cardContent}
    </div>
  )
}

