"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Star, Play } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface FeaturedGame {
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

interface FeaturedGamesCarouselProps {
  games: FeaturedGame[]
  onGameClick?: (gameId: string) => void
}

export function FeaturedGamesCarousel({ games, onGameClick }: FeaturedGamesCarouselProps) {
  // Get top-rated games for featured section (top 6 games for TapTap-style layout)
  const featuredGames = games
    .sort((a, b) => b._count.votes - a._count.votes)
    .slice(0, 6)

  if (featuredGames.length === 0) {
    return null
  }

  const handleGameClick = (gameId: string) => {
    onGameClick?.(gameId)
  }

  // Split games: first game as hero, rest as side cards
  const sideGames = featuredGames.slice(0, 5) // Show 5 side games
  
  return (
    <section className="w-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          🎮 Featured Games
        </h2>
        <Badge variant="secondary" className="text-sm px-3 py-1 rounded-full bg-orange-100 text-orange-800">
          Editor's Choice
        </Badge>
      </div>

      <TapTapInteractiveLayout 
        sideGames={sideGames}
        onGameClick={handleGameClick}
      />
    </section>
  )
}

// Interactive TapTap-style layout with hover effect
interface TapTapInteractiveLayoutProps {
  sideGames: FeaturedGame[]
  onGameClick: (gameId: string) => void
}

function TapTapInteractiveLayout({ sideGames, onGameClick }: TapTapInteractiveLayoutProps) {
  const [selectedGame, setSelectedGame] = useState<FeaturedGame>(sideGames[0])

  return (
    <div className="flex flex-col lg:flex-row gap-4 h-80">
      {/* Hero Game - Left Side (Dynamic based on hover) */}
      <div className="flex-[2] min-h-0">
        <HeroGameCard 
          game={selectedGame} 
          onClick={() => onGameClick(selectedGame.id)} 
        />
      </div>
      
      {/* Side Games - Right Side (Scrollable List) */}
      <div className="flex-1 min-h-0">
        <div 
          className="h-[320px] overflow-y-auto featured-games-scroll"
        >
          <div className="space-y-3 p-1">
            {sideGames.map((game, index) => (
              <div key={game.id}>
                <SideGameCard 
                  game={game} 
                  onClick={() => onGameClick(game.id)}
                  onHover={() => setSelectedGame(game)}
                  isSelected={selectedGame.id === game.id}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// Hero Game Card (Large Left Card)
interface HeroGameCardProps {
  game: FeaturedGame
  onClick?: () => void
}

function HeroGameCard({ game, onClick }: HeroGameCardProps) {
  const rating = (game._count.votes / 10).toFixed(1)

  return (
    <Link href={`/product/${game.id}`} className="block group h-full">
      <Card className="overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800 hover:shadow-2xl transition-all duration-300 border-0 shadow-lg rounded-2xl group-hover:scale-[1.02] h-full relative">
        {/* Background Image */}
        <div className="absolute inset-0">
          {game.image ? (
            <Image
              src={game.image}
              alt={game.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 60vw"
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

        {/* Content */}
        <CardContent className="relative z-10 p-6 h-full flex flex-col justify-end text-white">
          {/* Category Badge */}
          <div className="absolute top-4 left-4">
            <Badge className="bg-white/20 text-white text-xs px-3 py-1 rounded-full font-medium border-0 backdrop-blur-sm">
              {game.category.name}
            </Badge>
          </div>

          {/* TapTap Rating Badge */}
          <div className="absolute top-4 right-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl px-3 py-2 flex flex-col items-center shadow-lg">
              <span className="text-xs text-gray-600 dark:text-gray-300 font-medium">TapTap</span>
              <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">{rating}</span>
            </div>
          </div>

          {/* Game Info */}
          <div className="space-y-2">
            <h3 className="text-2xl md:text-3xl font-bold leading-tight">
              {game.title}
            </h3>
            {game.tagline && (
              <p className="text-gray-200 dark:text-gray-300 text-base leading-relaxed line-clamp-2">
                {game.tagline}
              </p>
            )}
            
            {/* Action Button */}
            <div className="flex items-center gap-4 mt-4">
              <Button 
                className="bg-white text-black hover:bg-gray-100 rounded-xl px-6 py-2 font-semibold"
                onClick={(e) => {
                  e.preventDefault()
                  window.open(game.url, '_blank', 'noopener,noreferrer')
                }}
              >
                Play Now
              </Button>
              <div className="flex items-center gap-2 text-sm text-gray-300 dark:text-gray-400">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span>{game._count.votes} votes</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

// Side Game Card (Small Right Cards with hover effect)
interface SideGameCardProps {
  game: FeaturedGame
  onClick?: () => void
  onHover?: () => void
  isSelected?: boolean
}

function SideGameCard({ game, onClick, onHover, isSelected }: SideGameCardProps) {
  const rating = (game._count.votes / 10).toFixed(1)

  return (
    <Link 
      href={`/product/${game.id}`} 
      className="block group flex-1 min-h-0"
      onMouseEnter={onHover}
    >
      <Card className={cn(
        "overflow-hidden transition-all duration-300 border rounded-xl group-hover:scale-[1.02] h-full",
        isSelected 
          ? "bg-blue-50 border-blue-200 shadow-lg" 
          : "bg-white hover:shadow-lg border-gray-200"
      )}>
        <div className="flex gap-3 p-3 h-full">
          {/* Game Image */}
          <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gradient-to-br from-purple-100 to-blue-100 flex-shrink-0">
            {game.image ? (
              <Image
                src={game.image}
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
              "font-semibold text-sm line-clamp-1 transition-colors",
              isSelected 
                ? "text-blue-700" 
                : "text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400"
            )}>
              {game.title}
            </h4>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                <span className="text-xs font-medium text-gray-900 dark:text-gray-100">{rating}</span>
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400">•</span>
              <span className="text-xs text-gray-500 dark:text-gray-400 truncate">{game.category.name}</span>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  )
}
