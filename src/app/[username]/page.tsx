"use client"

import { use, useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { notFound } from 'next/navigation'
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FollowButton } from "@/components/ui/follow-button"
import { 
  CalendarIcon,
  StarIcon,
  UsersIcon,
  UserPlusIcon,
  HomeIcon,
  TrophyIcon,
  ArrowUpIcon,
  MessageCircleIcon,
  ExternalLinkIcon,
  GamepadIcon
} from "lucide-react"
import MagicBento from "@/components/ui/magic-bento"
import { Button } from "@/components/ui/button"
import { BadgesGrid } from "@/components/badges/BadgesGrid"
import { Header } from "@/components/layout/header"
import { UserRecommendations } from "@/components/social/UserRecommendations"

interface UsernameProfileProps {
  params: Promise<{ username: string }>
}

export default function UsernameProfilePage({ params }: UsernameProfileProps) {
  const { username } = use(params)
  const [profileData, setProfileData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [followCounts, setFollowCounts] = useState<{followersCount: number, followingCount: number} | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [userNotFound, setUserNotFound] = useState(false)
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
          if (response.status === 404) {
            setUserNotFound(true)
            return
          }
          setError('Profile not found')
          setLoading(false)
          return
        }
        const data = await response.json()
        setProfileData(data)
        
        // Fetch follow counts
        const followResponse = await fetch(`/api/follow-counts/${data.user.id}`)
        if (followResponse.ok) {
          const followData = await followResponse.json()
          setFollowCounts({
            followersCount: followData.followersCount,
            followingCount: followData.followingCount
          })
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchProfileData()
  }, [username, session?.user?.username, router])

  const handleFollowChange = (newFollowersCount: number) => {
    setFollowCounts(prev => prev ? {
      ...prev,
      followersCount: newFollowersCount
    } : {
      followersCount: newFollowersCount,
      followingCount: 0
    })
  }

  const getJoinedDate = () => {
    if (!profileData?.user?.createdAt) return 'Unknown'
    const date = new Date(profileData.user.createdAt)
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  }

  // If user not found, show custom 404 page
  if (userNotFound) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-[#121225] to-[#050509] bg-[radial-gradient(80%_80%_at_0%_0%,rgba(124,58,237,0.22),transparent_60%),radial-gradient(80%_80%_at_100%_100%,rgba(6,182,212,0.18),transparent_60%)] flex items-center justify-center px-4">
        {/* Particles Background */}
        <div className="fixed inset-0 z-0 opacity-30">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(139,92,246,0.1),transparent_50%),radial-gradient(circle_at_75%_75%,rgba(56,189,248,0.1),transparent_50%)]"></div>
        </div>

        <div className="relative z-10 max-w-2xl mx-auto text-center">
          {/* Animated 404 */}
          <div className="mb-8">
            <div className="text-8xl md:text-9xl font-bold mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-purple-600 bg-clip-text text-transparent">
              404
            </div>
            <div className="text-2xl md:text-3xl font-semibold text-gray-300 mb-2">
              User Not Found
            </div>
            <div className="text-lg text-gray-400 max-w-lg mx-auto leading-relaxed">
              Oops! This user profile doesn't exist in our game world. 
              Don't worry, let's get you back on track.
            </div>
          </div>

          {/* Error illustration */}
          <div className="mb-12">
            <div className="text-8xl mb-4">👤</div>
            <p className="text-gray-400 text-sm">
              Even the best players need to exist first... this profile is just missing!
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button asChild size="lg" className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white rounded-2xl shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all duration-300 hover:scale-105 px-8 py-3">
              <Link href="/">
                <HomeIcon className="w-5 h-5 mr-2" />
                Go Home
              </Link>
            </Button>
            
            <Button asChild variant="outline" size="lg" className="border-purple-500/50 text-purple-300 hover:bg-purple-500/10 hover:text-white rounded-2xl shadow-lg hover:shadow-purple-500/25 transition-all duration-300 hover:scale-105 px-8 py-3">
              <Link href="/leaderboard">
                <TrophyIcon className="w-5 h-5 mr-2" />
                View Leaderboard
              </Link>
            </Button>
          </div>

          {/* Additional help */}
          <div className="mt-12 pt-8 border-t border-gray-700/50">
            <p className="text-sm text-gray-500 mb-4">
              Looking for something specific?
            </p>
            <div className="flex flex-wrap justify-center gap-3 text-sm">
              <Link href="/products" className="text-purple-400 hover:text-purple-300 transition-colors underline">
                Browse Games
              </Link>
              <span className="text-gray-600">•</span>
              <Link href="/community" className="text-purple-400 hover:text-purple-300 transition-colors underline">
                Community
              </Link>
              <span className="text-gray-600">•</span>
              <Link href="/submit" className="text-purple-400 hover:text-purple-300 transition-colors underline">
                Submit Game
              </Link>
              <span className="text-gray-600">•</span>
              <Link href="/about" className="text-purple-400 hover:text-purple-300 transition-colors underline">
                About Us
              </Link>
            </div>
          </div>

          {/* Decorative elements */}
          <div className="absolute top-10 right-10 w-20 h-20 bg-purple-500/10 rounded-full blur-xl"></div>
          <div className="absolute bottom-10 left-10 w-16 h-16 bg-blue-500/10 rounded-full blur-xl"></div>
        </div>
      </div>
    )
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
                                Level {xp.level || 1}
                              </Badge>
                            </div>
                            <div className="text-xs md:text-sm text-muted-foreground truncate">@{user.username}</div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                              <CalendarIcon className="h-3 w-3 flex-shrink-0" /> 
                              <span className="truncate">Joined {getJoinedDate()}</span>
                            </div>
                          </div>
                        </div>
                        <FollowButton 
                          username={user.username} 
                          className="ml-2" 
                          userDisplayName={user.name || user.username}
                          onFollowChange={handleFollowChange}
                        />
                      </div>

                      {/* XP Progress Bar */}
                      {xp && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs md:text-sm">
                            <span className="text-gray-300">Experience Points</span>
                            <span className="text-purple-300 font-medium">
                              {xp.currentXP} / {xp.requiredXP} XP
                            </span>
                          </div>
                          <Progress 
                            value={xp.progress} 
                            className="h-2 md:h-3 bg-gray-700 rounded-full overflow-hidden"
                          />
                          <div className="flex items-center justify-between text-xs text-gray-400">
                            <span>Level {xp.level || 1}</span>
                            <span className="truncate ml-2">{xp.remainingXP} XP to Level {(xp.level || 1) + 1}</span>
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
                          <div className="flex items-center gap-2">
                            <UsersIcon className="h-4 w-4 text-purple-500 flex-shrink-0" />
                            <span className="text-muted-foreground">Followers:</span>
                            <span className="font-semibold text-white">{followCounts?.followersCount ?? 0}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <UserPlusIcon className="h-4 w-4 text-cyan-500 flex-shrink-0" />
                            <span className="text-muted-foreground">Following:</span>
                            <span className="font-semibold text-white">{followCounts?.followingCount ?? 0}</span>
                          </div>
                        </div>
                      </div>

                      {/* Desktop Stats */}
                      <div className="hidden md:grid grid-cols-3 gap-4 mt-8">
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
                        <div className="rounded-xl border border-white/10 bg-gray-900/60 p-4 text-center shadow-inner">
                          <UsersIcon className="h-5 w-5 mx-auto mb-1 text-purple-500" />
                          <div className="text-xl font-bold">{followCounts?.followersCount ?? 0}</div>
                          <div className="text-xs text-muted-foreground">Followers</div>
                        </div>
                        <div className="rounded-xl border border-white/10 bg-gray-900/60 p-4 text-center shadow-inner">
                          <UserPlusIcon className="h-5 w-5 mx-auto mb-1 text-cyan-500" />
                          <div className="text-xl font-bold">{followCounts?.followingCount ?? 0}</div>
                          <div className="text-xs text-muted-foreground">Following</div>
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
            <BadgesGrid userId={profileData?.id} />
          </div>

          {/* User Recommendations */}
          <div className="mb-8">
            <UserRecommendations userId={user.id} />
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