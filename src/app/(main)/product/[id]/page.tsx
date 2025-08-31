import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  ArrowUpIcon, 
  MessageCircleIcon, 
  ExternalLinkIcon, 
  ShareIcon,
  CalendarIcon,
  UserIcon,
  TagIcon
} from "lucide-react"

// Mock data - In a real app, this would come from your database based on the ID
const product = {
  id: "1",
  title: "Clash of Clans",
  description: "Build your village, train your troops, and battle with millions of other players online! Forge a powerful Clan with other players and crush enemy clans in clan wars.",
  longDescription: `Clash of Clans is an addictive mixture of strategic planning and competitive fast-paced combat. Raise an army of Barbarians, War Wizards, Dragons and other mighty fighters. Join a clan of players and rise through the ranks, or create your own clan to contest ownership of the realm.

Key Features:
• Build your village into an unbeatable fortress
• Raise your own army of Barbarians, Archers, Hog Riders, Wizards, Dragons and other mighty fighters
• Battle with players worldwide and take their Trophies
• Join together with other players to form the ultimate Clan
• Fight against rival Clans in epic Clan Wars
• Build 18 unique units with multiple levels of upgrades
• Discover your favorite attacking army from countless combinations of troops, spells, Heroes and Clan reinforcements`,
  image: "https://images.unsplash.com/photo-1556438064-2d7646166914?w=600&h=400&fit=crop",
  screenshots: [
    "https://images.unsplash.com/photo-1556438064-2d7646166914?w=300&h=200&fit=crop",
    "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=300&h=200&fit=crop",
    "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=300&h=200&fit=crop"
  ],
  votes: 152,
  comments: 23,
  url: "https://clashofclans.com",
  category: "Strategy",
  tags: ["Strategy", "Multiplayer", "Base Building", "Combat"],
  maker: {
    name: "Supercell",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face",
    bio: "Game development company from Finland"
  },
  createdAt: "2024-01-15",
  platforms: ["iOS", "Android"],
  status: "Live"
}

const comments = [
  {
    id: "1",
    user: { name: "John Doe", avatar: "" },
    content: "Amazing game! Been playing for years and it never gets old. The clan wars are particularly exciting.",
    createdAt: "2024-01-20",
    votes: 5
  },
  {
    id: "2", 
    user: { name: "Jane Smith", avatar: "" },
    content: "Great graphics and gameplay. The strategy elements are really well done. Highly recommend!",
    createdAt: "2024-01-19",
    votes: 3
  },
  {
    id: "3",
    user: { name: "Mike Johnson", avatar: "" },
    content: "One of the best mobile strategy games out there. The community is also very active.",
    createdAt: "2024-01-18", 
    votes: 7
  }
]

