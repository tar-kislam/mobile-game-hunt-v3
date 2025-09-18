'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useState, use } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  Calendar, 
  User, 
  ArrowLeft, 
  ArrowRight,
  Clock,
  Share2,
  BookOpen,
  Tag
} from 'lucide-react'
import { cn } from '@/lib/utils'
import RichTextRenderer from '@/components/RichTextRenderer'
import { isFeatureEnabled } from '@/lib/config'

interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string | null
  content: any // Slate.js JSON
  coverImage: string | null
  status: string
  createdAt: string
  updatedAt: string
  author: {
    id: string
    name: string | null
    image: string | null
  }
}

interface BlogResponse {
  ok: boolean
  data: BlogPost[]
}

export default function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  // Feature flag check - return 404 if blog is disabled
  if (!isFeatureEnabled('BLOG_ENABLED')) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🚧</div>
          <h1 className="text-2xl font-bold text-foreground mb-4">Page Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The blog feature is currently disabled.
          </p>
          <Link href="/">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  const resolvedParams = use(params)
  const [post, setPost] = useState<BlogPost | null>(null)
  const [suggestedPosts, setSuggestedPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true)
        const res = await fetch(`/api/blog/${resolvedParams.slug}`)
        const json = await res.json()
        
        if (json.ok) {
          setPost(json.data)
          // Fetch suggested posts
          const suggestedRes = await fetch('/api/blog?limit=3')
          const suggestedJson = await suggestedRes.json()
          if (suggestedJson.ok) {
            setSuggestedPosts(suggestedJson.data.filter((p: BlogPost) => p.slug !== resolvedParams.slug))
          }
        } else {
          setError('Post not found')
        }
      } catch (err) {
        setError('Failed to load post')
        console.error('Error fetching post:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchPost()
  }, [resolvedParams.slug])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getCoverImage = (post: BlogPost) => {
    return post.coverImage || '/logo/mgh.png'
  }

  const getAuthorName = (author: BlogPost['author']) => {
    return author.name || 'Anonymous'
  }

  const getAuthorImage = (author: BlogPost['author']) => {
    return author.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(getAuthorName(author))}&background=6366f1&color=fff`
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <Skeleton className="h-8 w-32 mb-8" />
            <Skeleton className="h-96 w-full rounded-2xl mb-8" />
            <div className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Post not found</h1>
          <p className="text-muted-foreground mb-6">The blog post you're looking for doesn't exist.</p>
          <Link href="/blog">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Blog
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Back Button */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="container mx-auto px-4 pt-8"
      >
        <div className="max-w-4xl mx-auto">
          <Link href="/blog">
            <Button variant="ghost" className="mb-8 hover:bg-accent/10">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Blog
            </Button>
          </Link>
        </div>
      </motion.div>

      {/* Hero Section */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="pb-12"
      >
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Cover Image */}
            {getCoverImage(post) && (
              <div className="relative h-64 md:h-96 rounded-2xl overflow-hidden mb-8">
                <Image
                  src={getCoverImage(post)}
                  alt={post.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              </div>
            )}

            {/* Post Meta */}
            <div className="mb-8">
              {/* Category */}
              {post.category && (
                <Badge variant="secondary" className="mb-4 bg-accent/10 text-accent border-accent/20">
                  <Tag className="mr-1 h-3 w-3" />
                  {post.category}
                </Badge>
              )}

              {/* Title */}
              <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-6 leading-tight">
                {post.title}
              </h1>

              {/* Excerpt */}
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                {post.excerpt}
              </p>

              {/* Author and Date */}
              <div className="flex items-center justify-between border-b pb-8">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={getAuthorImage(post.author)} />
                    <AvatarFallback>
                      {getAuthorName(post.author).charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-foreground">
                      {getAuthorName(post.author)}
                    </p>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4 mr-1" />
                      {formatDate(post.createdAt)}
                    </div>
                  </div>
                </div>

                <Button variant="outline" size="sm">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Content */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="pb-12"
      >
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <article className="prose prose-lg max-w-none">
              {post && post.content ? (
                <RichTextRenderer content={JSON.stringify(post.content)} />
              ) : (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">📝</div>
                  <p className="text-muted-foreground">No content available</p>
                </div>
              )}
            </article>

            {/* Tags - Not implemented in BlogPost model yet */}
            {/* {post.tags && post.tags.length > 0 && (
              <div className="mt-12 pt-8 border-t">
                <h3 className="text-lg font-semibold text-foreground mb-4">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="hover:bg-accent/10 hover:border-accent">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )} */}
          </div>
        </div>
      </motion.section>

      {/* Suggested Posts */}
      {suggestedPosts.length > 0 && (
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="py-16 bg-card/30"
        >
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-foreground mb-4">
                  Suggested Articles
                </h2>
                <p className="text-muted-foreground">
                  Continue reading with these related posts
                </p>
              </div>

              <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {suggestedPosts.map((suggestedPost) => {
                  const coverImage = getCoverImage(suggestedPost)
                  const authorName = getAuthorName(suggestedPost.author)
                  const authorImage = getAuthorImage(suggestedPost.author)

                  return (
                    <motion.article
                      key={suggestedPost.id}
                      variants={itemVariants}
                      className="group"
                    >
                      <Card className="h-full overflow-hidden border-border/50 hover:border-accent/50 hover:shadow-lg transition-all duration-300">
                        <Link href={`/blog/${suggestedPost.slug}`} className="h-full flex flex-col">
                          <div className="relative">
                            <div className="relative h-48 overflow-hidden">
                              {coverImage ? (
                                <Image
                                  src={coverImage}
                                  alt={suggestedPost.title}
                                  fill
                                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                              ) : (
                                <div className="w-full h-full bg-gradient-to-br from-accent/20 to-primary/20" />
                              )}
                              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                            </div>

                            {suggestedPost.category && (
                              <div className="absolute top-3 left-3">
                                <Badge variant="secondary" className="bg-card/80 backdrop-blur-sm">
                                  {suggestedPost.category}
                                </Badge>
                              </div>
                            )}
                          </div>

                          <CardContent className="p-6 flex-1 flex flex-col">
                            <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-accent transition-colors line-clamp-2">
                              {suggestedPost.title}
                            </h3>
                            <p className="text-muted-foreground mb-4 line-clamp-3 flex-1">
                              {suggestedPost.excerpt}
                            </p>
                            
                            <div className="flex items-center justify-between mt-auto">
                              <div className="flex items-center space-x-2">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={authorImage} />
                                  <AvatarFallback>
                                    {authorName.charAt(0).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="text-sm font-medium text-foreground">
                                    {authorName}
                                  </p>
                                  <div className="flex items-center text-xs text-muted-foreground">
                                    <Clock className="h-3 w-3 mr-1" />
                                    {formatDate(suggestedPost.createdAt)}
                                  </div>
                                </div>
                              </div>
                              <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                                <ArrowRight className="h-4 w-4" />
                              </Button>
                            </div>
                          </CardContent>
                        </Link>
                      </Card>
                    </motion.article>
                  )
                })}
              </motion.div>
            </div>
          </div>
        </motion.section>
      )}
    </div>
  )
}