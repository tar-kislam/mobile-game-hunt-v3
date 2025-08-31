"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowUpIcon, MessageCircleIcon, ExternalLinkIcon, TrendingUpIcon } from "lucide-react"
import { EnhancedSubmitGameModal } from "@/components/games/enhanced-submit-game-modal"
import { GameCard } from "@/components/games/game-card"
import { TapTapGameCardNoScale } from "@/components/games/taptap-game-card-no-scale"
import { FeaturedGamesCarousel } from "@/components/games/featured-games-carousel"
import { TiltedGameCard } from "@/components/games/tilted-game-card"
import { toast } from "sonner"

// Mock data - In a real app, this would come from your database
const featuredGame = {
  id: "1",
  title: "Clash of Clans",
  description: "A popular strategy mobile game where you build and defend your village.",
  image: "https://images.unsplash.com/photo-1556438064-2d7646166914?w=400&h=300&fit=crop",
  votes: 152,
  comments: 23,
  url: "https://clashofclans.com",
  category: "Strategy",
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
    category: "AR",
    maker: { name: "Niantic", avatar: "" }
  },
  {
    id: "3",
    title: "Genshin Impact",
    description: "Open-world action RPG with gacha mechanics and stunning visuals.",
    image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=300&h=200&fit=crop",
    votes: 134,
    comments: 28,
    category: "RPG",
    maker: { name: "miHoYo", avatar: "" }
  },
  {
    id: "4",
    title: "Among Us",
    description: "Social deduction game where you find the impostor among crewmates.",
    image: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=300&h=200&fit=crop",
    votes: 76,
    comments: 19,
    category: "Social",
    maker: { name: "InnerSloth", avatar: "" }
  }
]

const trendingGames = [
  { name: "Subway Surfers", category: "Endless Runner", votes: 245 },
  { name: "Candy Crush Saga", category: "Puzzle", votes: 198 },
  { name: "PUBG Mobile", category: "Battle Royale", votes: 187 },
  { name: "Minecraft", category: "Sandbox", votes: 156 },
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
                    {product.category}
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

export default function HomePage() {
  const [games, setGames] = useState<Game[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchGames()
  }, [])

  const fetchGames = async () => {
    try {
      const response = await fetch('/api/products')
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

  const featuredGame = games[0]
  const allGames = games

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center space-y-4 mb-12">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            Mobile Game Hunt
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover the best mobile games, curated by the gaming community.
          </p>
          <EnhancedSubmitGameModal onGameSubmitted={handleGameSubmitted}>
            <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white rounded-2xl shadow-soft">
              Submit Your Game
            </Button>
          </EnhancedSubmitGameModal>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
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
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">🎮 Discover Games</h2>
                <Button variant="outline" asChild className="rounded-2xl">
                  <Link href="/products">View All</Link>
                </Button>
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
                  <p className="text-gray-600 dark:text-gray-300 mb-4">Be the first to submit a game to the community!</p>
                  <EnhancedSubmitGameModal onGameSubmitted={handleGameSubmitted}>
                    <Button className="bg-orange-500 hover:bg-orange-600 text-white rounded-2xl">
                      Submit First Game
                    </Button>
                  </EnhancedSubmitGameModal>
                </Card>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {allGames.map((game) => (
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
              )}
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
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
                        <div className="text-xs text-muted-foreground">{game.category}</div>
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
                  <Button className="w-full rounded-2xl bg-orange-500 hover:bg-orange-600 text-white">
                    Submit New Game
                  </Button>
                </EnhancedSubmitGameModal>
                <Button variant="outline" asChild className="w-full rounded-2xl">
                  <Link href="/products">Browse All Games</Link>
                </Button>
                <Button variant="outline" asChild className="w-full rounded-2xl">
                  <Link href="/categories">View Categories</Link>
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
