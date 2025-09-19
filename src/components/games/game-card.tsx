"use client"

import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowUpRight, Heart, MessageCircle, ExternalLink } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { PlatformIcons } from "@/components/ui/platform-icons"
// import { formatDistanceToNow } from "date-fns" // Temporarily commented

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
  createdAt: string
  releaseAt?: string | null
  status?: string
  monetization?: string | null
  engine?: string | null
  pricing?: string | null
  categories?: Array<{
    category: {
      id: string
      name: string
    }
  }>
  tags?: string[]
  _count: {
    votes: number
    comments: number
  }
  user: {
    name: string | null
    image?: string | null
  }
}

interface GameCardProps {
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

export function GameCard({ game, onVote, showAuthor = true }: GameCardProps) {
  const handleVote = () => {
    onVote?.(game.id)
  }

  const handleExternalLink = (e: React.MouseEvent) => {
    e.stopPropagation()
    window.open(game.url, '_blank', 'noopener,noreferrer')
  }

  return (
    <Card className="group h-full flex flex-col bg-card hover:shadow-medium transition-all duration-300 border border-white/10 shadow-lg rounded-2xl overflow-hidden hover:scale-[1.02] hover:shadow-black/20">
      {/* Game Image */}
      <div className="relative aspect-video bg-gradient-to-br from-purple-100 to-blue-100 overflow-hidden">
        {getMainDisplayImage(game) ? (
          <Image
            src={getMainDisplayImage(game) as string}
            alt={game.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            unoptimized={true}
            onError={(e) => {
              // Prevent infinite retries
              e.currentTarget.onerror = null;
              // Hide broken image and show fallback
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
        {/* Fallback icon - always present but hidden when image loads */}
        <div className={`fallback-icon w-full h-full flex items-center justify-center ${getMainDisplayImage(game) ? 'hidden' : ''}`}>
          <div className="text-6xl">🎮</div>
        </div>
        
        {/* Platform Icons */}
        <div className="absolute top-2 left-2">
          <PlatformIcons 
            platforms={game.platforms || []} 
            size="sm" 
            className="backdrop-blur-sm"
          />
        </div>

        {/* External Link Button */}
        <Button
          size="sm"
          variant="secondary"
          className="absolute top-3 right-3 bg-white/90 backdrop-blur hover:bg-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          onClick={handleExternalLink}
        >
          <ExternalLink className="w-4 h-4" />
        </Button>
      </div>

      <CardContent className="flex-1 p-4 space-y-3">
        {/* Title and Tagline */}
        <div>
          <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100 line-clamp-1 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
            {game.title}
          </h3>
          {game.tagline && (
            <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-1 mt-1">
              {game.tagline}
            </p>
          )}
        </div>

        {/* Description */}
        <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2 leading-relaxed">
          {game.description}
        </p>

        {/* Categories */}
        {game.categories && game.categories.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {game.categories.slice(0, 3).map((cat) => (
              <Badge key={cat.category.id} variant="secondary" className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                {cat.category.name}
              </Badge>
            ))}
            {game.categories.length > 3 && (
              <Badge variant="outline" className="text-xs text-gray-500">
                +{game.categories.length - 3} more
              </Badge>
            )}
          </div>
        )}

        {/* Tags */}
        {game.tags && game.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {game.tags.slice(0, 2).map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                #{tag}
              </Badge>
            ))}
            {game.tags.length > 2 && (
              <Badge variant="outline" className="text-xs text-gray-500">
                +{game.tags.length - 2} more
              </Badge>
            )}
          </div>
        )}

        {/* Release Status */}
        {game.status && (
          <div className="flex items-center gap-2">
            <Badge 
              variant={game.status === 'PUBLISHED' ? 'default' : 'secondary'}
              className={`text-xs ${
                game.status === 'PUBLISHED' 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                  : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
              }`}
            >
              {game.status === 'PUBLISHED' ? 'Published' : 'Draft'}
            </Badge>
            {game.releaseAt && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {new Date(game.releaseAt).toLocaleDateString()}
              </span>
            )}
          </div>
        )}

        {/* Author */}
        {showAuthor && (
          <div className="flex items-center space-x-2 pt-2">
            <div className="w-6 h-6 bg-gradient-to-br from-purple-400 to-blue-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
              {game.user.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              by {game.user.name || 'Anonymous'}
            </span>
          </div>
        )}
      </CardContent>

      <CardFooter className="p-4 pt-0 flex items-center justify-between">
        {/* Vote Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleVote}
          className="flex items-center space-x-1 text-gray-600 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/30 rounded-full px-3 py-1"
        >
          <Heart className="w-4 h-4" />
          <span className="text-sm font-medium">{game._count.votes}</span>
        </Button>

        {/* Comments Count */}
        <div className="flex items-center space-x-1 text-gray-500 dark:text-gray-400">
          <MessageCircle className="w-4 h-4" />
          <span className="text-sm">{game._count.comments}</span>
        </div>

        {/* Date */}
        <span className="text-xs text-gray-400 dark:text-gray-500">
          {new Date(game.createdAt).toLocaleDateString()}
        </span>
      </CardFooter>
    </Card>
  )
}
