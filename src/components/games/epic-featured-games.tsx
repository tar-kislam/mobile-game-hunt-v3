"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Heart, Play, Calendar, Star } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface FeaturedGame {
  id: string
  title: string
  tagline?: string | null
  description: string
  url: string
  thumbnail?: string | null
  image?: string | null
  createdAt: string
  user: {
    id: string
    name: string | null
    image?: string | null
  }
  platforms?: string[]
  _count: {
    votes: number
    comments: number
  }
  appStoreUrl?: string | null
  playStoreUrl?: string | null
}

interface EpicFeaturedGamesProps {
  games: FeaturedGame[]
  onGameClick?: (gameId: string) => void
}

export function EpicFeaturedGames({ games, onGameClick }: EpicFeaturedGamesProps) {
  // Get top-rated games for featured section
  const featuredGames = games
    .sort((a, b) => b._count.votes - a._count.votes)
    .slice(0, 6)

  if (featuredGames.length === 0) {
    return null
  }

  const handleGameClick = (gameId: string) => {
    onGameClick?.(gameId)
  }

  return (
    <section className="w-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          🎮 Featured Games
        </h2>
        <Badge variant="secondary" className="text-sm px-3 py-1 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
          Editor's Choice
        </Badge>
      </div>

      <EpicFeaturedLayout 
        games={featuredGames}
        onGameClick={handleGameClick}
      />
    </section>
  )
}

// Epic Games Store-style layout
interface EpicFeaturedLayoutProps {
  games: FeaturedGame[]
  onGameClick: (gameId: string) => void
}

function EpicFeaturedLayout({ games, onGameClick }: EpicFeaturedLayoutProps) {
  const [selectedGame, setSelectedGame] = useState<FeaturedGame>(games[0])
  const sideGames = games.slice(1) // Rest of games for sidebar

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Large Featured Game - Left Side (70%) */}
      <div className="flex-[7] min-h-0">
        <EpicHeroCard 
          game={selectedGame} 
          onClick={() => onGameClick(selectedGame.id)} 
        />
      </div>
      
      {/* Vertical List - Right Side (30%) */}
      <div className="flex-[3] min-h-0">
        <div className="space-y-2">
          {sideGames.map((game) => (
            <EpicSideCard 
              key={game.id}
              game={game} 
              onClick={() => onGameClick(game.id)}
              onHover={() => setSelectedGame(game)}
              isSelected={selectedGame.id === game.id}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

// Epic-style Hero Card (Large Left Card)
interface EpicHeroCardProps {
  game: FeaturedGame
  onClick?: () => void
}

function EpicHeroCard({ game, onClick }: EpicHeroCardProps) {
  const releaseDate = new Date(game.createdAt).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  })

  return (
    <Link href={`/product/${game.id}`} className="block group h-full">
      <Card className="overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800 hover:shadow-2xl hover:shadow-[0_0_25px_5px_rgba(168,85,247,0.5)] transition-all duration-300 border-0 shadow-lg rounded-xl group-hover:scale-[1.01] h-[500px] relative">
        {/* Background Image */}
        <div className="absolute inset-0">
          {game.thumbnail || game.image ? (
            <Image
              src={game.thumbnail || (game.image as string)}
              alt={game.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 70vw"
              unoptimized={true}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
              <div className="text-8xl">🎮</div>
            </div>
          )}
          {/* Dark overlay */}
          <div className="absolute inset-0 bg-black/40" />
        </div>

        {/* Content Overlay - Bottom Left */}
        <CardContent className="relative z-10 p-8 h-full flex flex-col justify-end text-white">
          {/* Release Date - Small Uppercase */}
          <div className="mb-2">
            <span className="uppercase text-xs text-gray-300 font-medium tracking-wider">
              {releaseDate}
            </span>
          </div>

          {/* Game Title - Large Bold */}
          <h3 className="text-3xl font-bold leading-tight mb-4">
            {game.title}
          </h3>
          
          {/* Description - Multi-line */}
          {game.tagline && (
            <p className="text-base text-gray-200 leading-relaxed mb-6 max-w-2xl line-clamp-3">
              {game.tagline}
            </p>
          )}
          
          {/* Price Info */}
          <div className="mb-6">
            <span className="text-lg font-semibold text-green-400">Free</span>
            <span className="text-gray-300 ml-2">•</span>
            <span className="text-gray-300 ml-2">{game._count.votes} votes</span>
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center gap-4">
            <Button 
              className="bg-white text-black hover:bg-gray-200 hover:shadow-[0_0_15px_rgba(168,85,247,0.7)] px-4 py-2 rounded font-medium transition-all duration-200"
              onClick={(e) => {
                e.preventDefault()
                window.open(game.url, '_blank', 'noopener,noreferrer')
              }}
            >
              <Play className="w-4 h-4 mr-2" />
              Play Now
            </Button>
            
            <Button 
              variant="outline"
              className="border border-gray-500 px-3 py-2 rounded hover:border-white hover:shadow-[0_0_15px_rgba(168,85,247,0.7)] text-white hover:bg-white/10 transition-all duration-200"
              onClick={(e) => {
                e.preventDefault()
                // TODO: Implement wishlist functionality
              }}
            >
              <Heart className="w-4 h-4 mr-2" />
              Add to Wishlist
            </Button>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

// Epic-style Side Card (Small Right Cards)
interface EpicSideCardProps {
  game: FeaturedGame
  onClick?: () => void
  onHover?: () => void
  isSelected?: boolean
}

function EpicSideCard({ game, onClick, onHover, isSelected }: EpicSideCardProps) {
  return (
    <Link 
      href={`/product/${game.id}`} 
      className="block group"
      onMouseEnter={onHover}
    >
      <Card className={cn(
        "overflow-hidden transition-all duration-300 border rounded px-2 py-2 hover:bg-gray-800 hover:shadow-[0_0_10px_2px_rgba(168,85,247,0.7)]",
        isSelected 
          ? "bg-gray-700 border-gray-600" 
          : "bg-transparent border-gray-600 hover:border-gray-500"
      )}>
        <div className="flex gap-3 p-2">
          {/* Game Thumbnail - Square */}
          <div className="relative w-12 h-12 rounded overflow-hidden bg-gradient-to-br from-purple-100 to-blue-100 flex-shrink-0">
            {game.thumbnail || game.image ? (
              <Image
                src={game.thumbnail || (game.image as string)}
                alt={game.title}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-110"
                sizes="48px"
                unoptimized={true}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-lg">
                🎮
              </div>
            )}
          </div>

          {/* Game Info */}
          <div className="flex-1 min-w-0 flex flex-col justify-center">
            <h4 className={cn(
              "font-medium text-sm line-clamp-2 transition-colors",
              isSelected 
                ? "text-white" 
                : "text-gray-300 group-hover:text-white"
            )}>
              {game.title}
            </h4>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-gray-400">Free</span>
              <span className="text-xs text-gray-500">•</span>
              <span className="text-xs text-gray-400">{game._count.votes} votes</span>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  )
}
