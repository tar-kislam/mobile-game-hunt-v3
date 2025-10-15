"use client"

import { useSession } from "next-auth/react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { 
  ArrowUpIcon, 
  MessageCircleIcon, 
  ExternalLinkIcon,
  CalendarIcon,
  GamepadIcon,
  TrophyIcon,
  UserIcon,
  StarIcon
} from "lucide-react"
import { Badge as UIBadge } from '@/components/ui/badge'
import { useEffect, useState } from "react"
import useSWR from 'swr'
import MagicBento from '@/components/ui/magic-bento'
import { format } from "date-fns"
import { BadgeCard } from "@/components/badges/BadgeCard"

interface ProfilePageProps {
  params: Promise<{ id: string }>
}

export default function ProfilePage({ params }: ProfilePageProps) {
  const [resolvedParams, setResolvedParams] = useState<{ id: string } | null>(null)
  const { data: session, status } = useSession()
  
  useEffect(() => {
    params.then(setResolvedParams)
  }, [params])

  const fetcher = (url: string) => fetch(url).then(r => r.json())
  
  // Fetch user data
  const { data: userData, error: userError } = useSWR(
    resolvedParams?.id ? `/api/user/${resolvedParams.id}` : null, 
    fetcher
  )
  
  // Fetch user stats
  const { data: statsData } = useSWR(
    resolvedParams?.id ? `/api/user/${resolvedParams.id}/stats` : null, 
    fetcher
  )
  
  // Fetch user games
  const { data: gamesData } = useSWR(
    resolvedParams?.id ? `/api/user/${resolvedParams.id}/games` : null, 
    fetcher
  )
  
  // Fetch user votes
  const { data: votesData } = useSWR(
    resolvedParams?.id ? `/api/user/${resolvedParams.id}/votes` : null, 
    fetcher
  )
  
  // Fetch user comments
  const { data: commentsData } = useSWR(
    resolvedParams?.id ? `/api/user/${resolvedParams.id}/comments` : null, 
    fetcher
  )

  // Fetch XP info
  const { data: xpData } = useSWR(
    resolvedParams?.id ? `/api/user/${resolvedParams.id}/xp` : null, 
    fetcher
  )

  // Fetch badge progress data
  const { data: badgesData } = useSWR(
    resolvedParams?.id ? `/api/user/${resolvedParams.id}/badges` : null, 
    fetcher
  )

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
    totalGames: statsData?.totalGames ?? 0,
    totalVotes: statsData?.totalVotes ?? 0,
    totalComments: statsData?.totalComments ?? 0,
    ranking: statsData?.ranking ?? 0,
  }

  // Adapt games to UI expectations
  const liveGames = Array.isArray(gamesData?.games) ? gamesData.games.map((g: any) => ({
    id: g.id,
    title: g.title,
    image: g.thumbnail || g.image || (g.images?.[0] ?? '/placeholder.png'),
    description: g.description || '',
    platforms: g.platforms || [],
    maker: { name: userData?.name || 'User' },
    votes: g._count?.votes ?? 0,
    comments: g._count?.comments ?? 0,
  })) : []

  if (status === "loading" || !resolvedParams) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-[#121225] to-[#050509] bg-[radial-gradient(80%_80%_at_0%_0%,rgba(124,58,237,0.22),transparent_60%),radial-gradient(80%_80%_at_100%_100%,rgba(6,182,212,0.18),transparent_60%)] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (userError || !userData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-[#121225] to-[#050509] bg-[radial-gradient(80%_80%_at_0%_0%,rgba(124,58,237,0.22),transparent_60%),radial-gradient(80%_80%_at_100%_100%,rgba(6,182,212,0.18),transparent_60%)] flex items-center justify-center">
        <Card className="w-full max-w-md rounded-2xl shadow-lg border-white/10">
          <CardHeader className="p-4 text-center">
            <CardTitle>User Not Found</CardTitle>
            <CardDescription>
              The user you're looking for doesn't exist or has been removed.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-0 space-y-3">
            <Button asChild className="w-full rounded-2xl">
              <Link href="/">Back to Home</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Calculate XP progress
  const currentLevel = xpData?.level || 1
  const currentXP = xpData?.xp || 0
  const nextLevelXP = currentLevel * 100
  const currentLevelXP = (currentLevel - 1) * 100
  const xpProgress = ((currentXP - currentLevelXP) / 100) * 100
  const xpToNextLevel = nextLevelXP - currentXP
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-[#121225] to-[#050509] bg-[radial-gradient(80%_80%_at_0%_0%,rgba(124,58,237,0.22),transparent_60%),radial-gradient(80%_80%_at_100%_100%,rgba(6,182,212,0.18),transparent_60%)]">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Magic Bento - Profile Header */}
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
                          <Avatar className="h-16 w-16 ring-2 ring-purple-500/40 shadow-lg">
                            <AvatarImage src={userData.image || ''} />
                            <AvatarFallback className="bg-purple-600 text-white">
                              {userData.name?.[0]?.toUpperCase() || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-3">
                              <div className="text-lg font-semibold">{userData.name}</div>
                              {/* Level Badge */}
                              <Badge variant="secondary" className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-purple-300 border-purple-500/30 rounded-full px-3 py-1">
                                <StarIcon className="h-3 w-3 mr-1" />
                                Level {currentLevel}
                              </Badge>
                            </div>
                            <div className="text-sm text-muted-foreground">{userData.email}</div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                              <CalendarIcon className="h-3 w-3" /> Joined {getJoinedDate()}
                            </div>
                          </div>
                        </div>
                        <UserIcon className="h-5 w-5 text-purple-300" />
                      </div>

                      {/* XP Progress Bar */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-300">Experience Points</span>
                          <span className="text-purple-300 font-medium">
                            {currentXP} / {nextLevelXP} XP
                          </span>
                        </div>
                        <Progress 
                          value={xpProgress} 
                          className="h-3 bg-gray-700 rounded-full overflow-hidden"
                        />
                        <div className="flex items-center justify-between text-xs text-gray-400">
                          <span>Level {currentLevel}</span>
                          <span>{xpToNextLevel} XP to Level {currentLevel + 1}</span>
                        </div>
                      </div>

                      {/* Embedded Stats 2x2 inside Profile card */}
                      <div className="grid grid-cols-2 gap-4 mt-4 md:mt-8">
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
                  id: 'back',
                  className: 'row-span-1',
                  children: (
                    <Link href="/" className="block">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-lg font-semibold">Back to Home</div>
                          <div className="text-sm text-muted-foreground">Return to the main page</div>
                        </div>
                        <ArrowUpIcon className="h-5 w-5 text-emerald-300 rotate-180" />
                      </div>
                    </Link>
                  )
                },
                {
                  id: 'leaderboard',
                  className: 'row-span-1',
                  children: (
                    <Link href="/leaderboard" className="block">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-lg font-semibold">Leaderboard</div>
                          <div className="text-sm text-muted-foreground">View top players</div>
                        </div>
                        <TrophyIcon className="h-5 w-5 text-cyan-300" />
                      </div>
                    </Link>
                  )
                },
              ]}
            />
          </div>

          {/* Magic Bento - Badges & Progress */}
          <div className="mb-8">
            <MagicBento
              enableTilt
              enableSpotlight
              enableStars
              enableBorderGlow
              glowColor="132, 0, 255"
              items={[
                {
                  id: 'badges-header',
                  className: 'col-span-full',
                  children: (
                    <div className="text-center space-y-2">
                      <h2 className="text-2xl font-bold text-white">Your Badges</h2>
                      <p className="text-muted-foreground">Collect achievements and show off your progress</p>
                    </div>
                  )
                },
                ...(badgesData || []).map((badge: any) => ({
                  id: `badge-${badge.type}`,
                  className: 'col-span-1',
                  children: (
                    <BadgeCard
                      title={badge.title}
                      emoji={badge.emoji}
                      description={badge.description}
                      progress={badge.progress}
                      xp={badge.xp}
                      locked={badge.locked}
                      claimable={badge.claimable}
                      badgeCode={badge.code}
                    />
                  )
                }))
              ]}
            />
          </div>

          {/* Profile Tabs */}
          <Tabs defaultValue="games" className="w-full">
            <TabsList className="grid w-full grid-cols-4 rounded-2xl mb-6">
              <TabsTrigger value="games" className="rounded-2xl">Games</TabsTrigger>
              <TabsTrigger value="votes" className="rounded-2xl">Voted Games</TabsTrigger>
              <TabsTrigger value="comments" className="rounded-2xl">Comments</TabsTrigger>
              <TabsTrigger value="stats" className="rounded-2xl">Statistics</TabsTrigger>
            </TabsList>
            
            <TabsContent value="games" className="space-y-4">
              <h2 className="text-xl font-semibold">{userData.name}'s Submitted Games</h2>

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
                          {userData.name} hasn't submitted any games yet.
                        </p>
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
                              <Link href={`/product/${game.slug || game.id}`} className="hover:underline">
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
                            <Link href={`/product/${game.slug || game.id}`} className="flex items-center gap-1 hover:text-foreground">
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
            
            <TabsContent value="votes" className="space-y-4">
              <h2 className="text-xl font-semibold">Games {userData.name} Voted For</h2>
              
              {(!votesData || votesData.votes?.length === 0) ? (
                <Card className="rounded-2xl shadow-soft"><CardContent className="p-6 text-center text-muted-foreground">No votes yet.</CardContent></Card>
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
              <h2 className="text-xl font-semibold">{userData.name}'s Comments</h2>
              
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
            </TabsContent>

            <TabsContent value="stats" className="space-y-4">
              <h2 className="text-xl font-semibold">Statistics</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="rounded-2xl shadow-soft">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <StarIcon className="h-5 w-5 text-purple-400" />
                      Level & XP
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-purple-300">Level {currentLevel}</div>
                      <div className="text-sm text-muted-foreground">{currentXP} Total XP</div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Progress to Level {currentLevel + 1}</span>
                        <span>{xpToNextLevel} XP needed</span>
                      </div>
                      <Progress 
                        value={xpProgress} 
                        className="h-2 bg-gray-700 rounded-full"
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card className="rounded-2xl shadow-soft">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrophyIcon className="h-5 w-5 text-yellow-400" />
                      Activity Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">{liveStats.totalGames}</div>
                        <div className="text-xs text-muted-foreground">Games Submitted</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-500">{liveStats.totalVotes}</div>
                        <div className="text-xs text-muted-foreground">Votes Cast</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-500">{liveStats.totalComments}</div>
                        <div className="text-xs text-muted-foreground">Comments Made</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-yellow-400">#{liveStats.ranking}</div>
                        <div className="text-xs text-muted-foreground">Global Ranking</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
