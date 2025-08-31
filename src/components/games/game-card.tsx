"use client"

import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowUpRight, Heart, MessageCircle, ExternalLink } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
// import { formatDistanceToNow } from "date-fns" // Temporarily commented

interface GameCardProps {
  game: {
    id: string
    title: string
    tagline?: string | null
    description: string
    url: string
    image?: string | null
    createdAt: string
    user: {
      id: string
      name: string | null
      image?: string | null
    }
    category: {
      id: string
      name: string
      slug: string
    }
    _count: {
      votes: number
      comments: number
    }
  }
  onVote?: (gameId: string) => void
  showAuthor?: boolean
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
    <Card className="group h-full flex flex-col bg-white hover:shadow-medium transition-all duration-300 border-0 shadow-soft rounded-2xl overflow-hidden">
      {/* Game Image */}
      <div className="relative aspect-video bg-gradient-to-br from-purple-100 to-blue-100 overflow-hidden">
        {game.image ? (
          <Image
            src={game.image}
            alt={game.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            unoptimized={true}
            onError={(e) => {
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
        <div className={`fallback-icon w-full h-full flex items-center justify-center ${game.image ? 'hidden' : ''}`}>
          <div className="text-6xl">🎮</div>
        </div>
        
        {/* Category Badge */}
        <div className="absolute top-3 left-3">
          <Badge 
            variant="secondary" 
            className="bg-white/90 backdrop-blur text-gray-700 rounded-full px-3 py-1 text-xs font-medium"
          >
            {game.category.name}
          </Badge>
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
          <h3 className="font-semibold text-lg text-gray-900 line-clamp-1 group-hover:text-orange-600 transition-colors">
            {game.title}
          </h3>
          {game.tagline && (
            <p className="text-sm text-gray-600 line-clamp-1 mt-1">
              {game.tagline}
            </p>
          )}
        </div>

        {/* Description */}
        <p className="text-sm text-gray-700 line-clamp-2 leading-relaxed">
          {game.description}
        </p>

        {/* Author */}
        {showAuthor && (
          <div className="flex items-center space-x-2 pt-2">
            <div className="w-6 h-6 bg-gradient-to-br from-purple-400 to-blue-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
              {game.user.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <span className="text-xs text-gray-500">
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
          className="flex items-center space-x-1 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-full px-3 py-1"
        >
          <Heart className="w-4 h-4" />
          <span className="text-sm font-medium">{game._count.votes}</span>
        </Button>

        {/* Comments Count */}
        <div className="flex items-center space-x-1 text-gray-500">
          <MessageCircle className="w-4 h-4" />
          <span className="text-sm">{game._count.comments}</span>
        </div>

        {/* Date */}
        <span className="text-xs text-gray-400">
          {new Date(game.createdAt).toLocaleDateString()}
        </span>
      </CardFooter>
    </Card>
  )
}
