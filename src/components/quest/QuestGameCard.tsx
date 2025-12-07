"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, ArrowUpIcon } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { QuestGameResult } from "@/lib/quest/types"

interface QuestGameCardProps {
  game: QuestGameResult
}

export function QuestGameCard({ game }: QuestGameCardProps) {
  const handleCardClick = (e: React.MouseEvent) => {
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

        {/* Why this game? - Only for internal games */}
        {game.source === 'internal' && game.reasons && game.reasons.length > 0 && (
          <div className="mb-2">
            <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
              {game.reasons.slice(0, 2).join(' • ')}
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
  if (game.source === 'internal' && game.links.internalProductUrl) {
    return (
      <Link 
        href={game.links.internalProductUrl}
        className="block"
        onClick={handleCardClick}
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

