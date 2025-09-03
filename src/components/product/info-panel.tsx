"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  ArrowUpIcon, 
  HeartIcon, 
  BookmarkIcon, 
  ShareIcon,
  ExternalLinkIcon,
  BarChart3Icon,
  CalendarIcon,
  MessageCircleIcon,
  TwitterIcon,
  SmartphoneIcon,
  TabletSmartphoneIcon,
  Globe
} from "lucide-react"
import { toast } from "sonner"
import { PlatformIcons } from "@/components/ui/platform-icons"

interface Product {
  id: string
  title: string
  tagline?: string | null
  description: string
  url: string
  image?: string | null
  images: string[]
  video?: string | null
  platforms?: string[]
  appStoreUrl?: string | null
  playStoreUrl?: string | null
  socialLinks?: any
  createdAt: string
  user: {
    id: string
    name: string | null
    image?: string | null
  }
  categories?: Array<{
    category: {
      id: string;
      name: string;
    };
  }>;
  _count: {
    votes: number
    comments: number
  }
}

interface InfoPanelProps {
  product: Product
  onVote: () => void
  hasVoted: boolean
}

export function InfoPanel({ product, onVote, hasVoted }: InfoPanelProps) {
  const { data: session } = useSession()
  const [isFollowing, setIsFollowing] = useState(false)
  const [isBookmarked, setIsBookmarked] = useState(false)

  const handleFollow = async () => {
    if (!session) {
      toast.error('Please sign in to follow products')
      return
    }
    
    setIsFollowing(!isFollowing)
    toast.success(isFollowing ? 'Unfollowed product' : 'Following product!')
  }

  const handleBookmark = async () => {
    if (!session) {
      toast.error('Please sign in to bookmark products')
      return
    }
    
    setIsBookmarked(!isBookmarked)
    toast.success(isBookmarked ? 'Removed from collection' : 'Added to collection!')
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.title,
          text: product.tagline || product.description,
          url: window.location.href,
        })
      } catch (error) {
        // Fallback to clipboard
        await navigator.clipboard.writeText(window.location.href)
        toast.success('Link copied to clipboard!')
      }
    } else {
      await navigator.clipboard.writeText(window.location.href)
      toast.success('Link copied to clipboard!')
    }
  }

  const socialLinks = product.socialLinks as { twitter?: string } || {}

  return (
    <div className="space-y-6">
      {/* Launch Status */}
      <Card className="rounded-2xl shadow-soft">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <Badge className="bg-[rgb(60,41,100)] hover:bg-[rgb(50,31,90)] text-white rounded-full">
              Launching today
            </Badge>
            <Badge variant="outline" className="rounded-full">
              #1 Day Rank
            </Badge>
          </div>
          
          {/* Vote Button */}
          <Button
            onClick={onVote}
            disabled={hasVoted}
            className={`w-full rounded-xl py-6 flex items-center justify-center gap-2 text-lg font-semibold ${
              hasVoted ? 'bg-[rgb(60,41,100)] hover:bg-[rgb(50,31,90)]' : ''
            }`}
          >
            <ArrowUpIcon className="w-5 h-5" />
            Upvote • {product._count.votes}
          </Button>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <Card className="rounded-2xl shadow-soft">
        <CardContent className="p-4 space-y-3">
          <Button
            onClick={handleFollow}
            variant={isFollowing ? "default" : "outline"}
            className="w-full rounded-xl"
          >
            <HeartIcon className={`w-4 h-4 mr-2 ${isFollowing ? 'fill-current' : ''}`} />
            {isFollowing ? 'Following' : 'Follow Game'}
          </Button>
          
          <Button
            onClick={handleBookmark}
            variant={isBookmarked ? "default" : "outline"}
            className="w-full rounded-xl"
          >
            <BookmarkIcon className={`w-4 h-4 mr-2 ${isBookmarked ? 'fill-current' : ''}`} />
            {isBookmarked ? 'In Collection' : 'Add to Collection'}
          </Button>
          
          <Button
            onClick={handleShare}
            variant="outline"
            className="w-full rounded-xl"
          >
            <ShareIcon className="w-4 h-4 mr-2" />
            Share
          </Button>
        </CardContent>
      </Card>

      {/* Analytics */}
      <Card className="rounded-2xl shadow-soft">
        <CardContent className="p-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <BarChart3Icon className="w-4 h-4" />
            Analytics
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Votes:</span>
              <span className="font-medium">{product._count.votes}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Comments:</span>
              <span className="font-medium">{product._count.comments}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Views:</span>
              <span className="font-medium">{Math.floor(Math.random() * 1000) + 100}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Company Info */}
      <Card className="rounded-2xl shadow-soft">
        <CardContent className="p-4">
          <h3 className="font-semibold mb-3">Company Info</h3>
          <div className="space-y-3">
            <Button asChild variant="outline" className="w-full rounded-xl justify-start">
              <a href={product.url} target="_blank" rel="noopener noreferrer">
                <Globe className="w-4 h-4 mr-2" />
                Visit Website
              </a>
            </Button>
            
            {product.appStoreUrl && (
              <Button asChild variant="outline" className="w-full rounded-xl justify-start">
                <a href={product.appStoreUrl} target="_blank" rel="noopener noreferrer">
                  <SmartphoneIcon className="w-4 h-4 mr-2" />
                  App Store
                </a>
              </Button>
            )}
            
            {product.playStoreUrl && (
              <Button asChild variant="outline" className="w-full rounded-xl justify-start">
                <a href={product.playStoreUrl} target="_blank" rel="noopener noreferrer">
                  <TabletSmartphoneIcon className="w-4 h-4 mr-2" />
                  Google Play
                </a>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Game Info */}
      <Card className="rounded-2xl shadow-soft">
        <CardContent className="p-4">
          <h3 className="font-semibold mb-3">Game Info</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Launched:</span>
              <span className="font-medium">
                {new Date(product.createdAt).toLocaleDateString()}
              </span>
            </div>
            
            <Separator />
            
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Platforms:</span>
              <PlatformIcons 
                platforms={product.platforms || []} 
                size="sm" 
                showLabels={true}
              />
            </div>
            
            <Separator />
            
            {product.categories && product.categories.length > 0 && (
              <>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Categories:</span>
                  <div className="flex flex-wrap gap-1">
                    {product.categories.map((cat) => (
                      <Badge key={cat.category.id} variant="secondary" className="text-xs">
                        {cat.category.name}
                      </Badge>
                    ))}
                  </div>
                </div>
                <Separator />
              </>
            )}
            
            <Separator />
            
            <Link 
              href={`/product/${product.id}#comments`}
              className="flex items-center justify-between hover:text-primary transition-colors"
            >
              <span className="text-muted-foreground">Forum:</span>
              <div className="flex items-center gap-1">
                <MessageCircleIcon className="w-3 h-3" />
                <span className="font-medium">p/{product.title.toLowerCase().replace(/\s+/g, '-')}</span>
              </div>
            </Link>
            
            {socialLinks.twitter && (
              <>
                <Separator />
                <Button 
                  asChild 
                  variant="ghost" 
                  className="w-full justify-start p-0 h-auto font-normal"
                >
                  <a 
                    href={socialLinks.twitter} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center justify-between"
                  >
                    <span className="text-muted-foreground">Social:</span>
                    <div className="flex items-center gap-1">
                      <TwitterIcon className="w-3 h-3" />
                      <span className="font-medium">Twitter</span>
                    </div>
                  </a>
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
