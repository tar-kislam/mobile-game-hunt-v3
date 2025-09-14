"use client"

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import MagicBento from '@/components/ui/magic-bento'
import { BadgesGrid } from "@/components/badges/BadgesGrid"
import { 
  ArrowUpIcon, 
  MessageCircleIcon, 
  ExternalLinkIcon,
  CalendarIcon,
  GamepadIcon,
  TrophyIcon,
  UserIcon,
  InfoIcon,
  StarIcon
} from "lucide-react"

interface PublicProfileProps {
  params: Promise<{ id: string }>
}

export default function PublicProfilePage({ params }: PublicProfileProps) {
  const [resolvedParams, setResolvedParams] = useState<{ id: string } | null>(null)
  const [profileData, setProfileData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('games')
  const { data: session } = useSession()
  const router = useRouter()

  useEffect(() => {
    const resolveParams = async () => {
      const resolved = await params
      setResolvedParams(resolved)
    }
    resolveParams()
  }, [params])

  useEffect(() => {
    if (!resolvedParams) return

    // Check if user is viewing their own profile
    if (session?.user?.id === resolvedParams.id) {
      router.push('/profile')
      return
    }

    const fetchProfileData = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/user/${resolvedParams.id}/public`)
        
        if (!response.ok) {
          throw new Error('Failed to fetch profile data')
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
  }, [resolvedParams, session?.user?.id, router])

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
        <div className="text-red-400 text-xl">{error || 'Profile not found'}</div>
      </div>
    )
  }

  const { user, stats, badges, games, activity, xp } = profileData

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-[#121225] to-[#050509] bg-[radial-gradient(80%_80%_at_0%_0%,rgba(124,58,237,0.22),transparent_60%),radial-gradient(80%_80%_at_100%_100%,rgba(6,182,212,0.18),transparent_60%)]">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-[420px] md:max-w-6xl mx-auto">
          {/* Profile Card - Direct implementation for better mobile control */}
          <div className="mb-8">
            <Card className="bg-gray-900/40 backdrop-blur border border-white/10 rounded-2xl shadow-lg overflow-hidden">
              <CardContent className="p-6">
                <div className="space-y-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-16 w-16 ring-2 ring-purple-500/40 shadow-lg">
                        <AvatarImage src={user.image || ''} />
                        <AvatarFallback className="bg-purple-600 text-white">
                          {user.name?.[0]?.toUpperCase() || user.email[0]?.toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-3">
                          <div className="text-lg font-semibold">{user.name || 'Anonymous User'}</div>
                          {/* Level Badge */}
                          <Badge variant="secondary" className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-purple-300 border-purple-500/30 rounded-full px-3 py-1">
                            <StarIcon className="h-3 w-3 mr-1" />
                            Level {user.level || 1}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">{user.email}</div>
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
                        {xp.current} / {xp.nextLevelXP} XP
                      </span>
                    </div>
                    <Progress 
                      value={xp.progress} 
                      className="h-3 bg-gray-700 rounded-full overflow-hidden"
                    />
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span>Level {user.level}</span>
                      <span>{xp.xpToNextLevel} XP to Level {user.level + 1}</span>
                    </div>
                  </div>

                  {/* Mobile-only Magic Bento stats grid - inside profile card */}
                  <div className="md:hidden mt-4">
                    <div className="grid grid-cols-2 gap-3">
                      {/* Games Stat */}
                      <div 
                        className="rounded-xl border border-white/10 bg-white/[0.04] backdrop-blur p-3 flex flex-col items-center text-center"
                        aria-label={`${stats.gamesSubmitted} games submitted`}
                      >
                        <div className="p-2 rounded-lg bg-primary/10 mb-2">
                          <GamepadIcon className="h-4 w-4 text-primary" />
                        </div>
                        <div className="text-sm font-semibold leading-none">{stats.gamesSubmitted}</div>
                        <div className="text-xs text-muted-foreground mt-1">Games</div>
                      </div>

                      {/* Votes Stat */}
                      <div 
                        className="rounded-xl border border-white/10 bg-white/[0.04] backdrop-blur p-3 flex flex-col items-center text-center"
                        aria-label={`${stats.votesCast} votes cast`}
                      >
                        <div className="p-2 rounded-lg bg-green-500/10 mb-2">
                          <ArrowUpIcon className="h-4 w-4 text-green-500" />
                        </div>
                        <div className="text-sm font-semibold leading-none">{stats.votesCast}</div>
                        <div className="text-xs text-muted-foreground mt-1">Votes</div>
                      </div>

                      {/* Comments Stat */}
                      <div 
                        className="rounded-xl border border-white/10 bg-white/[0.04] backdrop-blur p-3 flex flex-col items-center text-center"
                        aria-label={`${stats.commentsMade} comments made`}
                      >
                        <div className="p-2 rounded-lg bg-blue-500/10 mb-2">
                          <MessageCircleIcon className="h-4 w-4 text-blue-500" />
                        </div>
                        <div className="text-sm font-semibold leading-none">{stats.commentsMade}</div>
                        <div className="text-xs text-muted-foreground mt-1">Comments</div>
                      </div>

                      {/* Ranking Stat */}
                      <div 
                        className="rounded-xl border border-white/10 bg-white/[0.04] backdrop-blur p-3 flex flex-col items-center text-center"
                        aria-label={`Ranked number ${user.rank || 0}`}
                      >
                        <div className="p-2 rounded-lg bg-yellow-500/10 mb-2">
                          <TrophyIcon className="h-4 w-4 text-yellow-500" />
                        </div>
                        <div className="text-sm font-semibold leading-none">#{user.rank || 0}</div>
                        <div className="text-xs text-muted-foreground mt-1">Ranking</div>
                      </div>
                    </div>
                  </div>

                  {/* Desktop/tablet stats - hidden on mobile */}
                  <div className="hidden md:grid md:grid-cols-2 md:gap-4 mt-8">
                    <div className="flex flex-col items-center justify-center rounded-xl border border-white/10 bg-gray-900/60 p-4 text-center shadow-inner min-h-[80px]">
                      <GamepadIcon className="h-5 w-5 mb-2 text-primary" />
                      <div className="text-xl font-bold leading-tight">{stats.gamesSubmitted}</div>
                      <div className="text-xs text-muted-foreground leading-tight">Games</div>
                    </div>
                    <div className="flex flex-col items-center justify-center rounded-xl border border-white/10 bg-gray-900/60 p-4 text-center shadow-inner min-h-[80px]">
                      <ArrowUpIcon className="h-5 w-5 mb-2 text-green-500" />
                      <div className="text-xl font-bold leading-tight">{stats.votesCast}</div>
                      <div className="text-xs text-muted-foreground leading-tight">Votes</div>
                    </div>
                    <div className="flex flex-col items-center justify-center rounded-xl border border-white/10 bg-gray-900/60 p-4 text-center shadow-inner min-h-[80px]">
                      <MessageCircleIcon className="h-5 w-5 mb-2 text-blue-500" />
                      <div className="text-xl font-bold leading-tight">{stats.commentsMade}</div>
                      <div className="text-xs text-muted-foreground leading-tight">Comments</div>
                    </div>
                    <div className="flex flex-col items-center justify-center rounded-xl border border-white/10 bg-gray-900/60 p-4 text-center shadow-inner min-h-[80px]">
                      <TrophyIcon className="h-5 w-5 mb-2 text-yellow-400" />
                      <div className="text-xl font-bold leading-tight">#{user.rank || 0}</div>
                      <div className="text-xs text-muted-foreground leading-tight">Ranking</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>


          {/* Badges Section - Hidden on mobile to prevent overlap */}
          <div className="hidden md:block mb-8">
            <div className="text-center space-y-2 mb-6">
              <h2 className="text-2xl font-bold text-white">Achievements & Badges</h2>
              <p className="text-muted-foreground">Collect achievements and show off your progress</p>
            </div>
            <BadgesGrid />
          </div>

          {/* Profile Navigation */}
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
                        ? 'bg-primary text-white'
                        : 'text-muted-foreground hover:text-white'
                    }`}
                    aria-selected={activeTab === 'games'}
                    aria-label={`Games tab - ${games.length} games`}
                  >
                    Games ({games.length})
                  </button>
                  <button
                    role="tab"
                    onClick={() => setActiveTab('votes')}
                    className={`flex-shrink-0 snap-start px-3 py-2 text-sm font-medium transition-all duration-200 whitespace-nowrap rounded-lg ${
                      activeTab === 'votes'
                        ? 'bg-primary text-white'
                        : 'text-muted-foreground hover:text-white'
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
                        ? 'bg-primary text-white'
                        : 'text-muted-foreground hover:text-white'
                    }`}
                    aria-selected={activeTab === 'comments'}
                    aria-label="Comments tab"
                  >
                    Comments
                  </button>
                  <button
                    role="tab"
                    onClick={() => setActiveTab('activity')}
                    className={`flex-shrink-0 snap-start px-3 py-2 text-sm font-medium transition-all duration-200 whitespace-nowrap rounded-lg ${
                      activeTab === 'activity'
                        ? 'bg-primary text-white'
                        : 'text-muted-foreground hover:text-white'
                    }`}
                    aria-selected={activeTab === 'activity'}
                    aria-label="Activity tab"
                  >
                    Activity
                  </button>
                </div>
              </nav>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4 rounded-2xl mb-6">
                <TabsTrigger value="games" className="rounded-2xl">Games ({games.length})</TabsTrigger>
                <TabsTrigger value="votes" className="rounded-2xl">Voted Games</TabsTrigger>
                <TabsTrigger value="comments" className="rounded-2xl">Comments</TabsTrigger>
                <TabsTrigger value="activity" className="rounded-2xl">Activity</TabsTrigger>
              </TabsList>
            
              <TabsContent value="games" className="space-y-4">
              <h2 className="text-xl font-semibold">Submitted Games</h2>

              {games.length === 0 ? (
                <Card className="rounded-2xl shadow-soft">
                  <CardContent className="p-8 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center">
                        <GamepadIcon className="h-8 w-8 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold mb-2">No games submitted yet</h3>
                        <p className="text-muted-foreground mb-4">
                          {user.name || 'This user'} hasn't submitted any games yet.
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
                  items={games.map((game: any) => ({
                    id: game.id,
                    children: (
                      <div className="flex gap-4">
                        <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-muted">
                          <img src={game.thumbnail || '/placeholder-game.png'} alt={game.title} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <Link href={`/product/${game.id}`} className="hover:underline">
                                <h3 className="font-semibold text-sm leading-tight">{game.title}</h3>
                              </Link>
                              {game.tagline && (
                                <p className="text-sm text-muted-foreground line-clamp-2">{game.tagline}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="secondary" className="rounded-2xl text-xs">
                              {game.platforms?.map((p: string) => p.toUpperCase()).join(', ') || 'No platforms listed'}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <ArrowUpIcon className="h-3 w-3" />
                              {game._count.votes} votes
                            </div>
                            <div className="flex items-center gap-1">
                              <MessageCircleIcon className="h-3 w-3" />
                              {game._count.comments} comments
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  }))}
                />
              )}
            </TabsContent>

            <TabsContent value="votes" className="space-y-4">
              <h2 className="text-xl font-semibold">Voted Games</h2>

              {activity.votes.length === 0 ? (
                <Card className="rounded-2xl shadow-soft">
                  <CardContent className="p-8 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center">
                        <ArrowUpIcon className="h-8 w-8 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold mb-2">No votes yet</h3>
                        <p className="text-muted-foreground mb-4">
                          {user.name || 'This user'} hasn't voted on any games yet.
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
                  items={activity.votes.map((vote: any) => ({
                    id: vote.id,
                    children: (
                      <div className="flex gap-4">
                        <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-muted">
                          <div className="w-full h-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center">
                            <ArrowUpIcon className="h-6 w-6 text-white" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <Link href={`/product/${vote.product.id}`} className="hover:underline">
                                <h3 className="font-semibold text-sm leading-tight">{vote.product.title}</h3>
                              </Link>
                              <p className="text-xs text-muted-foreground mt-1">
                                Voted on {new Date(vote.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="secondary" className="rounded-2xl text-xs bg-green-500/20 text-green-300 border-green-500/30">
                              ✓ Voted
                            </Badge>
                          </div>
                        </div>
                      </div>
                    )
                  }))}
                />
              )}
            </TabsContent>

            <TabsContent value="comments" className="space-y-4">
              <h2 className="text-xl font-semibold">Comments</h2>

              {activity.comments.length === 0 ? (
                <Card className="rounded-2xl shadow-soft">
                  <CardContent className="p-8 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                        <MessageCircleIcon className="h-8 w-8 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold mb-2">No comments yet</h3>
                        <p className="text-muted-foreground mb-4">
                          {user.name || 'This user'} hasn't commented on any games yet.
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
                  items={activity.comments.map((comment: any) => ({
                    id: comment.id,
                    children: (
                      <div className="flex gap-4">
                        <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-muted">
                          <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                            <MessageCircleIcon className="h-6 w-6 text-white" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <Link href={`/product/${comment.product.id}`} className="hover:underline">
                                <h3 className="font-semibold text-sm leading-tight">{comment.product.title}</h3>
                              </Link>
                              <p className="text-xs text-muted-foreground mt-1">
                                Commented on {new Date(comment.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="mb-2">
                            <p className="text-sm text-gray-300 line-clamp-2">{comment.content}</p>
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="secondary" className="rounded-2xl text-xs bg-blue-500/20 text-blue-300 border-blue-500/30">
                              💬 Commented
                            </Badge>
                          </div>
                        </div>
                      </div>
                    )
                  }))}
                />
              )}
            </TabsContent>

            <TabsContent value="activity" className="space-y-4">
              <h2 className="text-xl font-semibold">Recent Activity</h2>
              <div className="space-y-4">
                {/* Recent Posts */}
                {activity.posts.map((post: any) => (
                  <Card key={post.id} className="rounded-2xl shadow-soft">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        <span>💬</span>
                        <span>Posted recently</span>
                      </div>
                      <p className="text-white text-sm">{post.content}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <span>❤️ {post._count.likes}</span>
                        <span>💬 {post._count.comments}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {/* Recent Votes */}
                {activity.votes.map((vote: any) => (
                  <Card key={vote.id} className="rounded-2xl shadow-soft">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        <span>👍</span>
                        <span>Voted recently</span>
                      </div>
                      <p className="text-white text-sm">
                        Voted on <span className="text-purple-400">{vote.product.title}</span>
                      </p>
                    </CardContent>
                  </Card>
                ))}

                {/* Recent Comments */}
                {activity.comments.map((comment: any) => (
                  <Card key={comment.id} className="rounded-2xl shadow-soft">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        <span>💬</span>
                        <span>Commented recently</span>
                      </div>
                      <p className="text-white text-sm">{comment.content}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        on <span className="text-purple-400">{comment.product.title}</span>
                      </p>
                    </CardContent>
                  </Card>
                ))}

                {activity.posts.length === 0 && activity.votes.length === 0 && activity.comments.length === 0 && (
                  <Card className="rounded-2xl shadow-soft">
                    <CardContent className="p-8 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center">
                          <UserIcon className="h-8 w-8 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold mb-2">No recent activity</h3>
                          <p className="text-muted-foreground mb-4">
                            {user.name || 'This user'} hasn't been active recently.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
            </Tabs>
          </div>

          {/* Mobile Content Sections */}
          <div className="block md:hidden">
            {activeTab === 'games' && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Submitted Games</h2>

                {games.length === 0 ? (
                  <Card className="rounded-2xl shadow-soft">
                    <CardContent className="p-8 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center">
                          <GamepadIcon className="h-8 w-8 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold mb-2">No games submitted yet</h3>
                          <p className="text-muted-foreground mb-4">
                            {user.name || 'This user'} hasn't submitted any games yet.
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
                    items={games.map((game: any) => ({
                      id: game.id,
                      children: (
                        <div className="flex gap-4">
                          <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-muted">
                            <img src={game.thumbnail || '/placeholder-game.png'} alt={game.title} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <Link href={`/product/${game.id}`} className="hover:underline">
                                  <h3 className="font-semibold text-sm leading-tight">{game.title}</h3>
                                </Link>
                                {game.tagline && (
                                  <p className="text-sm text-muted-foreground line-clamp-2">{game.tagline}</p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="secondary" className="rounded-2xl text-xs">
                                {game.platforms?.map((p: string) => p.toUpperCase()).join(', ') || 'No platforms listed'}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <ArrowUpIcon className="h-3 w-3" />
                                {game._count.votes} votes
                              </div>
                              <div className="flex items-center gap-1">
                                <MessageCircleIcon className="h-3 w-3" />
                                {game._count.comments} comments
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

            {activeTab === 'votes' && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Voted Games</h2>

                {activity.votes.length === 0 ? (
                  <Card className="rounded-2xl shadow-soft">
                    <CardContent className="p-8 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center">
                          <ArrowUpIcon className="h-8 w-8 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold mb-2">No votes yet</h3>
                          <p className="text-muted-foreground mb-4">
                            {user.name || 'This user'} hasn't voted on any games yet.
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
                    items={activity.votes.map((vote: any) => ({
                      id: vote.id,
                      children: (
                        <div className="flex gap-4">
                          <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-muted">
                            <div className="w-full h-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center">
                              <ArrowUpIcon className="h-6 w-6 text-white" />
                            </div>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <Link href={`/product/${vote.product.id}`} className="hover:underline">
                                  <h3 className="font-semibold text-sm leading-tight">{vote.product.title}</h3>
                                </Link>
                                <p className="text-xs text-muted-foreground mt-1">
                                  Voted on {new Date(vote.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="secondary" className="rounded-2xl text-xs bg-green-500/20 text-green-300 border-green-500/30">
                                ✓ Voted
                              </Badge>
                            </div>
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
                <h2 className="text-xl font-semibold">Comments</h2>

                {activity.comments.length === 0 ? (
                  <Card className="rounded-2xl shadow-soft">
                    <CardContent className="p-8 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                          <MessageCircleIcon className="h-8 w-8 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold mb-2">No comments yet</h3>
                          <p className="text-muted-foreground mb-4">
                            {user.name || 'This user'} hasn't commented on any games yet.
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
                    items={activity.comments.map((comment: any) => ({
                      id: comment.id,
                      children: (
                        <div className="flex gap-4">
                          <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-muted">
                            <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                              <MessageCircleIcon className="h-6 w-6 text-white" />
                            </div>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <Link href={`/product/${comment.product.id}`} className="hover:underline">
                                  <h3 className="font-semibold text-sm leading-tight">{comment.product.title}</h3>
                                </Link>
                                <p className="text-xs text-muted-foreground mt-1">
                                  Commented on {new Date(comment.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <div className="mb-2">
                              <p className="text-sm text-gray-300 line-clamp-2">{comment.content}</p>
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="secondary" className="rounded-2xl text-xs bg-blue-500/20 text-blue-300 border-blue-500/30">
                                💬 Commented
                              </Badge>
                            </div>
                          </div>
                        </div>
                      )
                    }))}
                  />
                )}
              </div>
            )}

            {activeTab === 'activity' && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Recent Activity</h2>
                <div className="space-y-4">
                  {/* Recent Posts */}
                  {activity.posts.map((post: any) => (
                    <Card key={post.id} className="rounded-2xl shadow-soft">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                          <span>💬</span>
                          <span>Posted recently</span>
                        </div>
                        <p className="text-white text-sm">{post.content}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span>❤️ {post._count.likes}</span>
                          <span>💬 {post._count.comments}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {/* Recent Votes */}
                  {activity.votes.map((vote: any) => (
                    <Card key={vote.id} className="rounded-2xl shadow-soft">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                          <span>👍</span>
                          <span>Voted recently</span>
                        </div>
                        <p className="text-white text-sm">
                          Voted on <span className="text-purple-400">{vote.product.title}</span>
                        </p>
                      </CardContent>
                    </Card>
                  ))}

                  {/* Recent Comments */}
                  {activity.comments.map((comment: any) => (
                    <Card key={comment.id} className="rounded-2xl shadow-soft">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                          <span>💬</span>
                          <span>Commented recently</span>
                        </div>
                        <p className="text-white text-sm">{comment.content}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          on <span className="text-purple-400">{comment.product.title}</span>
                        </p>
                      </CardContent>
                    </Card>
                  ))}

                  {activity.posts.length === 0 && activity.votes.length === 0 && activity.comments.length === 0 && (
                    <Card className="rounded-2xl shadow-soft">
                      <CardContent className="p-8 text-center">
                        <div className="flex flex-col items-center gap-4">
                          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center">
                            <UserIcon className="h-8 w-8 text-white" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold mb-2">No recent activity</h3>
                            <p className="text-muted-foreground mb-4">
                              {user.name || 'This user'} hasn't been active recently.
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}