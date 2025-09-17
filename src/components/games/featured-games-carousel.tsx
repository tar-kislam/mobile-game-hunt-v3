"use client"

import { useMemo, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Star, Play, Smartphone, Monitor } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { PlatformIcons } from "@/components/ui/platform-icons"

interface FeaturedGame {
  id: string
  title: string
  slug: string
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

interface FeaturedGamesCarouselProps {
  games: FeaturedGame[]
  onGameClick?: (gameId: string) => void
}

export function FeaturedGamesCarousel({ games, onGameClick }: FeaturedGamesCarouselProps) {
  // Get top-rated games for featured section
  // Enforce max 6 total items, with up to 5 on the right side
  const featuredGames = games
    .sort((a, b) => b._count.votes - a._count.votes)
    .slice(0, 6)

  if (featuredGames.length === 0) {
    return null
  }

  const handleGameClick = (gameId: string) => {
    onGameClick?.(gameId)
  }

  // Left hero is the first; right column renders the next max 5
  const heroGame = featuredGames[0]
  const sideGames = useMemo(() => featuredGames.slice(1, 6), [featuredGames])
  
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
        heroGame={heroGame}
        sideGames={sideGames}
        onGameClick={handleGameClick}
      />
    </section>
  )
}

// Interactive TapTap-style layout with hover effect
interface TapTapInteractiveLayoutProps {
  heroGame: FeaturedGame
  sideGames: FeaturedGame[]
  onGameClick: (gameId: string) => void
}

function TapTapInteractiveLayout({ heroGame, sideGames, onGameClick }: TapTapInteractiveLayoutProps) {
  const [selectedGame, setSelectedGame] = useState<FeaturedGame>(heroGame)

  return (
    <div className="grid gap-6 items-start md:grid-cols-[minmax(0,1fr)_minmax(280px,340px)] xl:grid-cols-[minmax(0,1fr)_minmax(320px,360px)]">
      {/* Hero Game - Left Column */}
      <div className="min-h-0">
        <HeroGameCard 
          game={selectedGame} 
          onClick={() => onGameClick(selectedGame.id)} 
        />
      </div>
      
      {/* Side Games - Right Column (No scrollbars, exactly 5 items) */}
      <aside className="w-full flex flex-col gap-3">
        {sideGames.map((game) => (
          <SideGameCard
            key={game.id}
            game={game}
            onClick={() => onGameClick(game.id)}
            onHover={() => setSelectedGame(game)}
            isSelected={selectedGame.id === game.id}
            compact
          />
        ))}
      </aside>
    </div>
  )
}

// Hero Game Card (Large Left Card)
interface HeroGameCardProps {
  game: FeaturedGame
  onClick?: () => void
}

function HeroGameCard({ game, onClick }: HeroGameCardProps) {
  // Determine available platforms with safety check
  const platforms = game.platforms || []
  if (game.appStoreUrl) platforms.push('ios')
  if (game.playStoreUrl) platforms.push('android')
  if (game.url && !game.appStoreUrl && !game.playStoreUrl) platforms.push('web')

  return (
    <Link href={`/product/${game.slug}`} className="block group h-full">
      <Card className="overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800 hover:shadow-2xl transition-all duration-300 border-0 shadow-lg rounded-2xl group-hover:scale-[1.02] h-full relative">
        {/* Background Image */}
        <div className="absolute inset-0">
          {game.thumbnail || game.image ? (
            <Image
              src={game.thumbnail || (game.image as string)}
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
          {/* Votes Badge - Replaced TapTap field */}
          <div className="absolute top-4 right-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl px-3 py-2 flex flex-col items-center shadow-lg">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="text-xs text-gray-600 dark:text-gray-300 font-medium">Votes</span>
              </div>
              <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">{game._count.votes}</span>
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
            
            {/* Action Button and Platform Icons */}
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
              
              {/* Platform Icons */}
              <PlatformIcons 
                platforms={platforms} 
                size="sm" 
                className="flex-shrink-0"
              />
              
              {/* Votes Display */}
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
  compact?: boolean
}

function SideGameCard({ game, onClick, onHover, isSelected, compact = false }: SideGameCardProps) {
  const rating = (game._count.votes / 10).toFixed(1)
  const platforms = game.platforms || []

  return (
    <Link
      href={`/product/${game.slug}`}
      onMouseEnter={onHover}
      className="w-full h-[84px] lg:h-[92px] rounded-2xl bg-[hsla(0,0%,12%,0.7)] hover:bg-[hsla(0,0%,12%,0.9)] transition shadow-[0_0_0_1px_hsla(0,0%,100%,0.06)_inset] flex items-center gap-3 px-3"
    >
      {/* Thumbnail */}
      <div className="relative w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-muted">
        {game.thumbnail || game.image ? (
          <Image
            src={game.thumbnail || (game.image as string)}
            alt={game.title}
            fill
            className="object-cover"
            sizes="48px"
            unoptimized={true}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-lg">🎮</div>
        )}
      </div>

      {/* Text */}
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm lg:text-[15px] font-medium text-white/90">{game.title}</div>
        <div className="mt-1 flex items-center gap-2 text-xs text-white/60">
          <div className="flex items-center gap-1">
            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
            <span>{rating}</span>
          </div>
          <span>•</span>
          <span>{game._count.votes} votes</span>
        </div>
      </div>
    </Link>
  )
}
