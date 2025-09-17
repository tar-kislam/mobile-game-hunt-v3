"use client"

import { use, useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FollowButton } from "@/components/ui/follow-button"
import { 
  CalendarIcon,
  StarIcon
} from "lucide-react"
import MagicBento from "@/components/ui/magic-bento"
import { ArrowUpIcon, MessageCircleIcon, ExternalLinkIcon, GamepadIcon, TrophyIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { BadgesGrid } from "@/components/badges/BadgesGrid"
import { Header } from "@/components/layout/header"

interface UsernameProfileProps {
  params: Promise<{ username: string }>
}

export default function UsernameProfilePage({ params }: UsernameProfileProps) {
  const { username } = use(params)
  const [profileData, setProfileData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { data: session } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (!username) return

    if (session?.user?.username === username) {
      router.push('/profile')
      return
    }

    const fetchProfileData = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/user/username/${username}/public`)
        if (!response.ok) {
          setError('Profile not found')
          setLoading(false)
          return
        }
        const data = await response.json()
        setProfileData(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchProfileData()
  }, [username, session?.user?.username, router])

  const getJoinedDate = () => {
    if (!profileData?.user?.createdAt) return 'Unknown'
    const date = new Date(profileData.user.createdAt)
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-[#121225] to-[#050509] bg-[radial-gradient(80%_80%_at_0%_0%,rgba(124,58,237,0.22),transparent_60%),radial-gradient(80%_80%_at_100%_100%,rgba(6,182,212,0.18),transparent_60%)] flex items-center justify-center">
        <div className="text-white text-xl">Loading profile...</div>
      </div>
    )
  }

  if (error || !profileData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-[#121225] to-[#050509] bg-[radial-gradient(80%_80%_at_0%_0%,rgba(124,58,237,0.22),transparent_60%),radial-gradient(80%_80%_at_100%_100%,rgba(6,182,212,0.18),transparent_60%)] flex items-center justify-center">
        <div className="text-red-400 text-xl">{error || 'User not found'}</div>
      </div>
    )
  }

  const { user, stats, xp, games, activity } = profileData

  return (
    <div key={username} className="min-h-screen bg-gradient-to-br from-black via-[#121225] to-[#050509] bg-[radial-gradient(80%_80%_at_0%_0%,rgba(124,58,237,0.22),transparent_60%),radial-gradient(80%_80%_at_100%_100%,rgba(6,182,212,0.18),transparent_60%)]">
      <Header />
      <div className="px-6 py-4">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-white/80 hover:text-white"
        >
          ← Back
        </Button>
      </div>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-[420px] md:max-w-6xl mx-auto">
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
                  className: 'col-span-1 md:col-span-3 row-span-2',
                  children: (
                    <div className="space-y-4 md:space-y-6 p-4 md:p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3 md:gap-4 min-w-0 flex-1">
                          <Avatar className="h-12 w-12 md:h-16 md:w-16 ring-2 ring-purple-500/40 shadow-lg flex-shrink-0">
                            <AvatarImage src={user.image || ''} />
                            <AvatarFallback className="bg-purple-600 text-white">
                              {user.name?.[0]?.toUpperCase() || user.username?.[0]?.toUpperCase() || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 md:gap-3 flex-wrap">
                              <div className="text-base md:text-lg font-semibold truncate">{user.name || 'Anonymous User'}</div>
                              <Badge variant="secondary" className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-purple-300 border-purple-500/30 rounded-full px-2 md:px-3 py-1 text-xs flex-shrink-0">
                                <StarIcon className="h-3 w-3 mr-1" />
                                Level {user.level || 1}
                              </Badge>
                            </div>
                            <div className="text-xs md:text-sm text-muted-foreground truncate">@{user.username}</div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                              <CalendarIcon className="h-3 w-3 flex-shrink-0" /> 
                              <span className="truncate">Joined {getJoinedDate()}</span>
                            </div>
                          </div>
                        </div>
                        <FollowButton username={user.username} className="ml-2" />
                      </div>

                      {/* XP Progress Bar */}
                      {xp && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs md:text-sm">
                            <span className="text-gray-300">Experience Points</span>
                            <span className="text-purple-300 font-medium">
                              {xp.current} / {xp.nextLevelXP} XP
                            </span>
                          </div>
                          <Progress 
                            value={xp.progress} 
                            className="h-2 md:h-3 bg-gray-700 rounded-full overflow-hidden"
                          />
                          <div className="flex items-center justify-between text-xs text-gray-400">
                            <span>Level {user.level || 1}</span>
                            <span className="truncate ml-2">{xp.xpToNextLevel} XP to Level {(user.level || 1) + 1}</span>
                          </div>
                        </div>
                      )}

                      {/* Mobile Stats */}
                      <div className="md:hidden mt-4 pt-4 border-t border-white/10">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <GamepadIcon className="h-4 w-4 text-primary flex-shrink-0" />
                            <span className="text-muted-foreground">Games:</span>
                            <span className="font-semibold text-white">{stats?.gamesSubmitted ?? 0}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <ArrowUpIcon className="h-4 w-4 text-green-500 flex-shrink-0" />
                            <span className="text-muted-foreground">Votes:</span>
                            <span className="font-semibold text-white">{stats?.votesCast ?? 0}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MessageCircleIcon className="h-4 w-4 text-blue-500 flex-shrink-0" />
                            <span className="text-muted-foreground">Comments:</span>
                            <span className="font-semibold text-white">{stats?.commentsMade ?? 0}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <TrophyIcon className="h-4 w-4 text-yellow-400 flex-shrink-0" />
                            <span className="text-muted-foreground">Ranking:</span>
                            <span className="font-semibold text-white">#{user?.rank || 0}</span>
                          </div>
                        </div>
                      </div>

                      {/* Desktop Stats */}
                      <div className="hidden md:grid grid-cols-2 gap-4 mt-8">
                        <div className="rounded-xl border border-white/10 bg-gray-900/60 p-4 text-center shadow-inner">
                          <GamepadIcon className="h-5 w-5 mx-auto mb-1 text-primary" />
                          <div className="text-xl font-bold">{stats?.gamesSubmitted ?? 0}</div>
                          <div className="text-xs text-muted-foreground">Games</div>
                        </div>
                        <div className="rounded-xl border border-white/10 bg-gray-900/60 p-4 text-center shadow-inner">
                          <ArrowUpIcon className="h-5 w-5 mx-auto mb-1 text-green-500" />
                          <div className="text-xl font-bold">{stats?.votesCast ?? 0}</div>
                          <div className="text-xs text-muted-foreground">Votes</div>
                        </div>
                        <div className="rounded-xl border border-white/10 bg-gray-900/60 p-4 text-center shadow-inner">
                          <MessageCircleIcon className="h-5 w-5 mx-auto mb-1 text-blue-500" />
                          <div className="text-xl font-bold">{stats?.commentsMade ?? 0}</div>
                          <div className="text-xs text-muted-foreground">Comments</div>
                        </div>
                        <div className="rounded-xl border border-white/10 bg-gray-900/60 p-4 text-center shadow-inner">
                          <TrophyIcon className="h-5 w-5 mx-auto mb-1 text-yellow-400" />
                          <div className="text-xl font-bold">#{user?.rank || 0}</div>
                          <div className="text-xs text-muted-foreground">Ranking</div>
                        </div>
                      </div>
                    </div>
                  )
                },
              ]}
            />
          </div>

          {/* Badges Section (same placement as /profile) */}
          <div className="mb-8">
            <div className="text-center space-y-2 mb-6">
              <h2 className="text-2xl font-bold text-white">Badges</h2>
              <p className="text-muted-foreground">Achievements and progress</p>
            </div>
            <BadgesGrid />
          </div>

          {/* Tabs: Games | Activity | Badges */}
          <Tabs defaultValue="games" className="w-full">
            <TabsList className="hidden md:grid w-full grid-cols-2 rounded-2xl mb-6">
              <TabsTrigger value="games" className="rounded-2xl data-[state=active]:bg-primary data-[state=active]:text-white">Games</TabsTrigger>
              <TabsTrigger value="activity" className="rounded-2xl data-[state=active]:bg-primary data-[state=active]:text-white">Activity</TabsTrigger>
            </TabsList>
            <TabsList className="grid md:hidden w-full grid-cols-2 rounded-2xl mb-6">
              <TabsTrigger value="games">Games</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
            </TabsList>

            {/* Games */}
            <TabsContent value="games" className="space-y-4">
              {(!Array.isArray(games) || games.length === 0) ? (
                <Card className="rounded-2xl shadow-soft">
                  <CardContent className="p-8 text-center text-muted-foreground">No games yet.</CardContent>
                </Card>
              ) : (
                <MagicBento
                  className="md:grid-cols-2"
                  enableTilt
                  enableSpotlight
                  enableStars
                  enableBorderGlow
                  glowColor="132, 0, 255"
                  items={games.map((g: any) => ({
                    id: g.id,
                    children: (
                      <div className="flex gap-4">
                        <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-muted">
                          <img src={g.thumbnail || g.image || '/placeholder.png'} alt={g.title} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <Link href={`/product/${g.id}`} className="hover:underline">
                                <h3 className="font-semibold text-sm leading-tight">{g.title}</h3>
                              </Link>
                              <p className="text-sm text-muted-foreground line-clamp-2">{g.tagline || ''}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <ArrowUpIcon className="h-3 w-3" />
                              {g._count?.votes ?? 0} votes
                            </div>
                            <div className="flex items-center gap-1">
                              <MessageCircleIcon className="h-3 w-3" />
                              {g._count?.comments ?? 0} comments
                            </div>
                            <Link href={`/product/${g.id}`} className="flex items-center gap-1 hover:text-foreground">
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

            {/* Activity */}
            <TabsContent value="activity" className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">Recent Votes</h3>
                {(!activity?.votes || activity.votes.length === 0) ? (
                  <Card className="rounded-2xl shadow-soft"><CardContent className="p-6 text-center text-muted-foreground">No votes yet.</CardContent></Card>
                ) : (
                  <div className="space-y-3">
                    {activity.votes.map((v: any) => (
                      <div key={v.id} className="flex items-center gap-3">
                        <ArrowUpIcon className="h-4 w-4 text-green-500" />
                        <Link href={`/product/${v.product.id}`} className="hover:underline text-sm">{v.product.title}</Link>
                        <span className="text-xs text-muted-foreground">{new Date(v.createdAt).toLocaleDateString()}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-3">Recent Comments</h3>
                {(!activity?.comments || activity.comments.length === 0) ? (
                  <Card className="rounded-2xl shadow-soft"><CardContent className="p-6 text-center text-muted-foreground">No comments yet.</CardContent></Card>
                ) : (
                  <div className="space-y-3">
                    {activity.comments.map((c: any) => (
                      <div key={c.id} className="space-y-1">
                        <div className="flex items-center gap-2">
                          <MessageCircleIcon className="h-4 w-4 text-blue-500" />
                          <Link href={`/product/${c.product.id}`} className="hover:underline text-sm">{c.product.title}</Link>
                          <span className="text-xs text-muted-foreground">{new Date(c.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="text-sm text-muted-foreground ml-6">{c.content}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            
          </Tabs>
        </div>
      </div>
    </div>
  )
}


