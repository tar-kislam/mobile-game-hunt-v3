"use client"

import { useSession } from "next-auth/react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
    title: "My Awesome Game",
    description: "A fantastic puzzle game with unique mechanics",
    image: "https://images.unsplash.com/photo-1556438064-2d7646166914?w=200&h=150&fit=crop",
    votes: 45,
    comments: 12,
    category: "Puzzle",
    status: "Live",
    createdAt: "2024-01-20"
  },
  {
    id: "2", 
    title: "Adventure Quest",
    description: "Epic adventure game with stunning visuals",
    image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=200&h=150&fit=crop",
    votes: 23,
    comments: 8,
    category: "Adventure", 
    status: "Live",
    createdAt: "2024-01-15"
  }
]

const userVotes = [
  {
    id: "1",
    game: {
      title: "Clash of Clans",
      image: "https://images.unsplash.com/photo-1556438064-2d7646166914?w=200&h=150&fit=crop",
      category: "Strategy"
    },
    votedAt: "2024-01-22"
  },
  {
    id: "2",
    game: {
      title: "Pokemon GO", 
      image: "https://images.unsplash.com/photo-1606503153255-59d8b8b91448?w=200&h=150&fit=crop",
      category: "AR"
    },
    votedAt: "2024-01-21"
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

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
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
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Profile Header */}
          <div className="mb-8">
            <Card className="rounded-2xl shadow-lg border-white/10">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-6">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src={session?.user?.image || ""} />
                      <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                        {session?.user?.name?.[0]?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div>
                      <h1 className="text-2xl font-bold">{session?.user?.name}</h1>
                      <p className="text-muted-foreground">{session?.user?.email}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <CalendarIcon className="h-4 w-4" />
                          Joined {userStats.joinDate}
                        </div>
                        {session?.user?.role === "ADMIN" && (
                          <Badge className="rounded-2xl">Admin</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <Button variant="outline" asChild className="rounded-2xl">
                    <Link href="/profile/settings">
                      <SettingsIcon className="h-4 w-4 mr-2" />
                      Settings
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Stats Overview */}
          <div className="grid md:grid-cols-4 gap-4 mb-8">
            <Card className="rounded-2xl shadow-lg border-white/10">
              <CardContent className="p-4 text-center">
                <GamepadIcon className="h-8 w-8 mx-auto mb-2 text-primary" />
                <div className="text-2xl font-bold">{userStats.gamesSubmitted}</div>
                <div className="text-sm text-muted-foreground">Games Submitted</div>
              </CardContent>
            </Card>
            
            <Card className="rounded-2xl shadow-lg border-white/10">
              <CardContent className="p-4 text-center">
                <ArrowUpIcon className="h-8 w-8 mx-auto mb-2 text-green-600 dark:text-green-400" />
                <div className="text-2xl font-bold">{userStats.totalVotes}</div>
                <div className="text-sm text-muted-foreground">Votes Received</div>
              </CardContent>
            </Card>
            
            <Card className="rounded-2xl shadow-lg border-white/10">
              <CardContent className="p-4 text-center">
                <MessageCircleIcon className="h-8 w-8 mx-auto mb-2 text-blue-600 dark:text-blue-400" />
                <div className="text-2xl font-bold">{userStats.commentsReceived}</div>
                <div className="text-sm text-muted-foreground">Comments</div>
              </CardContent>
            </Card>
            
            <Card className="rounded-2xl shadow-lg border-white/10">
              <CardContent className="p-4 text-center">
                <TrophyIcon className="h-8 w-8 mx-auto mb-2 text-yellow-600 dark:text-yellow-400" />
                <div className="text-2xl font-bold">#{Math.floor(Math.random() * 100) + 1}</div>
                <div className="text-sm text-muted-foreground">Ranking</div>
              </CardContent>
            </Card>
          </div>

          {/* Profile Tabs */}
          <Tabs defaultValue="games" className="w-full">
            <TabsList className="grid w-full grid-cols-3 rounded-2xl mb-6">
              <TabsTrigger value="games" className="rounded-2xl">My Games</TabsTrigger>
              <TabsTrigger value="votes" className="rounded-2xl">Voted Games</TabsTrigger>
              <TabsTrigger value="comments" className="rounded-2xl">Comments</TabsTrigger>
            </TabsList>
            
            <TabsContent value="games" className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">My Submitted Games</h2>
                <Button asChild className="rounded-2xl shadow-soft">
                  <Link href="/submit">Submit New Game</Link>
                </Button>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                {userGames.map((game) => (
                  <Card key={game.id} className="rounded-2xl shadow-soft">
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-muted">
                          <img 
                            src={game.image} 
                            alt={game.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <Link href={`/product/${game.id}`} className="hover:underline">
                                <h3 className="font-semibold">{game.title}</h3>
                              </Link>
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {game.description}
                              </p>
                            </div>
                            <Badge 
                              variant={game.status === "Live" ? "default" : "secondary"} 
                              className="rounded-2xl"
                            >
                              {game.status}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center gap-2 mb-3">
                            <Badge variant="secondary" className="rounded-2xl text-xs">
                              {game.category}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {new Date(game.createdAt).toLocaleDateString()}
                            </span>
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
                            <Link 
                              href={`/product/${game.id}`}
                              className="flex items-center gap-1 hover:text-foreground"
                            >
                              <ExternalLinkIcon className="h-3 w-3" />
                              View
                            </Link>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
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
                            src={vote.game.image} 
                            alt={vote.game.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-medium">{vote.game.title}</h3>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="secondary" className="rounded-2xl text-xs">
                                  {vote.game.category}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  Voted on {new Date(vote.votedAt).toLocaleDateString()}
                                </span>
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
          </Tabs>
        </div>
      </div>
    </div>
  )
}
