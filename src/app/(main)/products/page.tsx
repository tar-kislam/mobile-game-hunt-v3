"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, Heart, MessageCircle, ExternalLink, Calendar } from "lucide-react"
import { GogGameCard } from "@/components/games/gog-game-card"
import { GogSearchBar } from "@/components/games/gog-search-bar"
import { GogSidebar } from "@/components/games/gog-sidebar"
import { GameSortBar } from "@/components/games/game-sort-bar"
import Link from "next/link"
import Image from "next/image"
import { PLATFORMS } from "@/components/ui/platform-icons"

interface Game {
  id: string
  title: string
  tagline?: string | null
  description: string
  image?: string | null
  thumbnail?: string | null
  url: string
  platforms?: string[]
  createdAt: string
  releaseAt?: string | null
  clicks: number
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

interface FilterOption {
  value: string
  label: string
  count?: number
}

export default function ProductsPage() {
  const [games, setGames] = useState<Game[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(1)
  const [sortBy, setSortBy] = useState<string>("newest")
  
  // Search and filter states
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([])
  const [selectedReleaseStatuses, setSelectedReleaseStatuses] = useState<string[]>([])

  const fetchGames = async (pageNum: number = 1, append: boolean = false) => {
    try {
      setLoadingMore(true);
      const response = await fetch(`/api/products?limit=20&page=${pageNum}&sortBy=${sortBy}`)
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

  const handleVote = async (gameId: string) => {
    try {
      const response = await fetch(`/api/products/${gameId}/vote`, {
        method: 'POST',
      })
      
      if (response.ok) {
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

  // Generate filter options from games data
  const filterOptions = useMemo(() => {
    const categories: FilterOption[] = []
    const platforms: FilterOption[] = []
    const releaseStatuses: FilterOption[] = [
      { value: 'released', label: 'Released', count: 0 },
      { value: 'upcoming', label: 'Upcoming', count: 0 }
    ]

    // Count categories
    const categoryCounts: Record<string, number> = {}
    const platformCounts: Record<string, number> = {}
    let releasedCount = 0
    let upcomingCount = 0

    games.forEach(game => {
      // Count categories
      if (game.categories) {
        game.categories.forEach(cat => {
          const categoryName = cat.category.name
          categoryCounts[categoryName] = (categoryCounts[categoryName] || 0) + 1
        })
      }

      // Count platforms
      if (game.platforms) {
        game.platforms.forEach(platform => {
          platformCounts[platform] = (platformCounts[platform] || 0) + 1
        })
      }

      // Count release status
      if (game.releaseAt) {
        const releaseDate = new Date(game.releaseAt)
        const now = new Date()
        if (releaseDate > now) {
          upcomingCount++
        } else {
          releasedCount++
        }
      }
    })

    // Convert to filter options
    Object.entries(categoryCounts).forEach(([name, count]) => {
      categories.push({ value: name.toLowerCase(), label: name, count })
    })

    Object.entries(platformCounts).forEach(([platform, count]) => {
      const platformInfo = PLATFORMS.find(p => p.value === platform.toLowerCase())
      platforms.push({ 
        value: platform.toLowerCase(), 
        label: platformInfo?.label || platform, 
        count 
      })
    })

    releaseStatuses[0].count = releasedCount
    releaseStatuses[1].count = upcomingCount

    return {
      categories: categories.sort((a, b) => (b.count || 0) - (a.count || 0)),
      platforms: platforms.sort((a, b) => (b.count || 0) - (a.count || 0)),
      releaseStatuses: releaseStatuses.filter(status => (status.count || 0) > 0)
    }
  }, [games])

  // Filter and sort games
  const filteredAndSortedGames = useMemo(() => {
    let filtered = games

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(game => 
        game.title.toLowerCase().includes(query) ||
        game.tagline?.toLowerCase().includes(query) ||
        game.description?.toLowerCase().includes(query)
      )
    }

    // Apply category filter
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(game => 
        game.categories && game.categories.some(cat => 
          selectedCategories.includes(cat.category.name.toLowerCase())
        )
      )
    }

    // Apply platform filter
    if (selectedPlatforms.length > 0) {
      filtered = filtered.filter(game => 
        game.platforms && game.platforms.some(platform => 
          selectedPlatforms.includes(platform.toLowerCase())
        )
      )
    }

    // Apply release status filter
    if (selectedReleaseStatuses.length > 0) {
      filtered = filtered.filter(game => {
        if (!game.releaseAt) return false
        
        const releaseDate = new Date(game.releaseAt)
        const now = new Date()
        const isUpcoming = releaseDate > now
        
        return selectedReleaseStatuses.includes(isUpcoming ? 'upcoming' : 'released')
      })
    }

    // Apply sorting
    switch (sortBy) {
      case 'most-upvoted':
        return filtered.sort((a, b) => b._count.votes - a._count.votes)
      case 'most-viewed':
        return filtered.sort((a, b) => b.clicks - a.clicks)
      case 'editors-choice':
        // For now, fall back to newest since editorChoice field might not be available
        return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      case 'newest':
      default:
        return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    }
  }, [games, searchQuery, selectedCategories, selectedPlatforms, selectedReleaseStatuses, sortBy])

  const clearFilters = () => {
    setSearchQuery("")
    setSelectedCategories([])
    setSelectedPlatforms([])
    setSelectedReleaseStatuses([])
  }

  useEffect(() => {
    fetchGames()
  }, [sortBy])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-[#121225] to-[#050509] bg-[radial-gradient(80%_80%_at_0%_0%,rgba(124,58,237,0.22),transparent_60%),radial-gradient(80%_80%_at_100%_100%,rgba(6,182,212,0.18),transparent_60%)]">
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
    <div className="min-h-screen bg-gradient-to-br from-black via-[#121225] to-[#050509] bg-[radial-gradient(80%_80%_at_0%_0%,rgba(124,58,237,0.22),transparent_60%),radial-gradient(80%_80%_at_100%_100%,rgba(6,182,212,0.18),transparent_60%)]">
      <div className="container mx-auto px-4 py-8">
        {/* Page Title - GOG Style */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white mb-2">
            Mobile Games / All Games ({games.length}) of {games.length} games in total
          </h1>
        </div>

        {/* Search Bar - GOG Style */}
        <div className="mb-6">
          <GogSearchBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedCategory={selectedCategories.length === 0 ? "all" : selectedCategories[0]}
            onCategoryChange={(category) => setSelectedCategories(category === "all" ? [] : [category])}
            selectedPlatform={selectedPlatforms.length === 0 ? "all" : selectedPlatforms[0]}
            onPlatformChange={(platform) => setSelectedPlatforms(platform === "all" ? [] : [platform])}
            selectedReleaseStatus={selectedReleaseStatuses.length === 0 ? "all" : selectedReleaseStatuses[0]}
            onReleaseStatusChange={(status) => setSelectedReleaseStatuses(status === "all" ? [] : [status])}
            categories={filterOptions.categories}
            platforms={filterOptions.platforms}
            releaseStatuses={filterOptions.releaseStatuses}
            onClearFilters={clearFilters}
          />
        </div>

        {/* Main Layout - GOG Style */}
        <div className="flex gap-8">
          {/* Left Sidebar - Desktop */}
          <GogSidebar
            categories={filterOptions.categories}
            platforms={filterOptions.platforms}
            releaseStatuses={filterOptions.releaseStatuses}
            selectedCategories={selectedCategories}
            selectedPlatforms={selectedPlatforms}
            selectedReleaseStatuses={selectedReleaseStatuses}
            onCategoryChange={setSelectedCategories}
            onPlatformChange={setSelectedPlatforms}
            onReleaseStatusChange={setSelectedReleaseStatuses}
            onClearFilters={clearFilters}
            className="hidden lg:block"
          />

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Sort Bar */}
            <GameSortBar
              sortBy={sortBy}
              onSortChange={setSortBy}
              totalGames={games.length}
              filteredGames={filteredAndSortedGames.length}
              className="mb-6"
            />

            {/* Games Grid - GOG Style */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
              {filteredAndSortedGames.map((game) => (
                <GogGameCard 
                  key={game.id} 
                  game={game} 
                  onVote={handleVote}
                />
              ))}
            </div>

            {/* No Games Message */}
            {filteredAndSortedGames.length === 0 && !loading && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🎮</div>
                <h3 className="text-xl font-semibold text-gray-300 mb-2">No games found</h3>
                <p className="text-gray-400 mb-6">
                  {games.length === 0 
                    ? "Be the first to submit a game!" 
                    : "Try adjusting your search or filters to see more games."
                  }
                </p>
                {games.length === 0 && (
                  <Link href="/submit">
                    <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-2 rounded-xl">
                      Submit Your Game
                    </Button>
                  </Link>
                )}
              </div>
            )}

            {/* Load More Button */}
            {hasMore && filteredAndSortedGames.length > 0 && (
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
          </div>
        </div>
      </div>
    </div>
  )
}