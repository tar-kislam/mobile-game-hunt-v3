"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Heart, MessageCircle, ExternalLink, Calendar, Eye } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { PlatformIcons } from "@/components/ui/platform-icons"
import { formatDistanceToNow } from "date-fns"

interface Game {
  id: string
  title: string
  slug: string
  tagline?: string | null
  description: string
  thumbnail?: string | null
  image?: string | null
  url: string
  platforms?: string[]
  createdAt: string
  releaseAt?: string | null
  clicks: number
  _count: {
    votes: number
    comments: number
  }
  user: {
    name: string | null
    image?: string | null
  }
}

interface GogGameCardProps {
  game: Game
  onVote?: (gameId: string) => void
}

export function GogGameCard({ game, onVote }: GogGameCardProps) {
  const handleVote = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onVote?.(game.id)
  }

  const handleExternalLink = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    window.open(game.url, '_blank', 'noopener,noreferrer')
  }

  const getReleaseStatus = () => {
    if (!game.releaseAt) return null
    
    const releaseDate = new Date(game.releaseAt)
    const now = new Date()
    
    if (releaseDate > now) {
      return {
        status: 'upcoming',
        text: `Releases ${formatDistanceToNow(releaseDate, { addSuffix: true })}`,
        color: 'bg-blue-500/20 text-blue-300 border-blue-500/30'
      }
    } else {
      return {
        status: 'released',
        text: `Released ${formatDistanceToNow(releaseDate, { addSuffix: true })}`,
        color: 'bg-green-500/20 text-green-300 border-green-500/30'
      }
    }
  }

  const releaseInfo = getReleaseStatus()
  const coverImage = game.thumbnail || game.image

  return (
    <Link href={`/product/${game.slug}`}>
      <Card className="group h-full flex flex-col bg-transparent hover:bg-card/20 transition-all duration-300 border-0 hover:border-purple-500/30 rounded-lg overflow-hidden hover:scale-[1.02] hover:shadow-lg hover:shadow-purple-500/20 products-font">
        {/* Game Cover Image - GOG Style */}
        <div className="relative aspect-[3/4] bg-gradient-to-br from-gray-800 to-gray-900 overflow-hidden rounded-lg">
          {coverImage ? (
            <Image
              src={coverImage}
              alt={game.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
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
          <div className={`fallback-icon w-full h-full flex items-center justify-center ${coverImage ? 'hidden' : ''}`}>
            <div className="text-6xl text-gray-600">🎮</div>
          </div>
          
          {/* Platform Icons - Top Left */}
          <div className="absolute top-2 left-2">
            <PlatformIcons 
              platforms={game.platforms || []} 
              size="sm" 
              className="backdrop-blur-sm"
            />
          </div>

          {/* Release Status Badge - Top Right */}
          {releaseInfo && (
            <div className="absolute top-2 right-2">
              <Badge className={`${releaseInfo.color} backdrop-blur-sm text-xs`}>
                {releaseInfo.status === 'upcoming' ? 'Coming Soon' : 'Available'}
              </Badge>
            </div>
          )}

          {/* Hover Overlay with CTA */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
            <Button
              size="sm"
              className="bg-white/90 hover:bg-white text-gray-900 font-medium px-4 py-2 rounded-lg shadow-lg"
            >
              View Details
            </Button>
          </div>

          {/* External Link Button - Bottom Right */}
          <Button
            size="sm"
            variant="secondary"
            className="absolute bottom-2 right-2 bg-white/90 backdrop-blur hover:bg-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            onClick={handleExternalLink}
          >
            <ExternalLink className="w-4 h-4" />
          </Button>
        </div>

        {/* Game Info - GOG Style */}
        <CardContent className="flex-1 p-3 space-y-2">
          {/* Title */}
          <h3 className="font-semibold text-white text-sm line-clamp-2 group-hover:text-purple-400 transition-colors">
            {game.title}
          </h3>

          {/* Tagline */}
          {game.tagline && (
            <p className="text-xs text-gray-400 line-clamp-1">
              {game.tagline}
            </p>
          )}

          {/* Stats Row */}
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center space-x-3">
              {/* Vote Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleVote}
                className="flex items-center space-x-1 text-gray-500 hover:text-purple-400 hover:bg-purple-500/20 rounded-full px-2 py-1 h-auto"
              >
                <Heart className="w-3 h-3" />
                <span>{game._count.votes}</span>
              </Button>

              {/* Comments Count */}
              <div className="flex items-center space-x-1">
                <MessageCircle className="w-3 h-3" />
                <span>{game._count.comments}</span>
              </div>

              {/* Views Count */}
              <div className="flex items-center space-x-1">
                <Eye className="w-3 h-3" />
                <span>{game.clicks}</span>
              </div>
            </div>

            {/* Release Info */}
            {releaseInfo && (
              <span className="text-xs text-gray-500">
                {releaseInfo.status === 'upcoming' ? 'Soon' : 'Available'}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}