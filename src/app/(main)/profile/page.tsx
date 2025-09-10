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
  SettingsIcon
} from "lucide-react"
import { Badge as UIBadge } from '@/components/ui/badge'
import { useEffect, useRef, useState } from "react"
import MagicBento from '@/components/ui/magic-bento'

// Mock data - In a real app, this would come from your database
const userStats = {
  gamesSubmitted: 12,
  totalVotes: 245,
  commentsReceived: 89,
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
  const [userBadges, setUserBadges] = useState<string[]>([])
  const [myPosts, setMyPosts] = useState<any[]>([])
  const [loadingPosts, setLoadingPosts] = useState<boolean>(false)
  const [notifications, setNotifications] = useState<any[]>([])
  const [unreadCount, setUnreadCount] = useState<number>(0)
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
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
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
                    <div className="space-y-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                          <Avatar className="h-14 w-14 ring-2 ring-purple-500/40">
                            <AvatarImage src={session?.user?.image || ''} />
                            <AvatarFallback className="bg-purple-600 text-white">
                              {session?.user?.name?.[0]?.toUpperCase() || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="text-lg font-semibold">{session?.user?.name}</div>
                            <div className="text-sm text-muted-foreground">{session?.user?.email}</div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                              <CalendarIcon className="h-3 w-3" /> Joined {userStats.joinDate}
                            </div>
                          </div>
                        </div>
                        <UserIcon className="h-5 w-5 text-purple-300" />
                      </div>

                      {/* Embedded Stats 2x2 inside Profile card */}
                      <div className="grid grid-cols-2 gap-4 mt-4 md:mt-8">
                        <div className="rounded-xl border border-white/10 bg-gray-900/60 p-4 text-center shadow-inner">
                          <GamepadIcon className="h-5 w-5 mx-auto mb-1 text-primary" />
                          <div className="text-xl font-bold">{userStats.gamesSubmitted}</div>
                          <div className="text-xs text-muted-foreground">Games</div>
                        </div>
                        <div className="rounded-xl border border-white/10 bg-gray-900/60 p-4 text-center shadow-inner">
                          <ArrowUpIcon className="h-5 w-5 mx-auto mb-1 text-green-500" />
                          <div className="text-xl font-bold">{userStats.totalVotes}</div>
                          <div className="text-xs text-muted-foreground">Votes</div>
                        </div>
                        <div className="rounded-xl border border-white/10 bg-gray-900/60 p-4 text-center shadow-inner">
                          <MessageCircleIcon className="h-5 w-5 mx-auto mb-1 text-blue-500" />
                          <div className="text-xl font-bold">{userStats.commentsReceived}</div>
                          <div className="text-xs text-muted-foreground">Comments</div>
                        </div>
                        <div className="rounded-xl border border-white/10 bg-gray-900/60 p-4 text-center shadow-inner">
                          <TrophyIcon className="h-5 w-5 mx-auto mb-1 text-yellow-400" />
                          <div className="text-xl font-bold">#{Math.floor(Math.random() * 100) + 1}</div>
                          <div className="text-xs text-muted-foreground">Ranking</div>
                        </div>
                      </div>
                    </div>
                  )
                },
                {
                  id: 'settings',
                  className: 'row-span-1',
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
                  className: 'row-span-1',
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

          {/* Profile Tabs */}
          <Tabs defaultValue="games" className="w-full">
            <TabsList className="grid w-full grid-cols-5 rounded-2xl mb-6">
              <TabsTrigger value="games" className="rounded-2xl">My Games</TabsTrigger>
              <TabsTrigger value="votes" className="rounded-2xl">Voted Games</TabsTrigger>
              <TabsTrigger value="comments" className="rounded-2xl">Comments</TabsTrigger>
              <TabsTrigger value="posts" className="rounded-2xl">My Posts</TabsTrigger>
              <TabsTrigger value="notifications" className="rounded-2xl">Notifications {unreadCount > 0 ? `(${unreadCount})` : ''}</TabsTrigger>
            </TabsList>
            
            <TabsContent value="games" className="space-y-4">
              <h2 className="text-xl font-semibold">My Submitted Games</h2>

              <MagicBento
                className="md:grid-cols-2"
                enableTilt
                enableSpotlight
                enableStars
                enableBorderGlow
                glowColor="132, 0, 255"
                items={userGames.map((game) => ({
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
                            {game.platforms?.map(p => p.toUpperCase()).join(', ') || 'No platforms listed'}
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
            </TabsContent>

            {/* Notifications */}
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
              
              <div className="space-y-4">
                {userVotes.map((vote) => (
                  <Card key={vote.id} className="rounded-2xl shadow-soft">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-muted">
                          <img 
                            src={vote.game.maker.avatar || ""} 
                            alt={vote.game.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium text-sm">{vote.game.title}</div>
                              <div className="text-xs text-muted-foreground">
                                {vote.game.platforms?.map(p => p.toUpperCase()).join(', ') || 'No platforms listed'}
                              </div>
                            </div>
                            <ArrowUpIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="comments" className="space-y-4">
              <h2 className="text-xl font-semibold">My Comments</h2>
              
              <div className="space-y-4">
                {userComments.map((comment) => (
                  <Card key={comment.id} className="rounded-2xl shadow-soft">
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Link 
                            href={`/product/${comment.game.id}`}
                            className="font-medium hover:underline"
                          >
                            {comment.game.title}
                          </Link>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>{new Date(comment.createdAt).toLocaleDateString()}</span>
                            <div className="flex items-center gap-1">
                              <ArrowUpIcon className="h-3 w-3" />
                              {comment.votes}
                            </div>
                          </div>
                        </div>
                        
                        <p className="text-sm text-muted-foreground">
                          {comment.content}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* My Posts */}
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
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
