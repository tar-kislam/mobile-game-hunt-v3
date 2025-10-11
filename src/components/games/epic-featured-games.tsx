"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Heart, Play } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { getAuthorLabel } from "@/lib/author"
import ShinyText from "@/components/ShinyText"
import { calculateFinalScore, getScoringWeights } from "@/lib/leaderboardConfig"
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
  follows?: number
  clicks?: number
  appStoreUrl?: string | null
  playStoreUrl?: string | null
  editorial_boost?: boolean
  editorial_override?: boolean
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
  // Apply editorial priority logic first, then leaderboard scoring
  const weights = getScoringWeights()

  const scored = [...games].map((g) => {
    const votes = g._count?.votes || 0
    const comments = g._count?.comments || 0
    const follows = g.follows || 0
    const views = g.clicks || 0
    const finalScore = calculateFinalScore(votes, comments, follows, views, weights)
    
    // Editorial priority scoring
    let editorialScore = 0
    if (g.editorial_override) {
      editorialScore = 10000 // Highest priority - always shows first
    } else if (g.editorial_boost) {
      editorialScore = 1000 // High priority - shows before normal games
    }
    
    return { game: g, finalScore, editorialScore, votes, comments, follows, views }
  })
  .sort((a, b) => {
    // First sort by editorial priority
    if (b.editorialScore !== a.editorialScore) return b.editorialScore - a.editorialScore
    
    // Then by final score
    if (b.finalScore !== a.finalScore) return b.finalScore - a.finalScore
    if (b.votes !== a.votes) return b.votes - a.votes
    if (b.comments !== a.comments) return b.comments - a.comments
    if (b.follows !== a.follows) return b.follows - a.follows
    return b.views - a.views
  })

  const featuredGames = scored.map(s => s.game).slice(0, 6)

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
        {games.length > 6 && (
          <Link href="/leaderboard" className="text-sm text-purple-300 hover:text-purple-200 underline">
            Explore All Games
          </Link>
        )}
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
                    <img src="/logo/logo-gamepad.webp" alt="Game" className="w-6 h-6" />
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
        <div className="h-[500px]">
          <div className="grid grid-rows-5 gap-3 h-full">
            {games.slice(0, 5).map((game) => (
              <div key={game.id} className="min-h-0">
                <EpicSideCard 
                  game={game} 
                  onClick={() => {
                    onGameClick(game.id)
                    setSelectedGame(game)
                  }}
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
        "overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 hover:shadow-2xl hover:shadow-[0_0_30px_8px_rgba(168,85,247,0.4)] transition-all duration-500 border-0 shadow-lg rounded-3xl group-hover:scale-[1.02] relative",
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
              <div>
                <img src="/logo/logo-gamepad.webp" alt="Game" className="w-32 h-32" />
              </div>
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
          <h2 className="text-2xl md:text-4xl font-bold leading-tight mb-4 md:mb-6 text-shadow-lg">
            {game.title}
          </h2>
          
          {/* Platform Icons */}
          <div className="flex items-center gap-3 mb-4 md:mb-6">
            <PlatformIcons 
              platforms={game.platforms || []} 
              size="lg"
              showLabels={false}
            />
            <Badge 
              variant="secondary" 
              className="bg-green-900/50 text-green-200 border border-green-500/30 text-xs"
            >
              Free
            </Badge>
          </div>
          
          {/* Action */}
          <div className="flex items-center gap-3">
            <Button
              className="px-6 py-3 rounded-full font-semibold transition-all duration-300 bg-white/10 backdrop-blur border border-white/15 text-white hover:bg-white/15 hover:shadow-[0_0_24px_rgba(168,85,247,0.35)] hover:translate-y-[-1px]"
            >
              Learn More
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
        "w-full flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 cursor-pointer text-left group",
        isSelected 
          ? "bg-gradient-to-r from-purple-900/30 to-blue-900/30 border-l-4 border-purple-500 shadow-lg shadow-purple-500/20" 
          : "bg-gray-800/50 hover:bg-gray-700/70 hover:shadow-lg hover:shadow-purple-500/10"
      )}
      onClick={onClick}
    >
      {/* Game Thumbnail - Square */}
      <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-gradient-to-br from-purple-100 to-blue-100 flex-shrink-0">
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
            <img src="/logo/logo-gamepad.webp" alt="Game" className="w-6 h-6" />
          </div>
        )}
      </div>

      {/* Game Info */}
      <div className="flex-1 min-w-0 flex items-center">
        <h3 className={cn(
          "font-bold text-base transition-colors line-clamp-2",
          "tracking-wide",
          isSelected 
            ? "text-white" 
            : "text-gray-200 group-hover:text-white"
        )}
        style={{ fontFamily: '"Sansation", sans-serif' }}
        >
          {game.title}
        </h3>
      </div>
    </button>
  )
}

