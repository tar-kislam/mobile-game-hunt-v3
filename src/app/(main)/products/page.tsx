"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, Star, Play, Heart, MessageCircle } from "lucide-react"
import { GameCard } from "@/components/games/game-card"
import Link from "next/link"
import Image from "next/image"

interface Game {
  id: string
  title: string
  tagline?: string | null
  description: string
  image?: string | null
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
  }
  categories?: {
    category: {
      id: string
      name: string
    }
  }[]
}

interface CategoryGroup {
  name: string
  games: Game[]
  isExpanded: boolean
}

const CATEGORIES = [
  { name: "Editor's Choice", slug: "editors-choice", icon: "⭐" },
  { name: "Action", slug: "action", icon: "⚔️" },
  { name: "Adventure", slug: "adventure", icon: "🗺️" },
  { name: "Strategy", slug: "strategy", icon: "🧠" },
  { name: "Casual", slug: "casual", icon: "🎮" },
  { name: "RPG", slug: "rpg", icon: "⚔️" },
  { name: "Sports", slug: "sports", icon: "⚽" },
  { name: "Racing", slug: "racing", icon: "🏎️" },
  { name: "Puzzle", slug: "puzzle", icon: "🧩" },
  { name: "Shooter", slug: "shooter", icon: "🔫" },
  { name: "Simulation", slug: "simulation", icon: "🏢" },
  { name: "Arcade", slug: "arcade", icon: "🎯" },
]

