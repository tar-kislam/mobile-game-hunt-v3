"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Heart, Play } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { cn } from "@/lib/utils"
import ShinyText from "@/components/ShinyText"

interface FeaturedGame {
  id: string
  title: string
  slug: string
  tagline?: string | null
  description: string
  url: string
  thumbnail?: string | null
  image?: string | null
  gallery?: string[]
  images?: string[]
  createdAt: string
  releaseAt?: string | null
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

// Helper function to get the main display image
function getMainDisplayImage(game: FeaturedGame): string | null {
  // Priority: gallery[0] -> images[0] -> thumbnail -> image
  if (game.gallery && Array.isArray(game.gallery) && game.gallery.length > 0) {
    return game.gallery[0]
  }
  if (game.images && game.images.length > 0) {
    return game.images[0]
  }
  if (game.thumbnail) {
    return game.thumbnail
  }
  if (game.image) {
    return game.image
  }
  return null
}

export function EpicFeaturedGames({ games, onGameClick }: EpicFeaturedGamesProps) {
  // Get top-rated games for featured section (prioritize editor's choice)
  const featuredGames = games
    .sort((a, b) => {
      // Prioritize games with higher votes and recent releases
      const scoreA = a._count.votes + (a.releaseAt ? 10 : 0)
      const scoreB = b._count.votes + (b.releaseAt ? 10 : 0)
      return scoreB - scoreA
    })
    .slice(0, 6)

  if (featuredGames.length === 0) {
    return null
  }

  const handleGameClick = (gameId: string) => {
    onGameClick?.(gameId)
  }

  return (
    <section className="w-full max-w-full overflow-hidden">
      <div className="flex items-center justify-between mb-6 w-full">
        <h2 className="text-2xl font-bold flex items-center gap-2" style={{ fontFamily: '"Epunda Slab", serif', fontWeight: 600 }}>
          <ShinyText>Featured Games</ShinyText>
        </h2>
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

  return (
    <div className="w-full max-w-full overflow-hidden">
      {/* Mobile Layout - Stack vertically */}
      <div className="block md:hidden space-y-6">
        {/* Large Featured Card */}
        <EpicHeroCard 
          game={selectedGame} 
          onClick={() => onGameClick(selectedGame.id)} 
          isMobile={true}
        />
        
        {/* Horizontal Scrollable Thumbnails */}
        <div className="w-full">
          <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
            {games.map((game) => (
              <button
                key={game.id}
                onClick={() => setSelectedGame(game)}
                className={cn(
                  "flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden transition-all duration-300",
                  selectedGame.id === game.id
                    ? "ring-2 ring-purple-500 shadow-lg shadow-purple-500/50 scale-105"
                    : "hover:scale-105 hover:shadow-lg"
                )}
              >
                {game.thumbnail ? (
                  <Image
                    src={game.thumbnail}
                    alt={game.title}
                    width={80}
                    height={80}
                    className="w-full h-full object-cover"
                    unoptimized={true}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-2xl">
                    🎮
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Desktop Layout - Two Column Grid */}
      <div className="hidden md:grid gap-6" style={{ gridTemplateColumns: '4fr 1fr' }}>
        {/* Large Featured Game - Left Column (~80%) */}
        <div>
          <EpicHeroCard 
            game={selectedGame} 
            onClick={() => onGameClick(selectedGame.id)} 
          />
        </div>
        
        {/* Vertical Thumbnail List - Right Column (~20%) */}
        <div>
          <div className="space-y-3 h-full">
            {games.map((game) => (
              <EpicSideCard 
                key={game.id}
                game={game} 
                onClick={() => {
                  onGameClick(game.id)
                  setSelectedGame(game)
                }}
                isSelected={selectedGame.id === game.id}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// Epic-style Hero Card (Large Featured Card)
interface EpicHeroCardProps {
  game: FeaturedGame
  onClick?: () => void
  isMobile?: boolean
}

function EpicHeroCard({ game, isMobile = false }: EpicHeroCardProps) {
  const releaseDate = game.releaseAt 
    ? new Date(game.releaseAt).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      })
    : new Date(game.createdAt).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      })

  const mainImage = getMainDisplayImage(game)

  return (
    <Link href={`/product/${game.slug}`} className="block group h-full">
      <Card className={cn(
        "overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 hover:shadow-2xl hover:shadow-[0_0_30px_8px_rgba(168,85,247,0.4)] transition-all duration-500 border-0 shadow-lg rounded-xl group-hover:scale-[1.02] relative",
        isMobile ? "h-[400px]" : "h-[500px]"
      )}>
        {/* Background Image */}
        <div className="absolute inset-0">
          {mainImage ? (
            <Image
              src={mainImage}
              alt={game.title}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-110"
              sizes={isMobile ? "100vw" : "(max-width: 1024px) 66vw, 50vw"}
              unoptimized={true}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-600 flex items-center justify-center">
              <div className="text-8xl">🎮</div>
            </div>
          )}
          {/* Epic Games style gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
        </div>

        {/* Content Overlay */}
        <CardContent className="relative z-10 p-6 md:p-8 h-full flex flex-col justify-end text-white">
          {/* Release Date - Top Left */}
          <div className="mb-3">
            <span className="uppercase text-xs text-gray-300 font-medium tracking-wider bg-black/30 px-2 py-1 rounded">
              {releaseDate}
            </span>
          </div>

          {/* Game Title - Large Bold */}
          <h2 className="text-2xl md:text-4xl font-bold leading-tight mb-3 md:mb-4 text-shadow-lg">
            {game.title}
          </h2>
          
          {/* Description - Multi-line */}
          {game.tagline && (
            <p className="text-sm md:text-base text-gray-200 leading-relaxed mb-4 md:mb-6 max-w-2xl line-clamp-2 md:line-clamp-3">
              {game.tagline}
            </p>
          )}
          
          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-4 md:mb-6">
            {game.platforms && game.platforms.slice(0, 2).map((platform) => (
              <Badge 
                key={platform} 
                variant="secondary" 
                className="bg-purple-900/50 text-purple-200 border border-purple-500/30 text-xs"
              >
                {platform}
              </Badge>
            ))}
            <Badge 
              variant="secondary" 
              className="bg-green-900/50 text-green-200 border border-green-500/30 text-xs"
            >
              Free
            </Badge>
          </div>
          
          {/* Stats */}
          <div className="mb-4 md:mb-6 flex items-center gap-4 text-sm text-gray-300">
            <span className="flex items-center gap-1">
              <span className="text-green-400 font-semibold">Free</span>
            </span>
            <span>•</span>
            <span>{game._count.votes} votes</span>
            <span>•</span>
            <span>{game._count.comments} comments</span>
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <Button 
              className="bg-white text-black hover:bg-gray-100 hover:shadow-[0_0_20px_rgba(168,85,247,0.8)] px-6 py-3 rounded-lg font-semibold transition-all duration-300 hover:scale-105"
              onClick={(e) => {
                e.preventDefault()
                if (game.url) {
                  window.open(game.url, '_blank', 'noopener,noreferrer')
                }
              }}
            >
              <Play className="w-4 h-4 mr-2" />
              Play Now
            </Button>
            
            <Button 
              variant="outline"
              className="border-2 border-white/30 px-5 py-3 rounded-lg hover:border-white hover:bg-white/10 hover:shadow-[0_0_20px_rgba(168,85,247,0.6)] text-white transition-all duration-300 hover:scale-105"
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

// Epic-style Side Card (Thumbnail List Items)
interface EpicSideCardProps {
  game: FeaturedGame
  onClick?: () => void
  isSelected?: boolean
}

function EpicSideCard({ game, onClick, isSelected }: EpicSideCardProps) {
  return (
    <button 
      className={cn(
        "w-full flex items-center gap-4 p-4 rounded-lg transition-all duration-300 cursor-pointer text-left group",
        isSelected 
          ? "bg-gradient-to-r from-purple-900/30 to-blue-900/30 border-l-4 border-purple-500 shadow-lg shadow-purple-500/20" 
          : "bg-gray-800/50 hover:bg-gray-700/70 hover:shadow-lg hover:shadow-purple-500/10"
      )}
      onClick={onClick}
    >
      {/* Game Thumbnail - Square */}
      <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gradient-to-br from-purple-100 to-blue-100 flex-shrink-0">
        {game.thumbnail ? (
          <Image
            src={game.thumbnail}
            alt={game.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-110"
            sizes="64px"
            unoptimized={true}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-xl">
            🎮
          </div>
        )}
      </div>

      {/* Game Info */}
      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <h3 className={cn(
          "font-semibold text-sm transition-colors line-clamp-2",
          isSelected 
            ? "text-white" 
            : "text-gray-200 group-hover:text-white"
        )}>
          {game.title}
        </h3>
        <div className="flex items-center gap-2 mt-1">
          <Badge 
            variant="secondary" 
            className="bg-green-900/50 text-green-200 border border-green-500/30 text-xs px-1 py-0"
          >
            Free
          </Badge>
          <span className="text-xs text-gray-400">{game._count.votes} votes</span>
        </div>
      </div>

      {/* Selection Indicator */}
      {isSelected && (
        <div className="w-2 h-2 bg-purple-500 rounded-full flex-shrink-0 animate-pulse" />
      )}
    </button>
  )
}

