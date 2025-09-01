"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { notFound } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { 
  ArrowUpIcon, 
  MessageCircleIcon, 
  ExternalLinkIcon, 
  ShareIcon,
  CalendarIcon,
  UserIcon,
  ChevronLeftIcon,
  Globe
} from "lucide-react"
import { toast } from "sonner"
import { MediaCarousel } from "@/components/product/media-carousel"
import { InfoPanel } from "@/components/product/info-panel"

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
  _count: {
    votes: number
    comments: number
  }
}

interface Comment {
  id: string
  content: string
  createdAt: string
  user: {
    id: string
    name: string | null
    image?: string | null
  }
  _count: {
    votes: number
  }
}

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { data: session } = useSession()
  const [product, setProduct] = useState<Product | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
  const [newComment, setNewComment] = useState("")
  const [loading, setLoading] = useState(true)
  const [hasVoted, setHasVoted] = useState(false)
  const [resolvedParams, setResolvedParams] = useState<{ id: string } | null>(null)

  // Resolve params asynchronously
  useEffect(() => {
    params.then(setResolvedParams)
  }, [params])

  useEffect(() => {
    if (resolvedParams?.id) {
      fetchProduct()
      fetchComments()
      fetchRelatedProducts()
    }
  }, [resolvedParams?.id])

  const fetchProduct = async () => {
    if (!resolvedParams?.id) return
    
    try {
      const response = await fetch(`/api/products/${resolvedParams.id}`)
      if (response.ok) {
        const data = await response.json()
        setProduct(data)
      } else if (response.status === 404) {
        notFound()
      }
    } catch (error) {
      console.error('Error fetching product:', error)
      toast.error('Failed to load product')
    } finally {
      setLoading(false)
    }
  }

  const fetchComments = async () => {
    if (!resolvedParams?.id) return
    
    try {
      const response = await fetch(`/api/products/${resolvedParams.id}/comments`)
      if (response.ok) {
        const data = await response.json()
        setComments(data)
      }
    } catch (error) {
      console.error('Error fetching comments:', error)
    }
  }

  const fetchRelatedProducts = async () => {
    try {
      const response = await fetch('/api/products?limit=3')
      if (response.ok) {
        const data = await response.json()
        // Filter out current product
        setRelatedProducts(data.filter((p: Product) => p.id !== resolvedParams?.id).slice(0, 3))
      }
    } catch (error) {
      console.error('Error fetching related products:', error)
    }
  }

  const handleVote = async () => {
    if (!session) {
      toast.error('Please sign in to vote')
      return
    }

    if (!resolvedParams?.id) return

    try {
      const response = await fetch(`/api/products/${resolvedParams.id}/vote`, {
        method: 'POST',
      })
      
      if (response.ok) {
        toast.success('Vote recorded!')
        fetchProduct() // Refresh to get updated vote count
        setHasVoted(true)
      } else {
        const data = await response.json()
        toast.error(data.error || 'Failed to vote')
      }
    } catch (error) {
      console.error('Error voting:', error)
      toast.error('Failed to vote')
    }
  }

  const handleCommentSubmit = async () => {
    if (!session) {
      toast.error('Please sign in to comment')
      return
    }

    if (!newComment.trim()) {
      toast.error('Please enter a comment')
      return
    }

    if (!resolvedParams?.id) return

    try {
      const response = await fetch(`/api/products/${resolvedParams.id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: newComment.trim() }),
      })

      if (response.ok) {
        toast.success('Comment posted!')
        setNewComment('')
        fetchComments()
        fetchProduct() // Refresh to get updated comment count
      } else {
        const data = await response.json()
        toast.error(data.error || 'Failed to post comment')
      }
    } catch (error) {
      console.error('Error posting comment:', error)
      toast.error('Failed to post comment')
    }
  }

  const handleShare = async () => {
    if (navigator.share && product) {
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
    } else if (product) {
      await navigator.clipboard.writeText(window.location.href)
      toast.success('Link copied to clipboard!')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading product...</p>
        </div>
      </div>
    )
  }

  if (!product) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        {/* Back Navigation */}
        <div className="mb-6">
          <Link 
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeftIcon className="w-4 h-4" />
            Back to games
          </Link>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Media Carousel - Left Side */}
          <div className="lg:col-span-2">
            <MediaCarousel 
              images={[
                ...(product.images && product.images.length > 0 ? product.images : []),
                ...(product.image && !product.images?.includes(product.image) ? [product.image] : [])
              ].filter(Boolean)}
              video={product.video}
              title={product.title}
            />
            
            {/* Product Info Below Carousel */}
            <div className="mt-8">
              {/* Title and Basic Info */}
              <div className="mb-6">
                <h1 className="text-2xl lg:text-3xl font-bold mb-2">{product.title}</h1>
                {product.tagline && (
                  <p className="text-lg text-muted-foreground mb-4">{product.tagline}</p>
                )}
                
                {/* Maker Info */}
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Avatar className="w-6 h-6">
                      <AvatarImage src={product.user.image || undefined} />
                      <AvatarFallback className="text-xs">
                        {product.user.name?.[0]?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <span>by {product.user.name || 'Anonymous'}</span>
                  </div>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <CalendarIcon className="w-3 h-3" />
                    <span>{new Date(product.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <Card className="rounded-2xl shadow-lg border-white/10 mb-6">
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold mb-4">About {product.title}</h2>
                  <p className="text-muted-foreground leading-relaxed">{product.description}</p>
                </CardContent>
              </Card>
            </div>

            {/* Comments Section */}
            <Card className="rounded-2xl shadow-lg border-white/10">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">
                  Comments ({product._count.comments})
                </h2>

                {/* Add Comment */}
                {session ? (
                  <div className="mb-6 space-y-3">
                    <Textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="What do you think? Share your thoughts..."
                      className="rounded-xl border-border focus:ring-2 focus:ring-ring min-h-[100px]"
                    />
                    <div className="flex justify-end">
                      <Button onClick={handleCommentSubmit} className="rounded-xl">
                        Post Comment
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="mb-6 p-4 border border-dashed border-muted-foreground/30 rounded-xl text-center">
                    <p className="text-muted-foreground mb-2">Join the conversation</p>
                    <Link href="/auth/signin">
                      <Button className="rounded-xl">Sign in to comment</Button>
                    </Link>
                  </div>
                )}

                {/* Comments List */}
                <div className="space-y-4">
                  {comments.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                      No comments yet. Be the first to share your thoughts!
                    </p>
                  ) : (
                    comments.map((comment) => (
                      <div key={comment.id} className="flex gap-3 p-4 rounded-xl bg-muted/30">
                        <Avatar className="w-10 h-10 flex-shrink-0">
                          <AvatarImage src={comment.user.image || undefined} />
                          <AvatarFallback>
                            {comment.user.name?.[0]?.toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm">
                                {comment.user.name || 'Anonymous'}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {new Date(comment.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                <ArrowUpIcon className="w-3 h-3" />
                              </Button>
                              <span className="text-xs">{comment._count.votes}</span>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                            {comment.content}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Info Panel - Right Side */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-6">
              <InfoPanel 
                product={product}
                onVote={handleVote}
                hasVoted={hasVoted}
              />
              
              {/* Related Products */}
              <Card className="rounded-2xl shadow-lg border-white/10 mt-6">
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4">Related games</h3>
                  <div className="space-y-3">
                    {relatedProducts.map((game) => (
                      <Link key={game.id} href={`/product/${game.id}`} className="block">
                        <div className="flex gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors">
                          <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gradient-to-br from-purple-100 to-blue-100 flex-shrink-0">
                            {game.image ? (
                              <Image
                                src={game.image}
                                alt={game.title}
                                fill
                                className="object-cover"
                                sizes="48px"
                                unoptimized={true}
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement
                                  target.onerror = null
                                  target.style.display = 'none'
                                }}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-lg">
                                🎮
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm truncate">{game.title}</div>
                            <div className="text-xs text-muted-foreground">
                              {game.platforms?.map(platform => platform.toUpperCase()).join(', ') || 'No platforms listed'}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {game._count.votes} votes
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}