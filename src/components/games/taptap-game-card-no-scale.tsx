"use client"

import Image from "next/image"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ArrowUpIcon, MessageCircleIcon, ExternalLinkIcon } from "lucide-react"

interface Game {
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

interface TapTapGameCardNoScaleProps {
  game: Game
  onVote?: (gameId: string) => void
  showAuthor?: boolean
}

export function TapTapGameCardNoScale({ game, onVote, showAuthor = true }: TapTapGameCardNoScaleProps) {
  const handleVote = () => {
    onVote?.(game.id)
  }

  const handleExternalLink = (e: React.MouseEvent) => {
    e.stopPropagation()
  }

  return (
    <Link href={`/product/${game.id}`} className="block group">
      {/* Removed group-hover:scale-[1.02] from card to prevent double scaling with tilt effect */}
      <Card className="overflow-hidden bg-white hover:shadow-lg transition-all duration-300 border-0 shadow-sm rounded-xl">
        {/* Game Image - Removed image scaling on hover */}
        <div className="relative aspect-square bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
          {game.image ? (
            <Image
              src={game.image}
              alt={game.title}
              fill
              className="object-cover transition-transform duration-300"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
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
          
          {/* Fallback icon - hidden */}
          <div className="fallback-icon absolute inset-0 flex items-center justify-center text-4xl text-gray-400" style={{ display: 'none' }}>
            🎮
          </div>

          {/* Category Badge */}
          <div className="absolute top-2 left-2">
            <Badge 
              variant="secondary" 
              className="bg-white/90 text-gray-700 text-xs font-medium px-2 py-1 rounded-full shadow-sm"
            >
              {game.category.name}
            </Badge>
          </div>

          {/* Rating Badge (Mock) */}
          <div className="absolute top-2 right-2">
            <Badge 
              variant="secondary" 
              className="bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-sm"
            >
              ⭐ {(Math.random() * 2 + 3).toFixed(1)}
            </Badge>
          </div>
        </div>

        {/* Game Info */}
        <CardContent className="p-3">
          {/* Title */}
          <h3 className="font-semibold text-sm text-gray-900 line-clamp-1 mb-1 group-hover:text-blue-600 transition-colors">
            {game.title}
          </h3>

          {/* Tagline */}
          {game.tagline && (
            <p className="text-xs text-gray-600 line-clamp-1 mb-2">
              {game.tagline}
            </p>
          )}

          {/* Stats */}
          <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
            <div className="flex items-center gap-3">
              <button
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  handleVote()
                }}
                className="flex items-center gap-1 hover:text-blue-600 transition-colors"
              >
                <ArrowUpIcon className="w-3 h-3" />
                <span className="font-medium">{game._count.votes}</span>
              </button>
              
              <div className="flex items-center gap-1">
                <MessageCircleIcon className="w-3 h-3" />
                <span>{game._count.comments}</span>
              </div>
            </div>

            <button
              onClick={handleExternalLink}
              className="flex items-center gap-1 hover:text-blue-600 transition-colors p-1"
            >
              <ExternalLinkIcon className="w-3 h-3" />
            </button>
          </div>

          {/* Author */}
          {showAuthor && (
            <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
              <Avatar className="w-4 h-4">
                <AvatarImage src={game.user.image || undefined} />
                <AvatarFallback className="text-[8px]">
                  {game.user.name?.[0]?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs text-gray-500 truncate">
                by {game.user.name || 'Anonymous'}
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}
