"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ExternalLink, Play } from "lucide-react"
import Link from "next/link"
import { GameCoverImage } from "@/components/games/game-cover-image"

interface FavoriteGame {
  id: string
  slug: string
  title: string
  tagline?: string | null
  shortPitch?: string | null
  thumbnail?: string | null
  url?: string | null
  metrics: {
    score: number
    visits: number
    likes: number
  }
}

interface FavoriteGameCardProps {
  game: FavoriteGame
}

export function FavoriteGameCard({ game }: FavoriteGameCardProps) {
  const handlePlayNow = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (game.url) {
      window.open(game.url, '_blank', 'noopener,noreferrer')
    }
  }

  // AI review snippet placeholder
  const aiReviewSnippet = "Players loved this pick today – great pacing, smooth combat, and fun mechanics."

  return (
    <Card className="group h-full flex flex-col bg-card hover:shadow-medium transition-all duration-300 border border-white/10 shadow-lg rounded-2xl overflow-hidden hover:scale-[1.02] hover:shadow-black/20">
      {/* Game Thumbnail */}
      <GameCoverImage
        src={game.thumbnail}
        alt={game.title}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        containerClassName="relative aspect-video bg-gradient-to-br from-purple-100 to-blue-100 overflow-hidden"
        imageClassName="object-cover group-hover:scale-105 transition-transform duration-300"
      >
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
      </GameCoverImage>

      <CardContent className="flex-1 p-4 space-y-3">
        {/* Title and Short Pitch */}
        <div>
          <h3 className="font-semibold text-lg text-white line-clamp-1 group-hover:text-purple-400 transition-colors">
            {game.title}
          </h3>
          {game.shortPitch && (
            <p className="text-sm text-gray-300 line-clamp-2 mt-1">
              {game.shortPitch}
            </p>
          )}
        </div>

        {/* Metrics Row */}
        <div className="flex items-center gap-3 text-xs text-gray-400">
          <span>{game.metrics.visits} visits</span>
          <span>•</span>
          <span>{game.metrics.likes} likes</span>
        </div>

        {/* AI Review Snippet */}
        <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-3">
          <p className="text-xs text-purple-200 leading-relaxed">
            {aiReviewSnippet}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button
            size="sm"
            onClick={handlePlayNow}
            className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
            disabled={!game.url}
          >
            <Play className="w-4 h-4 mr-1" />
            Play Now
          </Button>
          <Link href={`/product/${game.slug}`} className="flex-1">
            <Button
              size="sm"
              variant="outline"
              className="w-full border-white/20 hover:bg-white/10 text-white"
            >
              <ExternalLink className="w-4 h-4 mr-1" />
              View Details
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