const relatedProducts = [
  {
    id: "2",
    title: "Clash Royale",
    image: "https://images.unsplash.com/photo-1606503153255-59d8b8b91448?w=200&h=150&fit=crop",
    votes: 89,
    category: "Strategy"
  },
  {
    id: "3",
    title: "Boom Beach",
    image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=200&h=150&fit=crop",
    votes: 67,
    category: "Strategy"
  },
  {
    id: "4",
    title: "Hay Day",
    image: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=200&h=150&fit=crop",
    votes: 45,
    category: "Simulation"
  }
]

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Product Header */}
            <div className="space-y-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className="rounded-2xl">{product.category}</Badge>
                    <Badge variant="outline" className="rounded-2xl text-green-600 border-green-600">
                      {product.status}
                    </Badge>
                  </div>
                  <h1 className="text-3xl md:text-4xl font-bold mb-2">{product.title}</h1>
                  <p className="text-lg text-muted-foreground mb-4">{product.description}</p>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <UserIcon className="h-4 w-4" />
                      by {product.maker.name}
                    </div>
                    <div className="flex items-center gap-1">
                      <CalendarIcon className="h-4 w-4" />
                      {new Date(product.createdAt).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-1">
                      <TagIcon className="h-4 w-4" />
                      {product.platforms.join(", ")}
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col items-center gap-2 ml-6">
                  <Button size="lg" className="rounded-xl">
                    <ArrowUpIcon className="h-4 w-4 mr-1" />
                    Upvote
                  </Button>
                  <span className="text-sm font-medium">{product.votes} votes</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3">
                <Button asChild className="rounded-2xl shadow-soft">
                  <a href={product.url} target="_blank" rel="noopener noreferrer">
                    <ExternalLinkIcon className="h-4 w-4 mr-2" />
                    Visit Game
                  </a>
                </Button>
                <Button variant="outline" className="rounded-2xl">
                  <ShareIcon className="h-4 w-4 mr-2" />
                  Share
                </Button>
                <Button variant="outline" className="rounded-2xl">
                  <MessageCircleIcon className="h-4 w-4 mr-2" />
                  {product.comments} Comments
                </Button>
              </div>
            </div>

            {/* Product Image */}
            <Card className="rounded-2xl shadow-soft overflow-hidden">
              <div className="relative aspect-video">
                <img 
                  src={product.image} 
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
              </div>
            </Card>

            {/* Product Details Tabs */}
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-4 rounded-2xl">
                <TabsTrigger value="overview" className="rounded-2xl">Overview</TabsTrigger>
                <TabsTrigger value="screenshots" className="rounded-2xl">Screenshots</TabsTrigger>
                <TabsTrigger value="comments" className="rounded-2xl">Comments</TabsTrigger>
                <TabsTrigger value="details" className="rounded-2xl">Details</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="mt-6">
                <Card className="rounded-2xl shadow-soft">
                  <CardHeader className="p-4">
                    <CardTitle>About {product.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="prose prose-sm max-w-none">
                      {product.longDescription.split('\n').map((paragraph, index) => (
                        <p key={index} className="mb-4 last:mb-0 text-muted-foreground">
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="screenshots" className="mt-6">
                <Card className="rounded-2xl shadow-soft">
                  <CardHeader className="p-4">
                    <CardTitle>Screenshots</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="grid md:grid-cols-3 gap-4">
                      {product.screenshots.map((screenshot, index) => (
                        <div key={index} className="relative aspect-video rounded-xl overflow-hidden">
                          <img 
                            src={screenshot} 
                            alt={`${product.title} screenshot ${index + 1}`}
                            className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                          />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="comments" className="mt-6">
                <Card className="rounded-2xl shadow-soft">
                  <CardHeader className="p-4">
                    <CardTitle>Comments ({product.comments})</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0 space-y-6">
                    {/* Add Comment Form */}
                    <div className="space-y-3">
                      <Textarea 
                        placeholder="Share your thoughts about this game..."
                        className="rounded-2xl border-border focus:ring-2 focus:ring-ring"
                      />
                      <Button className="rounded-2xl">Post Comment</Button>
                    </div>

                    {/* Comments List */}
                    <div className="space-y-4">
                      {comments.map((comment) => (
                        <div key={comment.id} className="flex gap-3 p-4 rounded-2xl bg-muted/50">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={comment.user.avatar} />
                            <AvatarFallback>{comment.user.name[0]}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-sm">{comment.user.name}</span>
                                <span className="text-xs text-muted-foreground">
                                  {new Date(comment.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                  <ArrowUpIcon className="h-3 w-3" />
                                </Button>
                                <span className="text-xs">{comment.votes}</span>
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground">{comment.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="details" className="mt-6">
                <Card className="rounded-2xl shadow-soft">
                  <CardHeader className="p-4">
                    <CardTitle>Game Details</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium mb-2">Developer</h4>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={product.maker.avatar} />
                              <AvatarFallback>{product.maker.name[0]}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium text-sm">{product.maker.name}</div>
                              <div className="text-xs text-muted-foreground">{product.maker.bio}</div>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-medium mb-2">Platforms</h4>
                          <div className="flex gap-2">
                            {product.platforms.map((platform) => (
                              <Badge key={platform} variant="secondary" className="rounded-2xl">
                                {platform}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium mb-2">Tags</h4>
                          <div className="flex flex-wrap gap-2">
                            {product.tags.map((tag) => (
                              <Badge key={tag} variant="outline" className="rounded-2xl">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-medium mb-2">Statistics</h4>
                          <div className="text-sm space-y-1">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Total Votes:</span>
                              <span>{product.votes}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Comments:</span>
                              <span>{product.comments}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Submitted:</span>
                              <span>{new Date(product.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Related Products */}
            <Card className="rounded-2xl shadow-soft">
              <CardHeader className="p-4">
                <CardTitle>Related Games</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="space-y-4">
                  {relatedProducts.map((game) => (
                    <Link key={game.id} href={`/product/${game.id}`} className="block">
                      <div className="flex gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors">
                        <div className="relative w-12 h-12 rounded-lg overflow-hidden">
                          <img 
                            src={game.image} 
                            alt={game.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm truncate">{game.title}</div>
                          <div className="text-xs text-muted-foreground">{game.category}</div>
                          <div className="text-xs text-muted-foreground">{game.votes} votes</div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Share */}
            <Card className="rounded-2xl shadow-soft">
              <CardHeader className="p-4">
                <CardTitle>Share This Game</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0 space-y-2">
                <Button variant="outline" className="w-full rounded-2xl">
                  Copy Link
                </Button>
                <Button variant="outline" className="w-full rounded-2xl">
                  Share on Twitter
                </Button>
                <Button variant="outline" className="w-full rounded-2xl">
                  Share on Facebook
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
