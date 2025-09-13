"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Star, MessageCircle, ExternalLink } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

interface Game {
  id: string
  title: string
  tagline?: string | null
  description: string
  image?: string | null
  thumbnail?: string | null
  images?: string[]
  gallery?: string[]
  gameplayGifUrl?: string | null
  url: string
  platforms?: string[]
  _count: {
    votes: number
    comments: number
  }
  user: {
    name: string | null
    image?: string | null
  }
}

interface TapTapGameCardProps {
  game: Game
  onVote?: (gameId: string) => void
  showAuthor?: boolean
}

// Helper function to get the main display image for product cards
function getMainDisplayImage(game: Game): string | null {
  // Priority: first gallery image > first images array item > thumbnail (for small contexts only)
  if (game.images && game.images.length > 0) {
    return game.images[0]
  }
  if (game.gallery && Array.isArray(game.gallery) && game.gallery.length > 0) {
    return game.gallery[0]
  }
  // Only use thumbnail as fallback for small contexts
  return game.thumbnail || game.image || null
}

export function TapTapGameCard({ game, onVote, showAuthor = true }: TapTapGameCardProps) {
  const handleVote = () => {
    onVote?.(game.id)
  }

  const handleExternalLink = (e: React.MouseEvent) => {
    e.stopPropagation()
    window.open(game.url, '_blank', 'noopener,noreferrer')
  }

  return (
    <Link href={`/product/${game.id}`} className="block group">
      <Card className="overflow-hidden bg-card hover:shadow-lg transition-all duration-300 border border-white/10 shadow-lg rounded-xl group-hover:scale-[1.02] hover:shadow-black/20">
        {/* Game Image */}
        <div className="relative aspect-square bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
          {getMainDisplayImage(game) ? (
            <Image
              src={getMainDisplayImage(game) as string}
              alt={game.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              unoptimized={true}
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.style.display = 'none';
                if (e.currentTarget.parentElement) {
                  const fallback = e.currentTarget.parentElement.querySelector('.fallback-icon');
                  if (fallback) {
                    (fallback as HTMLElement).style.display = 'flex';
                  }
                }
              }}
            />
          ) : null}
          
          {/* Fallback icon */}
          <div className={`fallback-icon w-full h-full flex items-center justify-center ${getMainDisplayImage(game) ? 'hidden' : ''}`}>
            <div className="text-4xl">🎮</div>
          </div>

          {/* Rating Badge - positioned like TapTap */}
          <div className="absolute top-2 right-2">
            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg px-2 py-1 flex items-center gap-1 shadow-sm">
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                {(game._count.votes / 10).toFixed(1)}
              </span>
            </div>
          </div>

          {/* Category Badge */}
          <div className="absolute top-3 left-3">
            <Badge 
              className="bg-black/70 text-white text-xs px-2 py-1 rounded-md font-medium border-0"
            >
              {game.platforms && game.platforms.length > 0 
                ? game.platforms.map(platform => platform.toUpperCase()).join(', ')
                : 'No platforms listed'
              }
            </Badge>
          </div>

          {/* Tagline */}
          {game.tagline && (
            <p className="text-xs text-gray-500 dark:text-gray-300 line-clamp-1 mb-2">
              {game.tagline}
            </p>
          )}
        </div>

        <CardContent className="p-3">
          {/* Title */}
          <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100 line-clamp-1 mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {game.title}
          </h3>

          {/* Tagline */}
          {/* The original code had game.tagline, but the new Game interface doesn't have it.
              Assuming the intent was to remove it or that it will be added back if needed.
              For now, removing it as it's not in the new Game interface. */}
          {/* {game.tagline && (
            <p className="text-xs text-gray-500 dark:text-gray-300 line-clamp-1 mb-2">
              {game.tagline}
            </p>
          )} */}

          {/* Stats Row */}
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-3">
              {/* Votes */}
              <button
                onClick={(e) => {
                  e.preventDefault()
                  handleVote()
                }}
                className="flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                <Star className="w-3 h-3" />
                <span>{game._count.votes}</span>
              </button>

              {/* Comments */}
              <div className="flex items-center gap-1">
                <MessageCircle className="w-3 h-3" />
                <span>{game._count.comments}</span>
              </div>
            </div>

            {/* External Link */}
            <button
              onClick={handleExternalLink}
              className="flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors p-1"
            >
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>

          {/* Author (if shown) */}
          {showAuthor && (
            <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-100">
              <div className="w-4 h-4 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-[8px] font-bold">
                {game.user.name?.[0]?.toUpperCase() || 'U'}
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {game.user.name || 'Anonymous'}
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}
