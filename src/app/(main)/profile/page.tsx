"use client"

import { useSession } from "next-auth/react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from 'sonner'
import { MyGamesSection } from "@/components/games/my-games-section"
import { 
  ArrowUpIcon, 
  MessageCircleIcon, 
  ExternalLinkIcon,
  CalendarIcon,
  GamepadIcon,
  TrophyIcon,
  UserIcon,
  SettingsIcon,
  StarIcon
} from "lucide-react"
import { Badge as UIBadge } from '@/components/ui/badge'
import { useEffect, useRef, useState } from "react"
import useSWR from 'swr'
import MagicBento from '@/components/ui/magic-bento'
import { format } from "date-fns"
import { Progress } from "@/components/ui/progress"
import { BadgesGrid } from "@/components/badges/BadgesGrid"

// Mock defaults, will be overridden by live data
const userStats = {
  gamesSubmitted: 0,
  totalVotes: 0,
  commentsReceived: 0,
  joinDate: "January 2024"
}

const userGames = [
  {
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
  },
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
  }
]

const userVotes = [
  {
    id: "1",
    game: {
      title: "Clash of Clans",
      platforms: ["ios", "android"],
      votes: 152,
      comments: 23,
      url: "https://clashofclans.com",
      maker: {
        name: "Supercell",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face"
      }
    },
    votedAt: "2024-01-15T10:30:00Z"
  },
  {
    id: "2",
    game: {
      title: "Pokemon GO",
      platforms: ["ios", "android"],
      votes: 89,
      comments: 15,
      url: "https://pokemongo.com",
      maker: { name: "Niantic", avatar: "" }
    },
    votedAt: "2024-01-14T15:45:00Z"
  }
]

