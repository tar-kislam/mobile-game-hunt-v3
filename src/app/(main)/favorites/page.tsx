"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2 } from "lucide-react"
import { FavoriteGameCard } from "@/components/favorites/favorite-game-card"
import Link from "next/link"

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

export default function FavoritesPage() {
  const [period, setPeriod] = useState<'daily' | 'weekly'>('daily')
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [dailyGames, setDailyGames] = useState<FavoriteGame[]>([])
  const [weeklyGames, setWeeklyGames] = useState<FavoriteGame[]>([])
  const [loading, setLoading] = useState(true)

  const fetchGames = async (periodType: 'daily' | 'weekly', tag?: string | null) => {
    try {
      const params = new URLSearchParams({ period: periodType })
      if (tag) {
        params.append('tag', tag)
      }
      
      const response = await fetch(`/api/favorites?${params.toString()}`)
      if (!response.ok) throw new Error('Failed to fetch favorites')
      
      const games: FavoriteGame[] = await response.json()
      
      if (periodType === 'daily') {
        setDailyGames(games)
      } else {
        setWeeklyGames(games)
      }
    } catch (error) {
      console.error('Error fetching favorites:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setLoading(true)
    fetchGames('daily', selectedTag)
    fetchGames('weekly', selectedTag)
  }, [selectedTag])

  const availableTags = [
    { slug: 'free-to-play', label: 'Free' },
    { slug: 'rpg', label: 'RPG' },
    { slug: 'hyper-casual', label: 'Hyper-Casual' },
    { slug: 'indie', label: 'Indie' },
    { slug: 'story-rich', label: 'Story-Rich' }
  ]

  const currentGames = period === 'daily' ? dailyGames : weeklyGames
  const currentLoading = loading

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-[#121225] to-[#050509] bg-[radial-gradient(80%_80%_at_0%_0%,rgba(124,58,237,0.22),transparent_60%),radial-gradient(80%_80%_at_100%_100%,rgba(6,182,212,0.18),transparent_60%)]">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Player Favorites</h1>
          <p className="text-gray-400 mb-6">Daily & weekly most-loved mobile games</p>
          
          {/* Period Toggle */}
          <div className="flex gap-2 mb-6">
            <Button
              variant={period === 'daily' ? 'default' : 'outline'}
              onClick={() => setPeriod('daily')}
              className={period === 'daily' 
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white' 
                : 'border-white/20 hover:bg-white/10 text-white'
              }
            >
              Daily
            </Button>
            <Button
              variant={period === 'weekly' ? 'default' : 'outline'}
              onClick={() => setPeriod('weekly')}
              className={period === 'weekly' 
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white' 
                : 'border-white/20 hover:bg-white/10 text-white'
              }
            >
              Weekly
            </Button>
          </div>
        </div>

        {/* Quest CTA Section */}
        <div className="mb-8">
          <Card className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur-sm border border-purple-500/30 p-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white mb-2">Not sure what to play?</h3>
                <p className="text-gray-300">
                  Take our quick quest to discover games perfectly matched to your preferences.
                </p>
              </div>
              <Link href="/quest">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold"
                >
                  Find My Game
                </Button>
              </Link>
            </div>
          </Card>
        </div>

        {/* Filters Section */}
        <div className="mb-8">
          <Card className="bg-card/50 backdrop-blur-sm border border-white/10 p-4">
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-sm text-gray-400 mr-2">Filters:</span>
              <Button
                variant={selectedTag === null ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedTag(null)}
                className={selectedTag === null 
                  ? 'bg-purple-600 hover:bg-purple-700 text-white' 
                  : 'border-white/20 hover:bg-white/10 text-white'
                }
              >
                All
              </Button>
              {availableTags.map((tag) => (
                <Button
                  key={tag.slug}
                  variant={selectedTag === tag.slug ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedTag(tag.slug)}
                  className={selectedTag === tag.slug 
                    ? 'bg-purple-600 hover:bg-purple-700 text-white' 
                    : 'border-white/20 hover:bg-white/10 text-white'
                  }
                >
                  {tag.label}
                </Button>
              ))}
            </div>
          </Card>
        </div>

        {/* Daily Favorites Section */}
        {period === 'daily' && (
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <h2 className="text-2xl font-bold text-white">Daily Favorites</h2>
              <Badge variant="outline" className="bg-purple-500/10 border-purple-500/30 text-purple-300">
                Top 5
              </Badge>
            </div>

            {currentLoading ? (
              <div className="flex items-center justify-center min-h-[400px]">
                <div className="flex items-center space-x-2">
                  <Loader2 className="w-6 h-6 animate-spin text-purple-400" />
                  <span className="text-lg text-gray-300">Loading favorites...</span>
                </div>
              </div>
            ) : currentGames.length === 0 ? (
              <Card className="bg-card/50 backdrop-blur-sm border border-white/10 p-8 text-center">
                <div className="mb-4">
                  <img src="/logo/logo-gamepad.webp" alt="Game" className="w-16 h-16 mx-auto" />
                </div>
                <h3 className="text-xl font-semibold text-gray-300 mb-2">No favorites found</h3>
                <p className="text-gray-400">
                  {selectedTag ? `No games found for this filter. Try a different tag.` : 'Check back later for daily favorites!'}
                </p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                {currentGames.map((game) => (
                  <FavoriteGameCard key={game.id} game={game} />
                ))}
              </div>
            )}
          </section>
        )}

        {/* Weekly Favorites Section */}
        {period === 'weekly' && (
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <h2 className="text-2xl font-bold text-white">Weekly Favorites</h2>
              <Badge variant="outline" className="bg-purple-500/10 border-purple-500/30 text-purple-300">
                Top 10
              </Badge>
            </div>

            {currentLoading ? (
              <div className="flex items-center justify-center min-h-[400px]">
                <div className="flex items-center space-x-2">
                  <Loader2 className="w-6 h-6 animate-spin text-purple-400" />
                  <span className="text-lg text-gray-300">Loading favorites...</span>
                </div>
              </div>
            ) : currentGames.length === 0 ? (
              <Card className="bg-card/50 backdrop-blur-sm border border-white/10 p-8 text-center">
                <div className="mb-4">
                  <img src="/logo/logo-gamepad.webp" alt="Game" className="w-16 h-16 mx-auto" />
                </div>
                <h3 className="text-xl font-semibold text-gray-300 mb-2">No favorites found</h3>
                <p className="text-gray-400">
                  {selectedTag ? `No games found for this filter. Try a different tag.` : 'Check back later for weekly favorites!'}
                </p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                {currentGames.map((game) => (
                  <FavoriteGameCard key={game.id} game={game} />
                ))}
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  )
}
