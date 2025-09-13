"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowUpIcon, MessageCircleIcon, ExternalLinkIcon, TrendingUpIcon, ChevronDownIcon } from "lucide-react"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Autoplay from "embla-carousel-autoplay"
import { EnhancedSubmitGameModal } from "@/components/games/enhanced-submit-game-modal"
import { GameCard } from "@/components/games/game-card"
import { TapTapGameCardNoScale } from "@/components/games/taptap-game-card-no-scale"
import { EpicFeaturedGames } from "@/components/games/epic-featured-games"
import { TiltedGameCard } from "@/components/games/tilted-game-card"
import { CTASection } from "@/components/sections/cta-section"
import { NewsletterModal } from "@/components/modals/newsletter-modal"
import { toast } from "sonner"
import useSWR from 'swr'
import ShinyText from "@/components/ShinyText"

// Fetcher function for SWR
const fetcher = (url: string) => fetch(url).then((res) => res.json())

// Mobile Filter Dropdown Component
interface MobileFilterDropdownProps {
  sortBy: "newest" | "most-upvoted" | "most-viewed" | "editors-choice"
  onSortChange: (value: "newest" | "most-upvoted" | "most-viewed" | "editors-choice") => void
}

function MobileFilterDropdown({ sortBy, onSortChange }: MobileFilterDropdownProps) {
  const filterNames = {
    newest: "Newest",
    "most-upvoted": "Most Upvoted", 
    "most-viewed": "Most Viewed",
    "editors-choice": "Editor's Choice"
  }

  return (
    <nav className="w-full">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            className="w-full justify-between bg-gray-900/80 backdrop-blur-sm border border-white/10 text-white hover:bg-white/5 transition-all duration-300 rounded-xl shadow-lg shadow-purple-500/10 hover:shadow-purple-500/20 hover:scale-[1.02]"
          >
            {filterNames[sortBy as keyof typeof filterNames] || "Newest"}
            <ChevronDownIcon className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-full bg-gray-900/95 backdrop-blur-sm border border-white/10 rounded-xl shadow-lg shadow-purple-500/20">
          {Object.entries(filterNames).map(([value, label]) => (
            <DropdownMenuItem
              key={value}
              onClick={() => onSortChange(value as "newest" | "most-upvoted" | "most-viewed" | "editors-choice")}
              className={`text-white hover:bg-gradient-to-r hover:from-purple-600/20 hover:to-violet-600/20 cursor-pointer transition-all duration-300 rounded-lg ${
                sortBy === value ? "bg-gradient-to-r from-purple-600/30 to-violet-600/30 shadow-lg shadow-purple-500/20" : ""
              }`}
            >
              {label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </nav>
  )
}

// Mobile Games Carousel Component
interface MobileGamesCarouselProps {
  games: Game[]
  onVote: (gameId: string) => void
}

function MobileGamesCarousel({ games, onVote }: MobileGamesCarouselProps) {
  const [api, setApi] = useState<CarouselApi>()
  const [current, setCurrent] = useState(0)
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!api) return

    setCount(api.scrollSnapList().length)
    setCurrent(api.selectedScrollSnap() + 1)

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1)
    })
  }, [api])

  const scrollTo = (index: number) => {
    if (api) {
      api.scrollTo(index)
    }
  }

  if (games.length === 0) {
    return (
      <Card className="rounded-2xl shadow-lg p-8 text-center border-white/10">
        <div className="text-6xl mb-4">🎮</div>
        <h3 className="text-xl font-semibold mb-2">No games yet</h3>
        <p className="text-muted-foreground mb-4">Be the first to submit a game to the community!</p>
      </Card>
    )
  }

  return (
    <div className="space-y-4 w-full max-w-full overflow-hidden">
      <Carousel
        setApi={setApi}
        plugins={[
          Autoplay({
            delay: 4000,
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
            <CarouselItem key={game.id} className="pl-0 basis-full">
              <article className="w-full max-w-full">
                <MobileGameCard game={game} onVote={onVote} />
              </article>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      {/* Pagination Dots */}
      {count > 1 && (
        <div className="flex justify-center gap-2 w-full overflow-hidden">
          {Array.from({ length: count }).map((_, index) => (
            <button
              key={index}
              onClick={() => scrollTo(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === current - 1
                  ? "bg-purple-500 scale-125"
                  : "bg-gray-400 hover:bg-gray-300"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// Mobile Game Card Component for Discover Games
interface MobileGameCardProps {
  game: Game
  onVote: (gameId: string) => void
}

function MobileGameCard({ game, onVote }: MobileGameCardProps) {
  return (
    <Link href={`/product/${game.id}`} className="block w-full max-w-full">
      <Card className="overflow-hidden bg-black border-0 rounded-xl aspect-[3/4] relative shadow-lg w-full max-w-full mx-auto">
        {/* Background Image */}
        <div className="absolute inset-0">
          {game.image ? (
            <Image
              src={game.image as string}
              alt={`${game.title} - Mobile Game`}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 100vw"
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

        {/* Vote Button */}
        <button
          className="absolute top-2 right-2 z-20 px-2 py-1 rounded-full bg-black/60 hover:bg-purple-600/90 transition-all duration-200 backdrop-blur-sm border border-white/20"
          onClick={(e) => {
            e.preventDefault()
            onVote(game.id)
          }}
          aria-label={`Vote for ${game.title}`}
        >
          <ArrowUpIcon className="w-3 h-3 text-white" />
        </button>

        {/* Content Overlay */}
        <CardContent className="relative z-10 p-3 h-full flex flex-col justify-end text-white">
          {/* Title */}
          <h3 className="text-lg font-bold leading-tight mb-2 line-clamp-2">
            {game.title}
          </h3>
          
          {/* Description */}
          {game.tagline && (
            <p className="text-xs text-gray-200 leading-relaxed mb-2 line-clamp-2">
              {game.tagline}
            </p>
          )}
          
          {/* Stats */}
          <div className="mb-2 flex items-center gap-2">
            <span className="text-sm font-semibold text-green-400">Free</span>
            <span className="text-gray-400">•</span>
            <span className="text-gray-300 text-xs">{game._count.votes} votes</span>
          </div>
          
          {/* Action Button */}
          <Button 
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:shadow-[0_0_15px_rgba(168,85,247,0.8)] w-full text-sm"
            onClick={(e) => {
              e.preventDefault()
              window.open(game.url, '_blank', 'noopener,noreferrer')
            }}
          >
            <ExternalLinkIcon className="w-3 h-3 mr-1" />
            Play Now
          </Button>
        </CardContent>
      </Card>
    </Link>
  )
}

// Mock data removed - now using database data only

function ProductCard({ product, rank }: { product: any, rank?: number }) {
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
                    {product.platforms?.map((p: string) => p.toUpperCase()).join(', ') || 'No platforms listed'}
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
  const [isNewsletterModalOpen, setIsNewsletterModalOpen] = useState(false)

  // Fetch sidebar data using SWR
  const { data: topRatedData, error: topRatedError } = useSWR('/api/sidebar/top-rated', fetcher)
  const { data: trendingData, error: trendingError } = useSWR('/api/sidebar/trending', fetcher)

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
      <div className="container mx-auto px-4 py-8 max-w-full overflow-hidden">
        {/* CTA Section - Main Hero */}
        <CTASection />

        <div className="grid lg:grid-cols-4 gap-8 mt-16">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8 w-full max-w-full overflow-hidden">
            {/* Featured Games Carousel */}
            {!isLoading && games.length > 0 && (
              <EpicFeaturedGames 
                games={games} 
                onGameClick={(gameId) => {
                  // Navigate to game detail page (handled by Link in component)
                  console.log('Featured game clicked:', gameId)
                }}
              />
            )}

            {/* All Games */}
            <section className="w-full max-w-full overflow-hidden">
              <div className="mb-6">
                <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: '"Epunda Slab", serif', fontWeight: 600 }}>
                  <ShinyText>Discover Games</ShinyText>
                </h2>
                
                {/* Desktop Filter Tabs - Magic Bento Style */}
                <div className="hidden md:block">
                <Tabs value={sortBy} onValueChange={(value) => setSortBy(value as any)} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 bg-gray-900/80 backdrop-blur-sm border border-white/10 rounded-xl p-1 shadow-lg shadow-purple-500/10">
                    <TabsTrigger 
                      value="newest" 
                        className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-violet-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-purple-500/40 data-[state=active]:scale-105 text-gray-300 hover:text-white hover:bg-white/5 transition-all duration-300 rounded-lg font-medium"
                    >
                      Newest
                    </TabsTrigger>
                    <TabsTrigger 
                      value="most-upvoted" 
                        className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-violet-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-purple-500/40 data-[state=active]:scale-105 text-gray-300 hover:text-white hover:bg-white/5 transition-all duration-300 rounded-lg font-medium"
                    >
                      Most Upvoted
                    </TabsTrigger>
                    <TabsTrigger 
                      value="most-viewed" 
                        className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-violet-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-purple-500/40 data-[state=active]:scale-105 text-gray-300 hover:text-white hover:bg-white/5 transition-all duration-300 rounded-lg font-medium"
                    >
                      Most Viewed
                    </TabsTrigger>
                    <TabsTrigger 
                      value="editors-choice" 
                        className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-violet-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-purple-500/40 data-[state=active]:scale-105 text-gray-300 hover:text-white hover:bg-white/5 transition-all duration-300 rounded-lg font-medium"
                    >
                      Editor's Choice
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
                </div>

                {/* Mobile Filter Dropdown */}
                <div className="md:hidden">
                  <MobileFilterDropdown sortBy={sortBy} onSortChange={setSortBy} />
                </div>
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
                  {/* Desktop Games Grid */}
                  <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 w-full max-w-full">
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

                  {/* Mobile Games Carousel */}
                  <div className="md:hidden w-full max-w-full overflow-hidden">
                    <MobileGamesCarousel 
                      games={getDisplayGames()} 
                      onVote={handleVote}
                    />
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
            {/* Top Rated Games */}
            <Card className="rounded-2xl shadow-lg border-white/10">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="flex items-center justify-between">
                  <span>Top Rated Games</span>
                  <Button variant="ghost" size="sm" asChild className="h-auto py-0 px-2 text-xs">
                    <Link href="/products?filter=top-rated">View all</Link>
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                {!topRatedData ? (
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
                ) : topRatedData.games?.length === 0 ? (
                  <div className="text-sm text-muted-foreground">No data yet</div>
                ) : (
                  <div className="space-y-3">
                    {topRatedData.games?.map((game: any) => (
                      <div key={game.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-6 h-6 rounded-lg bg-muted text-muted-foreground flex items-center justify-center text-xs font-semibold">
                            {game.rank}
                          </div>
                          <div className="min-w-0">
                            <Link href={`/product/${game.id}`} className="truncate hover:underline text-sm font-medium block">
                              {game.title}
                            </Link>
                            <div className="text-xs text-muted-foreground">
                              {game.platforms?.map((p: string) => p.toUpperCase()).join(', ') || 'No platforms listed'}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <ArrowUpIcon className="h-3 w-3" />
                          {game.votes}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
            {/* Trending This Week */}
            <Card className="rounded-2xl shadow-lg border-white/10">
              <CardHeader className="p-4">
                <CardTitle className="flex items-center gap-2">
                  <TrendingUpIcon className="h-5 w-5" />
                  Trending This Week
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                {!trendingData ? (
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
                ) : trendingData.games?.length === 0 ? (
                  <div className="text-sm text-muted-foreground">No data yet</div>
                ) : (
                  <div className="space-y-3">
                    {trendingData.games?.map((game: any) => (
                      <div key={game.id} className="flex items-center justify-between">
                        <div className="min-w-0">
                          <Link href={`/product/${game.id}`} className="font-medium text-sm hover:underline block">
                            {game.title}
                          </Link>
                          <div className="text-xs text-muted-foreground">
                            {game.platforms?.map((p: string) => p.toUpperCase()).join(', ') || 'No platforms listed'}
                          </div>
                        </div>
                        <div className="text-xs font-medium text-muted-foreground">
                          {game.votes} votes
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Connect with Us card moved under Stay Updated */}

            {/* Newsletter Signup */}
            <Card className="rounded-2xl shadow-lg border-white/10">
              <CardHeader className="p-4">
                <CardTitle>Level Up Your Inbox</CardTitle>
                <CardDescription>
                  Join our early community and get insider news, trending releases, and hidden gems—straight to your inbox.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <Button 
                  variant="outline" 
                  className="w-full rounded-2xl"
                  onClick={() => setIsNewsletterModalOpen(true)}
                >
                  Subscribe to Newsletter
                </Button>
              </CardContent>
            </Card>

            {/* Connect with Us */}
            <Card className="rounded-2xl shadow-lg border-white/10">
              <CardHeader className="p-4 pb-2">
                <CardTitle>Connect with Us</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                  <a
                    href="https://twitter.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center gap-2 rounded-xl px-3 py-2 border border-white/10 bg-gray-900/40 hover:bg-gray-900/70 transition-colors hover:shadow-[0_0_18px_rgba(168,85,247,0.25)]"
                  >
                    <svg viewBox="0 0 24 24" className="h-4 w-4 text-sky-400 group-hover:text-sky-300" fill="currentColor" aria-hidden="true">
                      <path d="M19.633 7.997c.013.18.013.36.013.54 0 5.51-4.193 11.86-11.86 11.86-2.36 0-4.55-.69-6.392-1.88.33.04.65.053.99.053 1.954 0 3.753-.66 5.183-1.78a4.18 4.18 0 01-3.9-2.9c.26.04.52.066.8.066.38 0 .76-.053 1.12-.146a4.176 4.176 0 01-3.35-4.1v-.053c.56.31 1.21.5 1.9.52a4.17 4.17 0 01-1.86-3.48c0-.77.21-1.47.58-2.08a11.85 11.85 0 008.6 4.37 4.707 4.707 0 01-.1-.96 4.17 4.17 0 017.22-2.85 8.2 8.2 0 002.64-1 4.18 4.18 0 01-1.83 2.3 8.35 8.35 0 002.4-.65 8.94 8.94 0 01-2.09 2.17z"/>
                    </svg>
                    <span className="text-sm">Twitter / X</span>
                  </a>
                  <a
                    href="https://discord.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center gap-2 rounded-xl px-3 py-2 border border-white/10 bg-gray-900/40 hover:bg-gray-900/70 transition-colors hover:shadow-[0_0_18px_rgba(99,102,241,0.25)]"
                  >
                    <svg viewBox="0 0 24 24" className="h-4 w-4 text-indigo-400 group-hover:text-indigo-300" fill="currentColor" aria-hidden="true">
                      <path d="M20.317 4.369A19.79 19.79 0 0016.558 3c-.2.358-.433.84-.59 1.227a18.27 18.27 0 00-4-.002A8.258 8.258 0 0011.377 3c-1.444.242-2.77.66-3.759 1.37C4.14 7.205 3.26 10.01 3.5 12.77c1.54 1.153 3.03 1.857 4.497 2.322.364-.5.69-1.04.97-1.616-.536-.205-1.05-.462-1.536-.765.13-.097.257-.199.382-.304 2.95 1.38 6.15 1.38 9.09 0 .126.105.253.207.383.304-.486.303-1 .56-1.537.765.28.576.607 1.116.97 1.616 1.47-.465 2.96-1.17 4.5-2.322.296-3.377-.72-6.14-2.422-8.401zM9.75 12.5c-.66 0-1.2-.66-1.2-1.475 0-.814.54-1.475 1.2-1.475s1.2.661 1.2 1.475c0 .815-.54 1.475-1.2 1.475zm4.5 0c-.66 0-1.2-.66-1.2-1.475 0-.814.54-1.475 1.2-1.475s1.2.661 1.2 1.475c0 .815-.54 1.475-1.2 1.475z"/>
                    </svg>
                    <span className="text-sm">Discord</span>
                  </a>
                  <a
                    href="https://github.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center gap-2 rounded-xl px-3 py-2 border border-white/10 bg-gray-900/40 hover:bg-gray-900/70 transition-colors hover:shadow-[0_0_18px_rgba(34,197,94,0.25)]"
                  >
                    <svg viewBox="0 0 24 24" className="h-4 w-4 text-emerald-400 group-hover:text-emerald-300" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" clipRule="evenodd" d="M12 .5a11.5 11.5 0 00-3.637 22.414c.575.105.785-.25.785-.556 0-.274-.01-1-.016-1.962-3.194.695-3.87-1.54-3.87-1.54-.523-1.33-1.28-1.684-1.28-1.684-1.046-.715.08-.701.08-.701 1.157.082 1.766 1.188 1.766 1.188 1.028 1.763 2.695 1.253 3.35.958.104-.757.402-1.254.731-1.542-2.551-.29-5.236-1.275-5.236-5.672 0-1.253.45-2.277 1.187-3.08-.119-.291-.514-1.462.112-3.046 0 0 .966-.31 3.166 1.176a10.98 10.98 0 012.883-.388c.978.005 1.963.132 2.883.388 2.2-1.486 3.165-1.176 3.165-1.176.627 1.584.233 2.755.114 3.046.74.803 1.186 1.827 1.186 3.08 0 4.41-2.69 5.378-5.253 5.663.412.354.78 1.05.78 2.117 0 1.528-.014 2.76-.014 3.135 0 .31.207.67.79.555A11.5 11.5 0 0012 .5z"/>
                    </svg>
                    <span className="text-sm">GitHub</span>
                  </a>
                  <a
                    href="https://instagram.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center gap-2 rounded-xl px-3 py-2 border border-white/10 bg-gray-900/40 hover:bg-gray-900/70 transition-colors hover:shadow-[0_0_18px_rgba(236,72,153,0.25)]"
                  >
                    <svg viewBox="0 0 24 24" className="h-4 w-4 text-pink-400 group-hover:text-pink-300" fill="currentColor" aria-hidden="true">
                      <path d="M7 2h10a5 5 0 015 5v10a5 5 0 01-5 5H7a5 5 0 01-5-5V7a5 5 0 015-5zm5 5a5 5 0 100 10 5 5 0 000-10zm6.5.9a1.1 1.1 0 11-2.2 0 1.1 1.1 0 012.2 0z"/>
                    </svg>
                    <span className="text-sm">Instagram</span>
                  </a>
                </div>
              </CardContent>
            </Card>

            {/* Legal */}
            <Card className="rounded-2xl shadow-lg border-white/10">
              <CardHeader className="p-4 pb-3">
                <CardTitle className="text-lg font-semibold">Legal</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="flex flex-col gap-3 sm:flex-row sm:gap-3">
                  <Link href="/terms" className="flex-1 min-w-0">
                    <Button 
                      variant="outline" 
                      className="w-full text-purple-400 hover:text-white border-purple-400/30 hover:border-purple-400 hover:shadow-[0_0_18px_rgba(168,85,247,0.25)] transition-all duration-200 hover:bg-purple-400/10 text-xs px-2 py-2"
                    >
                      <span className="mr-1">📜</span>
                      <span className="truncate">Terms and Conditions</span>
                    </Button>
                  </Link>
                  <Link href="/privacy" className="flex-1 min-w-0">
                    <Button 
                      variant="outline" 
                      className="w-full text-purple-400 hover:text-white border-purple-400/30 hover:border-purple-400 hover:shadow-[0_0_18px_rgba(168,85,247,0.25)] transition-all duration-200 hover:bg-purple-400/10 text-xs px-2 py-2"
                    >
                      <span className="mr-1">🔒</span>
                      <span className="truncate">Privacy Policy</span>
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Newsletter Modal */}
      <NewsletterModal 
        isOpen={isNewsletterModalOpen} 
        onClose={() => setIsNewsletterModalOpen(false)} 
      />
    </div>
  )
}
