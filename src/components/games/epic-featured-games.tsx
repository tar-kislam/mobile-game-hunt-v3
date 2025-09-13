"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Heart, Play, Calendar, Star, Plus } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { cn } from "@/lib/utils"
import ShinyText from "@/components/ShinyText"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel"
import Autoplay from "embla-carousel-autoplay"

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
    <section className="w-full max-w-full overflow-hidden">
      <div className="flex items-center justify-between mb-6 w-full">
        <h2 className="text-2xl font-bold flex items-center gap-2" style={{ fontFamily: '"Epunda Slab", serif', fontWeight: 600 }}>
          <ShinyText>Featured Games</ShinyText>
        </h2>
        <Badge variant="secondary" className="hidden md:block text-sm px-3 py-1 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
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
  const [currentSlide, setCurrentSlide] = useState(0)
  const sideGames = games.slice(1) // Rest of games for sidebar

  return (
    <div className="w-full max-w-full overflow-hidden">
      {/* Mobile Layout (max-width: 768px) */}
      <div className="block md:hidden w-full max-w-full overflow-hidden">
        <MobileCarousel 
          games={games}
          currentSlide={currentSlide}
          setCurrentSlide={setCurrentSlide}
          onGameClick={onGameClick}
        />
      </div>

      {/* Desktop Layout (md and above) */}
      <div className="hidden md:flex flex-col lg:flex-row gap-6">
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

// Mobile Carousel Component
interface MobileCarouselProps {
  games: FeaturedGame[]
  currentSlide: number
  setCurrentSlide: (index: number) => void
  onGameClick: (gameId: string) => void
}

function MobileCarousel({ games, currentSlide, setCurrentSlide, onGameClick }: MobileCarouselProps) {
  const [api, setApi] = useState<CarouselApi>()
  const [current, setCurrent] = useState(0)
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!api) return

    setCount(api.scrollSnapList().length)
    setCurrent(api.selectedScrollSnap() + 1)

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1)
      setCurrentSlide(api.selectedScrollSnap())
    })
  }, [api, setCurrentSlide])

  const scrollTo = (index: number) => {
    if (api) {
      api.scrollTo(index)
    }
  }

  return (
    <div className="space-y-6 w-full max-w-full overflow-hidden">
      {/* Shadcn Carousel for Mobile */}
      <Carousel
        setApi={setApi}
        plugins={[
          Autoplay({
            delay: 3000,
            stopOnInteraction: true,
          }),
        ]}
        className="w-full max-w-full overflow-hidden mx-auto"
        opts={{
          align: "start",
          loop: true,
          containScroll: "trimSnaps",
        }}
      >
        <CarouselContent className="-ml-0">
          {games.map((game, index) => (
            <CarouselItem key={game.id} className="pl-0 basis-full sm:basis-1/2 lg:basis-1/3">
              <div className="w-full">
                <MobileGameCard
                  game={game}
                  onClick={() => onGameClick(game.id)}
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        
        {/* Navigation buttons - Hidden on mobile for swipe-only UX */}
        <CarouselPrevious className="hidden md:flex" />
        <CarouselNext className="hidden md:flex" />
      </Carousel>

      {/* Pagination Dots */}
      <div className="flex justify-center gap-2 w-full overflow-hidden">
        {Array.from({ length: count }).map((_, index) => (
          <button
            key={index}
            onClick={() => scrollTo(index)}
            className={cn(
              "w-2 h-2 rounded-full transition-all duration-300",
              index === current - 1
                ? "bg-purple-500 scale-125"
                : "bg-gray-400 hover:bg-gray-300"
            )}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}

// Mobile Game Card Component
interface MobileGameCardProps {
  game: FeaturedGame
  onClick?: () => void
  style?: React.CSSProperties
}

function MobileGameCard({ game, onClick, style }: MobileGameCardProps) {
  const releaseDate = new Date(game.createdAt).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  })

  return (
    <Link href={`/product/${game.id}`} className="block w-full max-w-full" style={style}>
      <Card className="overflow-hidden bg-black border-0 rounded-xl aspect-[3/4] md:h-[450px] relative shadow-lg w-full max-w-full mx-auto">
        {/* Background Image - Carousel Optimized */}
        <div className="absolute inset-0">
          {game.thumbnail || game.image ? (
            <Image
              src={game.thumbnail || (game.image as string)}
              alt={`${game.title} - Featured Mobile Game`}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 400px, 100vw"
              unoptimized={true}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
              <div className="text-6xl">🎮</div>
            </div>
          )}
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        </div>

        {/* Wishlist Button - Top Right */}
        <button
          className="absolute top-2 right-2 md:top-4 md:right-4 z-20 px-2 py-1 md:px-3 md:py-2 rounded-full bg-black/60 hover:bg-purple-600/90 transition-all duration-200 backdrop-blur-sm border border-white/20"
          onClick={(e) => {
            e.preventDefault()
            // TODO: Implement wishlist functionality
          }}
          aria-label={`Add ${game.title} to wishlist`}
        >
          <Heart className="w-3 h-3 md:w-4 md:h-4 text-white" />
        </button>

        {/* Content Overlay - Bottom */}
        <CardContent className="relative z-10 p-3 md:p-6 h-full flex flex-col justify-end text-white">
          {/* Title */}
          <h3 className="text-lg md:text-2xl font-bold leading-tight mb-2 md:mb-3 line-clamp-2">
            {game.title}
          </h3>
          
          {/* Description */}
          {game.tagline && (
            <p className="text-xs md:text-sm text-gray-200 leading-relaxed mb-2 md:mb-4 line-clamp-2">
              {game.tagline}
            </p>
          )}
          
          {/* Price and Stats */}
          <div className="mb-2 md:mb-4 flex items-center gap-2 md:gap-3">
            <span className="text-sm md:text-lg font-semibold text-green-400">Free</span>
            <span className="text-gray-400">•</span>
            <span className="text-gray-300 text-xs md:text-sm">{game._count.votes} votes</span>
          </div>
          
          {/* Action Button */}
          <Button 
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 md:px-6 md:py-3 rounded-lg font-medium transition-all duration-200 hover:shadow-[0_0_15px_rgba(168,85,247,0.8)] w-full text-sm md:text-base"
            onClick={(e) => {
              e.preventDefault()
              window.open(game.url, '_blank', 'noopener,noreferrer')
            }}
          >
            <Play className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
            Play Now
          </Button>
        </CardContent>
      </Card>
    </Link>
  )
}
