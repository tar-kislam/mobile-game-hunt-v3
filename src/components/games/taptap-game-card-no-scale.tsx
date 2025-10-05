"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ArrowUpIcon, MessageCircleIcon, ExternalLinkIcon } from "lucide-react"
import { getAuthorLabel } from "@/lib/author"

interface Game {
  id: string
  title: string
  slug: string
  tagline?: string | null
  description: string
  shortPitch?: string | null
  image?: string | null
  thumbnail?: string | null
  images?: string[]
  gallery?: string[]
  gameplayGifUrl?: string | null
  url: string
  platforms?: string[]
  createdAt: string
  _count: {
    votes: number
    comments: number
  }
  user: {
    name: string | null
    image?: string | null
    role?: string | null
  }
}

interface TapTapGameCardNoScaleProps {
  game: Game
  onVote?: (gameId: string) => void
  showAuthor?: boolean
}

// Helper function to get the main display image for product cards
function getMainDisplayImage(game: Game): string | null {
  // Priority: first gallery image > first images array item > thumbnail (for small contexts only)
  if (game.images && game.images.length > 0) {
    return game.images[0]
  }
  if (game.gallery && Array.isArray(game.gallery) && game.gallery.length > 0) {
    return game.gallery[0]
  }
  // Only use thumbnail as fallback for small contexts
  return game.thumbnail || game.image || null
}

export function TapTapGameCardNoScale({ game, onVote, showAuthor = true }: TapTapGameCardNoScaleProps) {
  const [isSponsored, setIsSponsored] = useState(false)

  useEffect(() => {
    let mounted = true
    const checkSponsor = async () => {
      try {
        const res = await fetch(`/api/sponsor?gameId=${game.id}`)
        if (!res.ok) return
        const data = await res.json()
        if (mounted) setIsSponsored(Boolean(data?.sponsored))
      } catch {}
    }
    checkSponsor()
    return () => { mounted = false }
  }, [game.id])

  const handleVote = () => {
    onVote?.(game.id)
  }

  const handleExternalLink = (e: React.MouseEvent) => {
    e.stopPropagation()
  }

  return (
    <Link href={`/product/${game.slug}`} className="block group">
      {/* Removed group-hover:scale-[1.02] from card to prevent double scaling with tilt effect */}
      <Card className="overflow-hidden bg-card hover:shadow-lg transition-all duration-300 border border-white/10 shadow-lg rounded-xl hover:shadow-black/20">
        {/* Game Image - Removed image scaling on hover */}
        <div className="relative aspect-square bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
          {getMainDisplayImage(game) ? (
            <Image
              src={getMainDisplayImage(game) as string}
              alt={game.title}
              fill
              className="object-cover transition-transform duration-300"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              unoptimized={true}
              onError={(e) => {
                e.currentTarget.onerror = null;
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
          <div className={`fallback-icon absolute inset-0 flex items-center justify-center text-4xl text-gray-400 ${getMainDisplayImage(game) ? 'hidden' : ''}`}>
            🎮
          </div>

          {/* Category Badge */}
          <div className="absolute top-3 left-3">
            <Badge 
              className="bg-black/70 text-white text-xs px-2 py-1 rounded-md font-medium border-0"
            >
              {game.platforms && game.platforms.length > 0 
                ? game.platforms.map(platform => platform.toUpperCase()).join(', ')
                : 'No platforms listed'
              }
            </Badge>
          </div>

          {/* Upvote Badge */}
          <div className="absolute top-2 right-2">
            <Badge 
              variant="secondary" 
              className="bg-[rgb(60,41,100)] text-white text-xs font-bold px-2 py-1 rounded-full shadow-sm"
            >
              ⭐ {game._count.votes}
            </Badge>
          </div>

          {/* Sponsored Tag */}
          {isSponsored && (
            <div className="absolute bottom-2 left-2">
              <Badge className="bg-yellow-500/80 text-white text-[10px] px-2 py-0.5 rounded-md border-0">
                Sponsored
              </Badge>
            </div>
          )}
        </div>

        {/* Game Info */}
        <CardContent className="p-3">
          {/* Title */}
          <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100 line-clamp-1 mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {game.title}
          </h3>

          {/* Short Pitch or Tagline */}
          {(game.shortPitch || game.tagline) && (
            <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-1 mb-2">
              {game.shortPitch || game.tagline}
            </p>
          )}

          {/* Stats */}
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-2">
            <div className="flex items-center gap-3">
              <button
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  handleVote()
                }}
                className="flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
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
              className="flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors p-1"
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
              <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
                by {getAuthorLabel({ user: game.user as any })}
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}
