"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowUpIcon, MessageCircleIcon, ExternalLinkIcon, TrendingUpIcon } from "lucide-react"
import { EnhancedSubmitGameModal } from "@/components/games/enhanced-submit-game-modal"
import { GameCard } from "@/components/games/game-card"
import { TapTapGameCardNoScale } from "@/components/games/taptap-game-card-no-scale"
import { FeaturedGamesCarousel } from "@/components/games/featured-games-carousel"
import { TiltedGameCard } from "@/components/games/tilted-game-card"
import { CTASection } from "@/components/sections/cta-section"
import { toast } from "sonner"

// Mock data - In a real app, this would come from your database
const featuredProduct = {
  id: "1",
  title: "Clash of Clans",
  description: "A popular strategy mobile game where you build and defend your village.",
  image: "https://images.unsplash.com/photo-1556438064-2d7646166914?w=400&h=300&fit=crop",
  votes: 152,
  comments: 23,
  url: "https://clashofclans.com",
  platforms: ["ios", "android"],
  maker: {
    name: "Supercell",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face"
  }
}

const dailyProducts = [
  {
    id: "2",
    title: "Pokemon GO",
    description: "Augmented reality mobile game that lets you catch Pokemon in the real world.",
    image: "https://images.unsplash.com/photo-1606503153255-59d8b8b91448?w=300&h=200&fit=crop",
    votes: 89,
    comments: 15,
    platforms: ["ios", "android"],
    maker: { name: "Niantic", avatar: "" }
  },
  {
    id: "3",
    title: "Genshin Impact",
    description: "Open-world action RPG with gacha mechanics and stunning visuals.",
    image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=300&h=200&fit=crop",
    votes: 134,
    comments: 28,
    platforms: ["ios", "android", "web"],
    maker: { name: "miHoYo", avatar: "" }
  },
  {
    id: "4",
    title: "Among Us",
    description: "Social deduction game where you find the impostor among crewmates.",
    image: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=300&h=200&fit=crop",
    votes: 76,
    comments: 19,
    platforms: ["ios", "android", "web"],
    maker: { name: "InnerSloth", avatar: "" }
  }
]

const trendingGames = [
  { name: "Subway Surfers", platforms: ["ios", "android"], votes: 245 },
  { name: "Candy Crush Saga", platforms: ["ios", "android", "web"], votes: 198 },
  { name: "PUBG Mobile", platforms: ["ios", "android"], votes: 187 },
  { name: "Minecraft", platforms: ["ios", "android", "web"], votes: 156 },
]