const userComments = [
  {
    id: "1",
    content: "Amazing game! Really love the graphics and gameplay mechanics.",
    game: {
      title: "Clash of Clans",
      id: "1"
    },
    createdAt: "2024-01-22",
    votes: 5
  },
  {
    id: "2",
    content: "Great concept but could use some performance improvements.",
    game: {
      title: "Pokemon GO",
      id: "2"
    },
    createdAt: "2024-01-21",
    votes: 3
  }
]

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const fetcher = (url: string) => fetch(url).then(r => r.json())
  const { data: statsData } = useSWR(session?.user?.id ? '/api/user/stats' : null, fetcher, {
    refreshInterval: 5000,
    revalidateOnFocus: true,
    revalidateOnReconnect: true
  })
  const { data: gamesData } = useSWR(session?.user?.id ? '/api/user/games' : null, fetcher, {
    refreshInterval: 5000,
    revalidateOnFocus: true,
    revalidateOnReconnect: true
  })
  const { data: votesData } = useSWR(session?.user?.id ? '/api/user/votes' : null, fetcher, {
    refreshInterval: 5000,
    revalidateOnFocus: true,
    revalidateOnReconnect: true
  })
  const { data: commentsData } = useSWR(session?.user?.id ? '/api/user/comments' : null, fetcher, {
    refreshInterval: 5000,
    revalidateOnFocus: true,
    revalidateOnReconnect: true
  })
  const { data: userData } = useSWR(session?.user?.email ? `/api/user?email=${encodeURIComponent(session.user.email)}` : null, fetcher)
  const { data: xpData, mutate: mutateXP } = useSWR(session?.user?.id ? `/api/user/${session.user.id}/xp` : null, fetcher, {
    refreshInterval: 10000, // Refresh every 10 seconds
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
    dedupingInterval: 5000 // Prevent duplicate requests within 5 seconds
  })

  // Listen for XP updates from other components
  useEffect(() => {
    const handleXPUpdate = () => {
      mutateXP()
    }

    window.addEventListener('xp-updated', handleXPUpdate)
    return () => window.removeEventListener('xp-updated', handleXPUpdate)
  }, [mutateXP])

  // Format joined date
  const getJoinedDate = () => {
    if (userData?.createdAt) {
      try {
        return format(new Date(userData.createdAt), "MMMM yyyy")
      } catch (error) {
        console.error('Error formatting date:', error)
        return "Recently"
      }
    }
    return "Recently"
  }

  // Adapt stats for UI
  const liveStats = {
    totalGames: statsData?.totalGames ?? userStats.gamesSubmitted,
    totalVotes: statsData?.totalVotes ?? userStats.totalVotes,
    totalComments: statsData?.totalComments ?? userStats.commentsReceived,
    ranking: statsData?.ranking ?? 0,
  }

  // Adapt games to UI expectations without changing layout
  const liveGames = Array.isArray(gamesData?.games) ? gamesData.games.map((g: any) => ({
    id: g.id,
    title: g.title,
    image: g.thumbnail || g.image || (g.images?.[0] ?? '/placeholder.png'),
    description: g.description || '',
    platforms: g.platforms || [],
    maker: { name: session?.user?.name || 'You' },
    votes: g._count?.votes ?? 0,
    comments: g._count?.comments ?? 0,
  })) : []
  const [userBadges, setUserBadges] = useState<string[]>([])
  const [myPosts, setMyPosts] = useState<any[]>([])
  const [loadingPosts, setLoadingPosts] = useState<boolean>(false)
  const [notifications, setNotifications] = useState<any[]>([])
  const [unreadCount, setUnreadCount] = useState<number>(0)
  const [activeTab, setActiveTab] = useState<string>('games')
  const cardRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/badges')
        if (!res.ok) return
        const data = await res.json()
        // naive: find by session user id if available on window (kept minimal to not refactor auth)
        const uid = (window as any).MGH_USER_ID
        const found = (data.users || []).find((u: any) => u.userId === uid)
        setUserBadges(found?.badges || [])
      } catch {}
    }
    load()
  }, [])

  useEffect(() => {
    const fetchPosts = async () => {
      if (!session?.user?.id) return
      setLoadingPosts(true)
      try {
        const res = await fetch(`/api/community/user/${session.user.id}/posts?limit=20`)
        if (!res.ok) throw new Error('Failed to load posts')
        const data = await res.json()
        setMyPosts(data.posts || [])
      } catch (e) {
        setMyPosts([])
      } finally {
        setLoadingPosts(false)
      }
    }
    fetchPosts()
  }, [session?.user?.id])

  useEffect(() => {
    let timer: any
    const fetchNotifications = async (showToast = false) => {
      if (!session?.user?.id) return
      try {
        const res = await fetch('/api/community/notifications?limit=20&unreadOnly=false', { cache: 'no-store' })
        if (!res.ok) return
        const data = await res.json()
        setNotifications(data.notifications || [])
        setUnreadCount(data.unreadCount || 0)
        if (showToast && data.notifications?.[0]) {
          const n = data.notifications[0]
          toast(`${n.type === 'like' ? 'New like' : 'New comment'}`, {
            description: n.message
          })
        }
      } catch {}
    }
    fetchNotifications()
    timer = setInterval(() => fetchNotifications(true), 15000)
    return () => clearInterval(timer)
  }, [session?.user?.id])

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-[#121225] to-[#050509] bg-[radial-gradient(80%_80%_at_0%_0%,rgba(124,58,237,0.22),transparent_60%),radial-gradient(80%_80%_at_100%_100%,rgba(6,182,212,0.18),transparent_60%)] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-[#121225] to-[#050509] bg-[radial-gradient(80%_80%_at_0%_0%,rgba(124,58,237,0.22),transparent_60%),radial-gradient(80%_80%_at_100%_100%,rgba(6,182,212,0.18),transparent_60%)] flex items-center justify-center">
        <Card className="w-full max-w-md rounded-2xl shadow-lg border-white/10">
          <CardHeader className="p-4 text-center">
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>
              You need to be signed in to view your profile
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-0 space-y-3">
            <Button asChild className="w-full rounded-2xl">
              <Link href="/auth/signin">Sign In</Link>
            </Button>
            <Button variant="outline" asChild className="w-full rounded-2xl">
              <Link href="/">Back to Home</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-[#121225] to-[#050509] bg-[radial-gradient(80%_80%_at_0%_0%,rgba(124,58,237,0.22),transparent_60%),radial-gradient(80%_80%_at_100%_100%,rgba(6,182,212,0.18),transparent_60%)]">
      <div className="container mx-auto px-4 py-8 max-w-full overflow-hidden">
        <div className="max-w-[420px] md:max-w-6xl mx-auto">
          {/* Magic Bento - exact grid behavior */}
          <div className="mb-8">
            <MagicBento
              enableTilt
              enableSpotlight
              enableStars
              enableBorderGlow
              glowColor="132, 0, 255"
              items={[
                {
                  id: 'profile',
                  className: 'col-span-1 md:col-span-2 row-span-2',
                  children: (
                    <div className="space-y-4 md:space-y-6 p-4 md:p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3 md:gap-4 min-w-0 flex-1">
                          <Avatar className="h-12 w-12 md:h-16 md:w-16 ring-2 ring-purple-500/40 shadow-lg flex-shrink-0">
                            <AvatarImage src={session?.user?.image || ''} />
                            <AvatarFallback className="bg-purple-600 text-white">
                              {session?.user?.name?.[0]?.toUpperCase() || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 md:gap-3 flex-wrap">
                            <div className="text-base md:text-lg font-semibold truncate">{session?.user?.name}</div>
                              {/* Level Badge */}
                              <Badge variant="secondary" className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-purple-300 border-purple-500/30 rounded-full px-2 md:px-3 py-1 text-xs flex-shrink-0">
                                <StarIcon className="h-3 w-3 mr-1" />
                                Level {xpData?.level || 1}
                              </Badge>
                            </div>
                            <div className="text-xs md:text-sm text-muted-foreground truncate">{session?.user?.email}</div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                              <CalendarIcon className="h-3 w-3 flex-shrink-0" /> 
                              <span className="truncate">Joined {getJoinedDate()}</span>
                            </div>
                          </div>
                        </div>
                        <UserIcon className="h-4 w-4 md:h-5 md:w-5 text-purple-300 flex-shrink-0 ml-2" />
                      </div>

                      {/* XP Progress Bar */}
                      {xpData && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs md:text-sm">
                            <span className="text-gray-300">Experience Points</span>
                            <span className="text-purple-300 font-medium">
                              {xpData.xp} / {(xpData.level * 100)} XP
                            </span>
                          </div>
                          <Progress 
                            value={xpData.xpProgress} 
                            className="h-2 md:h-3 bg-gray-700 rounded-full overflow-hidden"
                          />
                          <div className="flex items-center justify-between text-xs text-gray-400">
                            <span>Level {xpData.level}</span>
                            <span className="truncate ml-2">{xpData.xpToNextLevel} XP to Level {xpData.level + 1}</span>
                          </div>
                        </div>
                      )}

                      {/* Mobile Stats as Text - Desktop Stats as Cards */}
                      {/* Mobile Text Stats */}
                      <div className="md:hidden mt-4 pt-4 border-t border-white/10">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <GamepadIcon className="h-4 w-4 text-primary flex-shrink-0" />
                            <span className="text-muted-foreground">Games:</span>
                            <span className="font-semibold text-white">{liveStats.totalGames}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <ArrowUpIcon className="h-4 w-4 text-green-500 flex-shrink-0" />
                            <span className="text-muted-foreground">Votes:</span>
                            <span className="font-semibold text-white">{liveStats.totalVotes}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MessageCircleIcon className="h-4 w-4 text-blue-500 flex-shrink-0" />
                            <span className="text-muted-foreground">Comments:</span>
                            <span className="font-semibold text-white">{liveStats.totalComments}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <TrophyIcon className="h-4 w-4 text-yellow-400 flex-shrink-0" />
                            <span className="text-muted-foreground">Ranking:</span>
                            <span className="font-semibold text-white">#{liveStats.ranking || 0}</span>
                          </div>
                        </div>
                      </div>

                      {/* Desktop Card Stats */}
                      <div className="hidden md:grid grid-cols-2 gap-4 mt-8">
                        <div className="rounded-xl border border-white/10 bg-gray-900/60 p-4 text-center shadow-inner">
                          <GamepadIcon className="h-5 w-5 mx-auto mb-1 text-primary" />
                          <div className="text-xl font-bold">{liveStats.totalGames}</div>
                          <div className="text-xs text-muted-foreground">Games</div>
                        </div>
                        <div className="rounded-xl border border-white/10 bg-gray-900/60 p-4 text-center shadow-inner">
                          <ArrowUpIcon className="h-5 w-5 mx-auto mb-1 text-green-500" />
                          <div className="text-xl font-bold">{liveStats.totalVotes}</div>
                          <div className="text-xs text-muted-foreground">Votes</div>
                        </div>
                        <div className="rounded-xl border border-white/10 bg-gray-900/60 p-4 text-center shadow-inner">
                          <MessageCircleIcon className="h-5 w-5 mx-auto mb-1 text-blue-500" />
                          <div className="text-xl font-bold">{liveStats.totalComments}</div>
                          <div className="text-xs text-muted-foreground">Comments</div>
                        </div>
                        <div className="rounded-xl border border-white/10 bg-gray-900/60 p-4 text-center shadow-inner">
                          <TrophyIcon className="h-5 w-5 mx-auto mb-1 text-yellow-400" />
                          <div className="text-xl font-bold">#{liveStats.ranking || 0}</div>
                          <div className="text-xs text-muted-foreground">Ranking</div>
                        </div>
                      </div>
                    </div>
                  )
                },
                {
                  id: 'settings',
                  className: 'row-span-1 hidden md:block',
                  children: (
                    <Link href="/profile/settings" className="block">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-lg font-semibold">Settings</div>
                          <div className="text-sm text-muted-foreground">Manage your account preferences</div>
                        </div>
                        <SettingsIcon className="h-5 w-5 text-emerald-300" />
                      </div>
                    </Link>
                  )
                },
                {
                  id: 'dashboard',
                  className: 'row-span-1 hidden md:block',
                  children: (
                    <Link href="/dashboard" className="block">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-lg font-semibold">Dashboard</div>
                          <div className="text-sm text-muted-foreground">View analytics and performance</div>
                        </div>
                        <TrophyIcon className="h-5 w-5 text-cyan-300" />
                      </div>
                    </Link>
                  )
                },
              ]}
            />
          </div>

          {/* Badges Section */}
          <div className="mb-8">
            <div className="text-center space-y-2 mb-6">
              <h2 className="text-2xl font-bold text-white">Your Badges</h2>
              <p className="text-muted-foreground">Collect achievements and show off your progress</p>
            </div>
            <BadgesGrid />
          </div>

          {/* Profile Tabs */}
          <Tabs defaultValue="games" className="w-full">
            {/* Mobile Navigation - Horizontal Scrollable Tabs */}
            <div className="block md:hidden mb-6">
              <div className="mx-auto max-w-[420px] px-4">
                <nav role="tablist" className="relative">
                  <div className="flex overflow-x-auto scrollbar-hide gap-2 pb-2 snap-x snap-mandatory" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                    <button
                      role="tab"
                      onClick={() => setActiveTab('games')}
                      className={`flex-shrink-0 snap-start px-3 py-2 text-sm font-medium transition-all duration-200 whitespace-nowrap rounded-lg ${
                        activeTab === 'games'
                          ? 'bg-primary text-white shadow-md shadow-primary/50'
                          : 'text-muted-foreground hover:text-primary bg-transparent hover:bg-primary/10'
                      }`}
                      aria-selected={activeTab === 'games'}
                      aria-label="My Games tab"
                    >
                      My Games
                    </button>
                    <button
                      role="tab"
                      onClick={() => setActiveTab('votes')}
                      className={`flex-shrink-0 snap-start px-3 py-2 text-sm font-medium transition-all duration-200 whitespace-nowrap rounded-lg ${
                        activeTab === 'votes'
                          ? 'bg-primary text-white shadow-md shadow-primary/50'
                          : 'text-muted-foreground hover:text-primary bg-transparent hover:bg-primary/10'
                      }`}
                      aria-selected={activeTab === 'votes'}
                      aria-label="Voted Games tab"
                    >
                      Voted Games
                    </button>
                    <button
                      role="tab"
                      onClick={() => setActiveTab('comments')}
                      className={`flex-shrink-0 snap-start px-3 py-2 text-sm font-medium transition-all duration-200 whitespace-nowrap rounded-lg ${
                        activeTab === 'comments'
                          ? 'bg-primary text-white shadow-md shadow-primary/50'
                          : 'text-muted-foreground hover:text-primary bg-transparent hover:bg-primary/10'
                      }`}
                      aria-selected={activeTab === 'comments'}
                      aria-label="Comments tab"
                    >
                      Comments
                    </button>
                    <button
                      role="tab"
                      onClick={() => setActiveTab('posts')}
                      className={`flex-shrink-0 snap-start px-3 py-2 text-sm font-medium transition-all duration-200 whitespace-nowrap rounded-lg ${
                        activeTab === 'posts'
                          ? 'bg-primary text-white shadow-md shadow-primary/50'
                          : 'text-muted-foreground hover:text-primary bg-transparent hover:bg-primary/10'
                      }`}
                      aria-selected={activeTab === 'posts'}
                      aria-label="My Posts tab"
                    >
                      My Posts
                    </button>
                    <button
                      role="tab"
                      onClick={() => setActiveTab('notifications')}
                      className={`flex-shrink-0 snap-start px-3 py-2 text-sm font-medium transition-all duration-200 whitespace-nowrap rounded-lg ${
                        activeTab === 'notifications'
                          ? 'bg-primary text-white shadow-md shadow-primary/50'
                          : 'text-muted-foreground hover:text-primary bg-transparent hover:bg-primary/10'
                      }`}
                      aria-selected={activeTab === 'notifications'}
                      aria-label={`Notifications tab${unreadCount > 0 ? ` - ${unreadCount} unread` : ''}`}
                    >
                      Notifications {unreadCount > 0 ? `(${unreadCount})` : ''}
                    </button>
                  </div>
                </nav>
              </div>
            </div>

            {/* Desktop Navigation */}
            <TabsList className="hidden md:grid w-full grid-cols-5 rounded-2xl mb-6">
              <TabsTrigger value="games" className="rounded-2xl data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:shadow-primary/40 data-[state=active]:scale-105 transition-all duration-200 hover:bg-muted/20">My Games</TabsTrigger>
              <TabsTrigger value="votes" className="rounded-2xl data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:shadow-primary/40 data-[state=active]:scale-105 transition-all duration-200 hover:bg-muted/20">Voted Games</TabsTrigger>
              <TabsTrigger value="comments" className="rounded-2xl data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:shadow-primary/40 data-[state=active]:scale-105 transition-all duration-200 hover:bg-muted/20">Comments</TabsTrigger>
              <TabsTrigger value="posts" className="rounded-2xl data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:shadow-primary/40 data-[state=active]:scale-105 transition-all duration-200 hover:bg-muted/20">My Posts</TabsTrigger>
              <TabsTrigger value="notifications" className="rounded-2xl data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:shadow-primary/40 data-[state=active]:scale-105 transition-all duration-200 hover:bg-muted/20">Notifications {unreadCount > 0 ? `(${unreadCount})` : ''}</TabsTrigger>
            </TabsList>
            
            {/* Mobile Content - Conditional Rendering */}
            <div className="block md:hidden">
              {activeTab === 'games' && (
                <div className="space-y-4">
              <h2 className="text-xl font-semibold">My Submitted Games</h2>

              {liveGames.length === 0 ? (
                <Card className="rounded-2xl shadow-soft">
                  <CardContent className="p-8 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center">
                        <GamepadIcon className="h-8 w-8 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold mb-2">No games submitted yet</h3>
                        <p className="text-muted-foreground mb-4">
                          You haven't submitted any games yet. Submit your first game to get started!
                        </p>
                        <Link href="/submit">
                          <Button className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white">
                            Submit Your First Game
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <MagicBento
                  className="md:grid-cols-2"
                  enableTilt
                  enableSpotlight
                  enableStars
                  enableBorderGlow
                  glowColor="132, 0, 255"
                  items={liveGames.map((game: any) => ({
                    id: game.id,
                    children: (
                      <div className="flex gap-4">
                        <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-muted">
                          <img src={game.image} alt={game.title} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <Link href={`/product/${game.id}`} className="hover:underline">
                                <h3 className="font-semibold text-sm leading-tight">{game.title}</h3>
                              </Link>
                              <p className="text-sm text-muted-foreground line-clamp-2">{game.description}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="secondary" className="rounded-2xl text-xs">
                              {game.platforms?.map((p: string) => p.toUpperCase()).join(', ') || 'No platforms listed'}
                            </Badge>
                            <span className="text-xs text-muted-foreground">by {game.maker.name}</span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <ArrowUpIcon className="h-3 w-3" />
                              {game.votes} votes
                            </div>
                            <div className="flex items-center gap-1">
                              <MessageCircleIcon className="h-3 w-3" />
                              {game.comments} comments
                            </div>
                            <Link href={`/product/${game.id}`} className="flex items-center gap-1 hover:text-foreground">
                              <ExternalLinkIcon className="h-3 w-3" />
                              View
                            </Link>
                          </div>
                        </div>
                      </div>
                    )
                  }))}
                />
              )}
                </div>
              )}

              {activeTab === 'notifications' && (
                <div className="space-y-4">
              <h2 className="text-xl font-semibold">Notifications</h2>
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">Latest activity on your posts</div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    await fetch('/api/community/notifications', {
                      method: 'PATCH',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ markAllAsRead: true })
                    })
                    setUnreadCount(0)
                  }}
                >
                  Mark all as read
                </Button>
              </div>
              <div className="space-y-3">
                {notifications.length === 0 ? (
                  <Card className="rounded-2xl shadow-soft">
                    <CardContent className="p-6 text-center text-muted-foreground">
                      No notifications yet.
                    </CardContent>
                  </Card>
                ) : (
                  notifications.map((n:any) => (
                    <Card key={n.id} className={`rounded-2xl shadow-soft ${n.isRead ? 'opacity-80' : ''}`}>
                      <CardContent className="p-4 flex items-center justify-between">
                        <div>
                          <div className="font-medium text-sm">{n.type === 'like' ? 'Someone liked your post' : 'New comment on your post'}</div>
                          <div className="text-xs text-muted-foreground">{n.message}</div>
                        </div>
                        <div className="text-xs text-muted-foreground">{new Date(n.createdAt).toLocaleString()}</div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
                </div>
              )}
            
              {activeTab === 'votes' && (
                <div className="space-y-4">
              <h2 className="text-xl font-semibold">Games I've Voted For</h2>
              
              {(!votesData || votesData.votes?.length === 0) ? (
                <Card className="rounded-2xl shadow-soft"><CardContent className="p-6 text-center text-muted-foreground">You haven't voted yet.</CardContent></Card>
              ) : (
                <MagicBento
                  className="md:grid-cols-2"
                  enableTilt
                  enableSpotlight
                  enableStars
                  enableBorderGlow
                  glowColor="132, 0, 255"
                  items={votesData.votes.map((vote: any) => ({
                    id: `vote-${vote.gameId}`,
                    className: 'col-span-1',
                    children: (
                      <div className="space-y-4">
                        <div className="flex items-center gap-4">
                          <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-muted">
                            <img src={vote.coverImage} alt={vote.title} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-sm">{vote.title}</div>
                            <div className="text-xs text-muted-foreground">
                              {vote.platforms?.map((p:string) => p.toUpperCase()).join(', ') || 'No platforms listed'}
                            </div>
                          </div>
                          <ArrowUpIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
                        </div>
                      </div>
                    )
                  }))}
                />
              )}
                </div>
              )}
            
              {activeTab === 'comments' && (
                <div className="space-y-4">
              <h2 className="text-xl font-semibold">My Comments</h2>
              
              {(!commentsData || commentsData.comments?.length === 0) ? (
                <Card className="rounded-2xl shadow-soft"><CardContent className="p-6 text-center text-muted-foreground">No comments yet.</CardContent></Card>
              ) : (
                <MagicBento
                  className="md:grid-cols-2"
                  enableTilt
                  enableSpotlight
                  enableStars
                  enableBorderGlow
                  glowColor="132, 0, 255"
                  items={commentsData.comments.map((item: any) => ({
                    id: `comment-${item.gameId}`,
                    className: 'col-span-1',
                    children: (
                      <div className="space-y-4">
                        <div className="flex items-center gap-4">
                          <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-muted">
                            <img src={item.coverImage} alt={item.title} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <div>
                                <Link href={`/product/${item.gameId}`} className="font-medium hover:underline text-sm">{item.title}</Link>
                                <div className="text-xs text-muted-foreground">{item.platforms?.map((p:string) => p.toUpperCase()).join(', ') || 'No platforms listed'}</div>
                              </div>
                              <Badge variant="secondary" className="rounded-2xl text-xs">{item.commentCount} comments</Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  }))}
                />
              )}
                </div>
              )}

              {activeTab === 'posts' && (
                <div className="space-y-4">
              <h2 className="text-xl font-semibold">My Posts</h2>
              {loadingPosts ? (
                <div className="space-y-4">
                  <div className="h-24 w-full rounded-xl bg-white/5 animate-pulse"></div>
                  <div className="h-24 w-full rounded-xl bg-white/5 animate-pulse"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  {myPosts.length === 0 ? (
                    <Card className="rounded-2xl shadow-soft">
                      <CardContent className="p-6 text-center text-muted-foreground">
                        No posts yet.
                      </CardContent>
                    </Card>
                  ) : (
                    myPosts.map((post:any) => (
                      <Card key={post.id} className="rounded-2xl shadow-soft bg-card/60 border-white/10">
                        <CardContent className="p-4 space-y-3">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={session?.user?.image || ''} />
                              <AvatarFallback>{session?.user?.name?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium text-sm">{session?.user?.name || 'You'}</div>
                              <div className="text-xs text-muted-foreground">{new Date(post.createdAt).toLocaleString()}</div>
                            </div>
                          </div>
                          <div className="text-sm whitespace-pre-wrap">
                            {post.content}
                          </div>
                          {Array.isArray(post.images) && post.images.length > 0 && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {post.images.slice(0,4).map((img:string, idx:number) => (
                                <img key={idx} src={img} alt="Post image" className="w-full h-auto rounded-lg border border-white/10" />
                              ))}
                            </div>
                          )}
                          {Array.isArray(post.hashtags) && post.hashtags.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {post.hashtags.map((tag:string) => (
                                <UIBadge key={tag} variant="secondary" className="bg-blue-500/20 text-blue-300 border-blue-500/30">{tag}</UIBadge>
                              ))}
                            </div>
                          )}
                          <div className="flex items-center gap-6 pt-2 border-t border-white/10 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <ArrowUpIcon className="h-3 w-3" />
                              {post._count?.likes ?? 0}
                            </div>
                            <div className="flex items-center gap-1">
                              <MessageCircleIcon className="h-3 w-3" />
                              {post._count?.comments ?? 0}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              )}
                </div>
              )}
            </div>

            {/* Desktop Content - Original TabsContent */}
            <div className="hidden md:block">
              <TabsContent value="games" className="space-y-4">
                <h2 className="text-xl font-semibold">My Submitted Games</h2>

                {liveGames.length === 0 ? (
                  <Card className="rounded-2xl shadow-soft">
                    <CardContent className="p-8 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center">
                          <GamepadIcon className="h-8 w-8 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold mb-2">No games submitted yet</h3>
                          <p className="text-muted-foreground mb-4">
                            You haven't submitted any games yet. Submit your first game to get started!
                          </p>
                          <Link href="/submit">
                            <Button className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white">
                              Submit Your First Game
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <MagicBento
                    className="md:grid-cols-2"
                    enableTilt
                    enableSpotlight
                    enableStars
                    enableBorderGlow
                    glowColor="132, 0, 255"
                    items={liveGames.map((game: any) => ({
                      id: game.id,
                      children: (
                        <div className="flex gap-4">
                          <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-muted">
                            <img src={game.image} alt={game.title} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <Link href={`/product/${game.id}`} className="hover:underline">
                                  <h3 className="font-semibold text-sm leading-tight">{game.title}</h3>
                                </Link>
                                <p className="text-sm text-muted-foreground line-clamp-2">{game.description}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="secondary" className="rounded-2xl text-xs">
                                {game.platforms?.map((p: string) => p.toUpperCase()).join(', ') || 'No platforms listed'}
                              </Badge>
                              <span className="text-xs text-muted-foreground">by {game.maker.name}</span>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <ArrowUpIcon className="h-3 w-3" />
                                {game.votes} votes
                              </div>
                              <div className="flex items-center gap-1">
                                <MessageCircleIcon className="h-3 w-3" />
                                {game.comments} comments
                              </div>
                              <Link href={`/product/${game.id}`} className="flex items-center gap-1 hover:text-foreground">
                                <ExternalLinkIcon className="h-3 w-3" />
                                View
                              </Link>
                            </div>
                          </div>
                        </div>
                      )
                    }))}
                  />
              )}
            </TabsContent>

              <TabsContent value="notifications" className="space-y-4">
                <h2 className="text-xl font-semibold">Notifications</h2>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">Latest activity on your posts</div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      await fetch('/api/community/notifications', {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ markAllAsRead: true })
                      })
                      setUnreadCount(0)
                    }}
                  >
                    Mark all as read
                  </Button>
                </div>
                <div className="space-y-3">
                  {notifications.length === 0 ? (
                    <Card className="rounded-2xl shadow-soft">
                      <CardContent className="p-6 text-center text-muted-foreground">
                        No notifications yet.
                      </CardContent>
                    </Card>
                  ) : (
                    notifications.map((n:any) => (
                      <Card key={n.id} className={`rounded-2xl shadow-soft ${n.isRead ? 'opacity-80' : ''}`}>
                        <CardContent className="p-4 flex items-center justify-between">
                          <div>
                            <div className="font-medium text-sm">{n.type === 'like' ? 'Someone liked your post' : 'New comment on your post'}</div>
                            <div className="text-xs text-muted-foreground">{n.message}</div>
                          </div>
                          <div className="text-xs text-muted-foreground">{new Date(n.createdAt).toLocaleString()}</div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="votes" className="space-y-4">
                <h2 className="text-xl font-semibold">Games I've Voted For</h2>
                
                {(!votesData || votesData.votes?.length === 0) ? (
                  <Card className="rounded-2xl shadow-soft"><CardContent className="p-6 text-center text-muted-foreground">You haven't voted yet.</CardContent></Card>
                ) : (
                  <MagicBento
                    className="md:grid-cols-2"
                    enableTilt
                    enableSpotlight
                    enableStars
                    enableBorderGlow
                    glowColor="132, 0, 255"
                    items={votesData.votes.map((vote: any) => ({
                      id: `vote-${vote.gameId}`,
                      className: 'col-span-1',
                      children: (
                        <div className="space-y-4">
                          <div className="flex items-center gap-4">
                            <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-muted">
                              <img src={vote.coverImage} alt={vote.title} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1">
                              <div className="font-medium text-sm">{vote.title}</div>
                              <div className="text-xs text-muted-foreground">
                                {vote.platforms?.map((p:string) => p.toUpperCase()).join(', ') || 'No platforms listed'}
                              </div>
                            </div>
                            <ArrowUpIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
                          </div>
                        </div>
                      )
                    }))}
                  />
                )}
              </TabsContent>
              
              <TabsContent value="comments" className="space-y-4">
                <h2 className="text-xl font-semibold">My Comments</h2>
                
                {(!commentsData || commentsData.comments?.length === 0) ? (
                  <Card className="rounded-2xl shadow-soft"><CardContent className="p-6 text-center text-muted-foreground">No comments yet.</CardContent></Card>
                ) : (
                  <MagicBento
                    className="md:grid-cols-2"
                    enableTilt
                    enableSpotlight
                    enableStars
                    enableBorderGlow
                    glowColor="132, 0, 255"
                    items={commentsData.comments.map((comment: any) => ({
                      id: `comment-${comment.id}`,
                      className: 'col-span-1',
                      children: (
                        <div className="space-y-4">
                          <div className="flex items-center gap-4">
                            <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-muted">
                              <img src={comment.game?.coverImage} alt={comment.game?.title} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1">
                              <div className="font-medium text-sm">{comment.game?.title}</div>
                              <div className="text-xs text-muted-foreground line-clamp-2">{comment.content}</div>
                            </div>
                            <MessageCircleIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                          </div>
                        </div>
                      )
                    }))}
                  />
                )}
              </TabsContent>

              <TabsContent value="posts" className="space-y-4">
                <h2 className="text-xl font-semibold">My Posts</h2>
                {loadingPosts ? (
                  <div className="space-y-4">
                    <div className="h-24 w-full rounded-xl bg-white/5 animate-pulse"></div>
                    <div className="h-24 w-full rounded-xl bg-white/5 animate-pulse"></div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {myPosts.length === 0 ? (
                      <Card className="rounded-2xl shadow-soft">
                        <CardContent className="p-6 text-center text-muted-foreground">
                          No posts yet.
                        </CardContent>
                      </Card>
                    ) : (
                      myPosts.map((post:any) => (
                        <Card key={post.id} className="rounded-2xl shadow-soft bg-card/60 border-white/10">
                          <CardContent className="p-4 space-y-3">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={session?.user?.image || ''} />
                                <AvatarFallback>{session?.user?.name?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium text-sm">{session?.user?.name || 'You'}</div>
                                <div className="text-xs text-muted-foreground">{new Date(post.createdAt).toLocaleString()}</div>
                              </div>
                            </div>
                            <div className="text-sm whitespace-pre-wrap">
                              {post.content}
                            </div>
                            {Array.isArray(post.images) && post.images.length > 0 && (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {post.images.slice(0,4).map((img:string, idx:number) => (
                                  <img key={idx} src={img} alt="Post image" className="w-full h-auto rounded-lg border border-white/10" />
                                ))}
                              </div>
                            )}
                            {Array.isArray(post.hashtags) && post.hashtags.length > 0 && (
                              <div className="flex flex-wrap gap-2">
                                {post.hashtags.map((tag:string) => (
                                  <UIBadge key={tag} variant="secondary" className="bg-blue-500/20 text-blue-300 border-blue-500/30">{tag}</UIBadge>
                                ))}
                              </div>
                            )}
                            <div className="flex items-center gap-6 pt-2 border-t border-white/10 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <ArrowUpIcon className="h-4 w-4" />
                                {post.likes || 0}
                              </div>
                              <div className="flex items-center gap-1">
                                <MessageCircleIcon className="h-4 w-4" />
                                {post.comments || 0}
                              </div>
                              <div className="flex items-center gap-1">
                                <StarIcon className="h-4 w-4" />
                                {post.shares || 0}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                )}
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
