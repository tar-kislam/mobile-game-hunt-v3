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
import { TimeWindowControl } from "@/components/games/time-window-control"
import Link from "next/link"
import Image from "next/image"
import { PLATFORMS } from "@/components/ui/platform-icons"
import Head from 'next/head'
import styles from './products.module.css'

interface Game {
  id: string
  slug: string
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
  editorChoice?: boolean
  languages?: any
  monetization?: string
  engine?: string
  countries?: string[]
  pricing?: string
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
  // New time-window aggregated fields
  votesInWindow?: number
  followsInWindow?: number
  clicksInWindow?: number
  viewsInWindow?: number
  score?: number
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
  const [timeWindow, setTimeWindow] = useState<string>("alltime")
  
  // Search and filter states
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([])
  const [selectedReleaseStatuses, setSelectedReleaseStatuses] = useState<string[]>([])
  const [selectedMonetization, setSelectedMonetization] = useState<string[]>([])
  const [selectedEngines, setSelectedEngines] = useState<string[]>([])
  const [selectedPricing, setSelectedPricing] = useState<string[]>([])

  const fetchGames = async (pageNum: number = 1, append: boolean = false) => {
    try {
      setLoadingMore(true);
      
      // Build query parameters
      const params = new URLSearchParams({
        limit: '20',
        page: pageNum.toString(),
        sortBy: sortBy,
        timeWindow: timeWindow
      })
      
      // Add filter parameters
      if (selectedCategories.length > 0) {
        params.append('categoryId', selectedCategories[0]) // API expects single category
      }
      if (selectedMonetization.length > 0) {
        params.append('monetization', selectedMonetization.join(','))
      }
      if (selectedEngines.length > 0) {
        params.append('engine', selectedEngines.join(','))
      }
      if (selectedPricing.length > 0) {
        params.append('pricing', selectedPricing.join(','))
      }
      
      const response = await fetch(`/api/products?${params.toString()}`)
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
    const monetization: FilterOption[] = []
    const engines: FilterOption[] = []
    const pricing: FilterOption[] = []

    // Count categories
    const categoryCounts: Record<string, number> = {}
    const platformCounts: Record<string, number> = {}
    const monetizationCounts: Record<string, number> = {}
    const engineCounts: Record<string, number> = {}
    const pricingCounts: Record<string, number> = {}
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

      // Count monetization
      if (game.monetization) {
        monetizationCounts[game.monetization] = (monetizationCounts[game.monetization] || 0) + 1
      }

      // Count engine
      if (game.engine) {
        engineCounts[game.engine] = (engineCounts[game.engine] || 0) + 1
      }

      // Count pricing
      if (game.pricing) {
        pricingCounts[game.pricing] = (pricingCounts[game.pricing] || 0) + 1
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

    Object.entries(monetizationCounts).forEach(([name, count]) => {
      monetization.push({ value: name.toLowerCase(), label: name, count })
    })

    Object.entries(engineCounts).forEach(([name, count]) => {
      engines.push({ value: name.toLowerCase(), label: name, count })
    })

    Object.entries(pricingCounts).forEach(([name, count]) => {
      pricing.push({ value: name.toLowerCase(), label: name, count })
    })

    releaseStatuses[0].count = releasedCount
    releaseStatuses[1].count = upcomingCount

    return {
      categories: categories.sort((a, b) => (b.count || 0) - (a.count || 0)),
      platforms: platforms.sort((a, b) => (b.count || 0) - (a.count || 0)),
      releaseStatuses: releaseStatuses.filter(status => (status.count || 0) > 0),
      monetization: monetization.sort((a, b) => (b.count || 0) - (a.count || 0)),
      engines: engines.sort((a, b) => (b.count || 0) - (a.count || 0)),
      pricing: pricing.sort((a, b) => (b.count || 0) - (a.count || 0))
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

    // Note: Sorting is now handled by the backend API based on sortBy parameter
    // The games are already sorted when fetched from the API
    return filtered
  }, [games, searchQuery, selectedCategories, selectedPlatforms, selectedReleaseStatuses])

  const clearFilters = () => {
    setSearchQuery("")
    setSelectedCategories([])
    setSelectedPlatforms([])
    setSelectedReleaseStatuses([])
    setSelectedMonetization([])
    setSelectedEngines([])
    setSelectedPricing([])
  }

  useEffect(() => {
    fetchGames()
  }, [sortBy, timeWindow, selectedCategories, selectedMonetization, selectedEngines, selectedPricing])

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
    <div className={`min-h-screen bg-gradient-to-br from-black via-[#121225] to-[#050509] bg-[radial-gradient(80%_80%_at_0%_0%,rgba(124,58,237,0.22),transparent_60%),radial-gradient(80%_80%_at_100%_100%,rgba(6,182,212,0.18),transparent_60%)] ${styles.productsPage}`}>
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Epunda+Slab:ital,wght@0,300..900;1,300..900&family=Funnel+Display:wght@300..800&family=Lexend:wght@100..900&family=Orbitron:wght@400..900&family=Quantico:ital,wght@0,400;0,700;1,400;1,700&family=Sansation:ital,wght@0,300;0,400;0,700;1,300;1,400;1,700&family=Underdog&display=swap" rel="stylesheet" />
      </Head>
      <div className="container mx-auto px-4 py-8">
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

        {/* Time Window Control */}
        <div className="mb-6">
          <div className="bg-card/50 backdrop-blur-sm border border-white/10 rounded-lg p-4">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Time Window</h3>
                <p className="text-sm text-gray-400">Filter games by activity period</p>
              </div>
              <TimeWindowControl
                timeWindow={timeWindow}
                onTimeWindowChange={setTimeWindow}
                className="lg:ml-auto"
              />
            </div>
          </div>
        </div>

        {/* Main Layout - GOG Style */}
        <div className="flex gap-8">
          {/* Left Sidebar - Desktop */}
          <GogSidebar
            categories={filterOptions.categories}
            platforms={filterOptions.platforms}
            releaseStatuses={filterOptions.releaseStatuses}
            monetization={filterOptions.monetization}
            engines={filterOptions.engines}
            pricing={filterOptions.pricing}
            selectedCategories={selectedCategories}
            selectedPlatforms={selectedPlatforms}
            selectedReleaseStatuses={selectedReleaseStatuses}
            selectedMonetization={selectedMonetization}
            selectedEngines={selectedEngines}
            selectedPricing={selectedPricing}
            onCategoryChange={setSelectedCategories}
            onPlatformChange={setSelectedPlatforms}
            onReleaseStatusChange={setSelectedReleaseStatuses}
            onMonetizationChange={setSelectedMonetization}
            onEngineChange={setSelectedEngines}
            onPricingChange={setSelectedPricing}
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

            {/* Status Badge */}
            <div className="mb-4 flex items-center gap-2">
              <Badge variant="outline" className="bg-gray-800/50 border-gray-600 text-gray-300 font-[Orbitron] font-semibold">
                Showing {sortBy === 'newest' ? 'Newest' : 
                         sortBy === 'most-upvoted' ? 'Most Upvoted' :
                         sortBy === 'most-viewed' ? 'Most Viewed' :
                         sortBy === 'editors-choice' ? "Editor's Choice" :
                         sortBy === 'leaderboard' ? 'Leaderboard' : 'Newest'}
              </Badge>
              <span className="text-gray-400">•</span>
              <Badge variant="outline" className="bg-gray-800/50 border-gray-600 text-gray-300 font-[Orbitron] font-semibold">
                {timeWindow === 'daily' ? 'Daily' :
                 timeWindow === 'weekly' ? 'Weekly' :
                 timeWindow === 'monthly' ? 'Monthly' :
                 timeWindow === 'yearly' ? 'Yearly' :
                 timeWindow === 'alltime' ? 'All Time' : 'All Time'}
              </Badge>
            </div>

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
                <div className="mb-4">
                  <img src="/logo/logo-gamepad.webp" alt="Game" className="w-16 h-16" />
                </div>
                <h3 className="text-xl font-semibold text-gray-300 mb-2">No games found</h3>
                <p className="text-gray-400 mb-6">
                  {games.length === 0 
                    ? "Be the first to submit a game!" 
                    : timeWindow !== 'alltime' && games.length > 0
                    ? `No results for this time range. Try selecting "All Time" or a different period.`
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
                {timeWindow !== 'alltime' && games.length > 0 && (
                  <Button
                    onClick={() => setTimeWindow('alltime')}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  >
                    Show All Time
                  </Button>
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