function ProductCard({ product, rank }: { product: typeof dailyProducts[0], rank?: number }) {
  return (
    <Card className="rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border-white/10 hover:scale-[1.02] hover:shadow-black/20">
      <CardContent className="p-0">
        <div className="flex gap-4 p-4">
          {rank && (
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-muted text-muted-foreground font-bold text-sm">
              {rank}
            </div>
          )}
          
          <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-muted">
            <img 
              src={product.image} 
              alt={product.title}
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <Link href={`/product/${product.id}`} className="hover:underline">
                  <h3 className="font-semibold text-sm leading-tight">{product.title}</h3>
                </Link>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  {product.description}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="secondary" className="rounded-2xl text-xs">
                    {product.platforms?.map(p => p.toUpperCase()).join(', ') || 'No platforms listed'}
                  </Badge>
                  <span className="text-xs text-muted-foreground">by {product.maker.name}</span>
                </div>
              </div>
              
              <div className="flex flex-col items-center gap-1 ml-4">
                <Button variant="outline" size="sm" className="rounded-xl h-8 w-12 p-0">
                  <ArrowUpIcon className="h-3 w-3" />
                </Button>
                <span className="text-xs font-medium">{product.votes}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <MessageCircleIcon className="h-3 w-3" />
                {product.comments}
              </div>
              <Button variant="ghost" size="sm" className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground">
                <ExternalLinkIcon className="h-3 w-3 mr-1" />
                Visit
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

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
  platforms?: string[]
  _count: {
    votes: number
    comments: number
  }
}

export default function HomePage() {
  const [games, setGames] = useState<Game[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [sortBy, setSortBy] = useState<'newest' | 'most-upvoted' | 'most-viewed' | 'editors-choice'>('newest')
  const [showAll, setShowAll] = useState(false)
  const [leaderboardPreview, setLeaderboardPreview] = useState<{
    id: string
    title: string
    score: number
    votes: number
    rank: number
  }[]>([])
  const [isLoadingPreview, setIsLoadingPreview] = useState(false)

  useEffect(() => {
    fetchGames()
    fetchLeaderboardPreview()
  }, [sortBy])

  useEffect(() => {
    setShowAll(false) // Reset showAll when filter changes
  }, [sortBy])

  const fetchGames = async () => {
    try {
      const response = await fetch(`/api/products?sortBy=${sortBy}`)
      if (response.ok) {
        const data = await response.json()
        setGames(data)
      } else {
        toast.error('Failed to load games')
      }
    } catch (error) {
      console.error('Error fetching games:', error)
      toast.error('Failed to load games')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGameSubmitted = () => {
    fetchGames() // Refresh the games list
  }

  const handleVote = async (gameId: string) => {
    // TODO: Implement voting functionality
    toast.info('Voting feature coming soon!')
  }

  const getButtonText = () => {
    const filterNames = {
      'newest': 'Newest',
      'most-upvoted': 'Most Upvoted',
      'most-viewed': 'Most Viewed',
      'editors-choice': 'Editor\'s Choice'
    }
    
    if (showAll) {
      return 'Show Less'
    }
    
    return `View all ${filterNames[sortBy]} Games`
  }

  const getDisplayGames = () => {
    if (showAll) {
      return games
    }
    return games.slice(0, 8)
  }

  const hasMoreGames = games.length > 8

  const fetchLeaderboardPreview = async () => {
    try {
      setIsLoadingPreview(true)
      const res = await fetch('/api/leaderboard?window=daily&take=5')
      if (!res.ok) return
      const data = await res.json()
      const items = (data?.products || []).map((p: any) => ({
        id: p.id as string,
        title: p.title as string,
        score: Number(p.score) || 0,
        votes: Number(p.votes) || 0,
        rank: Number(p.rank) || 0,
      }))
      setLeaderboardPreview(items)
    } catch (e) {
      // fail silently for preview
    } finally {
      setIsLoadingPreview(false)
    }
  }

  const featuredGame = games[0]

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* CTA Section - Main Hero */}
        <CTASection />

        <div className="grid lg:grid-cols-4 gap-8 mt-16">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Featured Games Carousel */}
            {!isLoading && games.length > 0 && (
              <FeaturedGamesCarousel 
                games={games} 
                onGameClick={(gameId) => {
                  // Navigate to game detail page (handled by Link in component)
                  console.log('Featured game clicked:', gameId)
                }}
              />
            )}

            {/* All Games */}
            <section>
              <div className="mb-6">
                <h2 className="text-2xl font-bold mb-4">🎮 Discover Games</h2>
                
                {/* Filter Tabs */}
                <Tabs value={sortBy} onValueChange={(value) => setSortBy(value as any)} className="w-full">
                  <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 bg-gray-800/50 border-purple-500/20">
                    <TabsTrigger 
                      value="newest" 
                      className="data-[state=active]:bg-purple-500 data-[state=active]:text-white text-gray-300 hover:text-white"
                    >
                      Newest
                    </TabsTrigger>
                    <TabsTrigger 
                      value="most-upvoted" 
                      className="data-[state=active]:bg-purple-500 data-[state=active]:text-white text-gray-300 hover:text-white"
                    >
                      Most Upvoted
                    </TabsTrigger>
                    <TabsTrigger 
                      value="most-viewed" 
                      className="data-[state=active]:bg-purple-500 data-[state=active]:text-white text-gray-300 hover:text-white"
                    >
                      Most Viewed
                    </TabsTrigger>
                    <TabsTrigger 
                      value="editors-choice" 
                      className="data-[state=active]:bg-purple-500 data-[state=active]:text-white text-gray-300 hover:text-white"
                    >
                      Editor's Choice
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
              
              {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="animate-pulse">
                      <Card className="rounded-xl shadow-lg border-white/10">
                        <div className="aspect-square bg-gray-200 rounded-t-xl"></div>
                        <CardContent className="p-3 space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                          <div className="h-3 bg-gray-200 rounded w-full"></div>
                        </CardContent>
                      </Card>
                    </div>
                  ))}
                </div>
              ) : games.length === 0 ? (
                <Card className="rounded-2xl shadow-lg p-8 text-center border-white/10">
                  <div className="text-6xl mb-4">🎮</div>
                  <h3 className="text-xl font-semibold mb-2">No games yet</h3>
                  <p className="text-muted-foreground mb-4">Be the first to submit a game to the community!</p>
                  <EnhancedSubmitGameModal onGameSubmitted={handleGameSubmitted}>
                    <Button className="bg-[rgb(60,41,100)] hover:bg-[rgb(50,31,90)] text-white rounded-2xl">
                      Submit First Game
                    </Button>
                  </EnhancedSubmitGameModal>
                </Card>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {getDisplayGames().map((game) => (
                      <TiltedGameCard key={`tilted-${game.id}`} className="h-full">
                        <TapTapGameCardNoScale 
                          key={game.id} 
                          game={game} 
                          onVote={handleVote}
                          showAuthor={true}
                        />
                      </TiltedGameCard>
                    ))}
                  </div>
                  
                  {/* Expand/Collapse Button */}
                  {hasMoreGames && (
                    <div className="flex justify-center mt-6">
                      <Button
                        onClick={() => setShowAll(!showAll)}
                        className="bg-purple-500 hover:bg-purple-600 text-white rounded-2xl px-8 py-3 transition-all duration-300 hover:scale-105"
                      >
                        {getButtonText()}
                      </Button>
                    </div>
                  )}
                </>
              )}
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Leaderboard Preview */}
            <Card className="rounded-2xl shadow-lg border-white/10">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="flex items-center justify-between">
                  <span>Top Rated Games</span>
                  <Button variant="ghost" size="sm" asChild className="h-auto py-0 px-2 text-xs">
                    <Link href="/leaderboard">View all</Link>
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                {isLoadingPreview ? (
                  <div className="space-y-3">
                    {[1,2,3,4,5].map(i => (
                      <div key={i} className="flex items-center justify-between animate-pulse">
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 rounded bg-muted" />
                          <div className="h-3 w-40 bg-muted rounded" />
                        </div>
                        <div className="h-3 w-10 bg-muted rounded" />
                      </div>
                    ))}
                  </div>
                ) : leaderboardPreview.length === 0 ? (
                  <div className="text-sm text-muted-foreground">No data yet</div>
                ) : (
                  <div className="space-y-3">
                    {leaderboardPreview.map(item => (
                      <div key={item.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-6 h-6 rounded-lg bg-muted text-muted-foreground flex items-center justify-center text-xs font-semibold">
                            {item.rank}
                          </div>
                          <Link href={`/product/${item.id}`} className="truncate hover:underline text-sm font-medium">
                            {item.title}
                          </Link>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <ArrowUpIcon className="h-3 w-3" />
                          {item.votes}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
            {/* Trending Section */}
            <Card className="rounded-2xl shadow-lg border-white/10">
              <CardHeader className="p-4">
                <CardTitle className="flex items-center gap-2">
                  <TrendingUpIcon className="h-5 w-5" />
                  Trending This Week
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="space-y-3">
                  {trendingGames.map((game, index) => (
                    <div key={game.name} className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-sm">{game.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {game.platforms?.map(p => p.toUpperCase()).join(', ') || 'No platforms listed'}
                        </div>
                      </div>
                      <div className="text-xs font-medium text-muted-foreground">
                        {game.votes} votes
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="rounded-2xl shadow-lg border-white/10">
              <CardHeader className="p-4">
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0 space-y-3">
                <EnhancedSubmitGameModal onGameSubmitted={handleGameSubmitted}>
                  <Button className="w-full rounded-2xl bg-[rgb(60,41,100)] hover:bg-[rgb(50,31,90)] text-white">
                    Submit New Game
                  </Button>
                </EnhancedSubmitGameModal>
                <Button variant="outline" asChild className="w-full rounded-2xl">
                  <Link href="/products">Browse All Games</Link>
                </Button>
                <Button variant="outline" asChild className="w-full rounded-2xl">
                  <Link href="/platforms">View Platforms</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Newsletter Signup */}
            <Card className="rounded-2xl shadow-lg border-white/10">
              <CardHeader className="p-4">
                <CardTitle>Stay Updated</CardTitle>
                <CardDescription>
                  Get weekly updates on the best mobile games
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <Button variant="outline" className="w-full rounded-2xl">
                  Subscribe to Newsletter
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
