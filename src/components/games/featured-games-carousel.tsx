"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
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
  // Get top-rated games for featured section (top 8 games)
  const featuredGames = games
    .sort((a, b) => b._count.votes - a._count.votes)
    .slice(0, 8)

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
          ⭐ Featured Games
        </h2>
        <Badge variant="secondary" className="text-sm px-3 py-1 rounded-full">
          Editor's Choice
        </Badge>
      </div>

      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-2 md:-ml-4">
          {featuredGames.map((game) => (
            <CarouselItem 
              key={game.id} 
              className="pl-2 md:pl-4 basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5"
            >
              <FeaturedGameCard 
                game={game} 
                onClick={() => handleGameClick(game.id)}
              />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="hidden md:flex -left-12" />
        <CarouselNext className="hidden md:flex -right-12" />
      </Carousel>
    </section>
  )
}

interface FeaturedGameCardProps {
  game: FeaturedGame
  onClick?: () => void
}

function FeaturedGameCard({ game, onClick }: FeaturedGameCardProps) {
  const rating = (game._count.votes / 10).toFixed(1)

  return (
    <Link href={`/product/${game.id}`} className="block group">
      <Card className="overflow-hidden bg-white hover:shadow-xl transition-all duration-300 border-0 shadow-md rounded-2xl group-hover:scale-[1.02] h-full">
        {/* Game Image */}
        <div className="relative aspect-[4/3] bg-gradient-to-br from-purple-100 to-blue-100 overflow-hidden">
          {game.image ? (
            <Image
              src={game.image}
              alt={game.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-110"
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
              unoptimized={true}
              onError={(e) => {
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
          <div className={cn(
            "fallback-icon w-full h-full flex items-center justify-center",
            game.image ? 'hidden' : ''
          )}>
            <div className="text-4xl">🎮</div>
          </div>

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Play button overlay */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-lg">
              <Play className="w-6 h-6 text-black fill-black ml-1" />
            </div>
          </div>

          {/* Rating Badge */}
          <div className="absolute top-3 right-3">
            <div className="bg-black/80 backdrop-blur-sm rounded-lg px-2 py-1 flex items-center gap-1">
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              <span className="text-xs font-semibold text-white">
                {rating}
              </span>
            </div>
          </div>

          {/* Category Badge */}
          <div className="absolute top-3 left-3">
            <Badge 
              variant="secondary" 
              className="bg-white/90 text-black text-xs px-2 py-1 rounded-md font-medium border-0 backdrop-blur-sm"
            >
              {game.category.name}
            </Badge>
          </div>
        </div>

        <CardContent className="p-4">
          {/* Title */}
          <h3 className="font-bold text-base text-gray-900 line-clamp-1 mb-1 group-hover:text-blue-600 transition-colors">
            {game.title}
          </h3>

          {/* Tagline */}
          {game.tagline && (
            <p className="text-sm text-gray-600 line-clamp-2 mb-3 leading-relaxed">
              {game.tagline}
            </p>
          )}

          {/* Stats */}
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 fill-current" />
              <span className="font-medium">{game._count.votes}</span>
            </div>
            <span className="text-gray-400">
              {game.user.name || 'Anonymous'}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