export default function ProductsPage() {
  const [games, setGames] = useState<Game[]>([])
  const [categoryGroups, setCategoryGroups] = useState<CategoryGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(1)
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())

  const fetchGames = async (pageNum: number = 1, append: boolean = false) => {
    try {
      setLoadingMore(true);
      const response = await fetch(`/api/products?limit=20&page=${pageNum}`)
      if (!response.ok) throw new Error('Failed to fetch games')
      
      const newGames: Game[] = await response.json()
      
      if (append) {
        setGames(prev => [...prev, ...newGames])
      } else {
        setGames(newGames)
      }
      
      setHasMore(newGames.length === 20)
      setPage(pageNum)
    } catch (error) {
      console.error('Error fetching games:', error)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  const loadMore = () => {
    setLoadingMore(true)
    fetchGames(page + 1, true)
  }

  const toggleCategory = (categoryName: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev)
      if (newSet.has(categoryName)) {
        newSet.delete(categoryName)
      } else {
        newSet.add(categoryName)
      }
      return newSet
    })
  }

  const groupGamesByCategory = (games: Game[]): CategoryGroup[] => {
    const categoryMap = new Map<string, Game[]>()
    
    games.forEach(game => {
      // Safety check: ensure categories exists and is an array
      if (game.categories && Array.isArray(game.categories)) {
        game.categories.forEach(cat => {
          const categoryName = cat.category.name
          if (!categoryMap.has(categoryName)) {
            categoryMap.set(categoryName, [])
          }
          categoryMap.get(categoryName)!.push(game)
        })
      }
    })
    
    return Array.from(categoryMap.entries())
      .map(([name, games]) => ({
        name,
        games,
        isExpanded: expandedCategories.has(name)
      }))
      .filter(group => group.games.length > 0)
      .sort((a, b) => b.games.length - a.games.length) // Sort by number of games
  }

  useEffect(() => {
    fetchGames()
  }, [])

  useEffect(() => {
    setCategoryGroups(groupGamesByCategory(games))
  }, [games, expandedCategories])

  const handleVote = async (gameId: string) => {
    try {
      const response = await fetch(`/api/products/${gameId}/vote`, {
        method: 'POST',
      })
      
      if (response.ok) {
        // Update the game's vote count in the local state
        setGames(prev => prev.map(game => 
          game.id === gameId 
            ? { ...game, _count: { ...game._count, votes: game._count.votes + 1 } }
            : game
        ))
      }
    } catch (error) {
      console.error('Error voting:', error)
    }
  }

  const getFilteredGames = () => {
    if (selectedCategory === "all") {
      return games
    }
    return games.filter(game => 
      game.categories && game.categories.some(cat => cat.category.name.toLowerCase() === selectedCategory.toLowerCase())
    )
  }

  const filteredGames = getFilteredGames()

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="flex items-center space-x-2">
              <Loader2 className="w-6 h-6 animate-spin text-purple-400" />
              <span className="text-lg text-gray-300">Loading games...</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Category Navigation - TapTap Style */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 mb-6">
            <Button
              variant={selectedCategory === "all" ? "default" : "outline"}
              onClick={() => setSelectedCategory("all")}
              className={`rounded-xl px-4 py-2 text-sm font-medium transition-all duration-300 ${
                selectedCategory === "all" 
                  ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg" 
                  : "bg-gray-800/50 text-gray-300 border-gray-600 hover:bg-gray-700/50"
              }`}
            >
              All Games
            </Button>
            {CATEGORIES.map((category) => (
              <Button
                key={category.slug}
                variant={selectedCategory === category.slug ? "default" : "outline"}
                onClick={() => setSelectedCategory(category.slug)}
                className={`rounded-xl px-4 py-2 text-sm font-medium transition-all duration-300 ${
                  selectedCategory === category.slug 
                    ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg" 
                    : "bg-gray-800/50 text-gray-300 border-gray-600 hover:bg-gray-700/50"
                }`}
              >
                <span className="mr-2">{category.icon}</span>
                {category.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        {selectedCategory === "all" ? (
          // Category Sections Layout
          <div className="space-y-8">
            {categoryGroups.map((category) => (
              <div key={category.name} className="space-y-4">
                {/* Category Header */}
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                      {category.name}
                    </h2>
                    <p className="text-gray-400 text-sm mt-1">
                      Explore amazing {category.name.toLowerCase()} games
                    </p>
                  </div>
                  <Badge variant="secondary" className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                    {category.games.length} games
                  </Badge>
                </div>

                {/* Games Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {category.games.slice(0, 8).map((game) => (
                    <Link key={game.id} href={`/product/${game.id}`}>
                      <GameCard 
                        game={game} 
                        onVote={handleVote}
                        showAuthor={false}
                      />
                    </Link>
                  ))}
                </div>

                {/* Show More Button for Category */}
                {category.games.length > 8 && (
                  <div className="flex justify-center">
                    <Button
                      onClick={() => toggleCategory(category.name)}
                      variant="outline"
                      className="rounded-xl px-6 py-2 text-gray-300 border-gray-600 hover:bg-gray-700/50"
                    >
                      {expandedCategories.has(category.name) ? 'Show Less' : `Show All ${category.games.length} Games`}
                    </Button>
                  </div>
                )}

                {/* Expanded Games */}
                {expandedCategories.has(category.name) && category.games.length > 8 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-6">
                    {category.games.slice(8).map((game) => (
                      <Link key={game.id} href={`/product/${game.id}`}>
                        <GameCard 
                          game={game} 
                          onVote={handleVote}
                          showAuthor={false}
                        />
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          // Single Category Layout - TapTap Style
          <div className="space-y-6">
            {/* Category Header */}
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-white mb-2 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                {CATEGORIES.find(c => c.slug === selectedCategory)?.name || selectedCategory}
              </h1>
              <p className="text-gray-300 text-lg max-w-2xl mx-auto">
                Explore thousands of FREE, top-rated {CATEGORIES.find(c => c.slug === selectedCategory)?.name.toLowerCase()} games for mobile, discover amazing titles and find your next favorite game.
              </p>
            </div>

            {/* Games Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredGames.map((game) => (
                <Link key={game.id} href={`/product/${game.id}`}>
                  <GameCard 
                    game={game} 
                    onVote={handleVote}
                    showAuthor={false}
                  />
                </Link>
              ))}
            </div>

            {/* No Games Message */}
            {filteredGames.length === 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🎮</div>
                <h3 className="text-xl font-semibold text-gray-300 mb-2">No games found in this category</h3>
                <p className="text-gray-400 mb-6">Be the first to submit a {CATEGORIES.find(c => c.slug === selectedCategory)?.name.toLowerCase()} game!</p>
                <Link href="/submit">
                  <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-2 rounded-xl">
                    Submit Your Game
                  </Button>
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Load More Button */}
        {hasMore && selectedCategory === "all" && (
          <div className="flex justify-center mt-8">
            <Button
              onClick={loadMore}
              disabled={loadingMore}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105"
            >
              {loadingMore ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                'Load More Games'
              )}
            </Button>
          </div>
        )}

        {/* No Games Message */}
        {!loading && games.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎮</div>
            <h3 className="text-xl font-semibold text-gray-300 mb-2">No games found</h3>
            <p className="text-gray-400 mb-6">Be the first to submit a game!</p>
            <Link href="/submit">
              <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-2 rounded-xl">
                Submit Your Game
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
