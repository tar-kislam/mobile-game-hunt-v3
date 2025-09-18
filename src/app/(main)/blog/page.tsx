'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { isFeatureEnabled } from '@/lib/config'
import { 
  Search, 
  Calendar, 
  User, 
  ArrowRight, 
  Mail,
  Rss,
  ChevronLeft,
  ChevronRight,
  Clock,
  XIcon
} from 'lucide-react'
import { cn } from '@/lib/utils'
import PixelBlast from '@/components/effects/pixel-blast'
import ShinyText from '@/components/ui/shiny-text'
import { toast } from 'sonner'

interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string | null
  coverImage: string | null
  status: string
  createdAt: string
  author: {
    id: string
    name: string | null
    image?: string | null
  }
}

interface BlogResponse {
  ok: boolean
  data: BlogPost[]
  pagination: {
    page: number
    limit: number
    totalCount: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
  categories: string[]
}

export default function BlogPage() {
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
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [data, setData] = useState<BlogResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [isNewsletterModalOpen, setIsNewsletterModalOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const fetchPosts = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '6'
      })
      
      if (searchQuery) params.append('q', searchQuery)
      if (selectedCategory !== 'all') params.append('category', selectedCategory)

      const res = await fetch(`/api/blog?${params}`)
      const json = await res.json()
      setData(json)
    } catch (error) {
      console.error('Failed to fetch posts:', error)
      setData(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPosts()
  }, [searchQuery, selectedCategory, currentPage])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getCoverImage = (post: BlogPost) => {
    return post.coverImage || '/logo/mgh.png'
  }

  const getAuthorName = (author: BlogPost['author']) => {
    return author?.name || 'Anonymous'
  }

  const getAuthorImage = (author: BlogPost['author']) => {
    return author?.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(getAuthorName(author))}&background=6366f1&color=fff`
  }

  const categories = data?.categories || []
  const allCategories = ['all', ...categories]

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email.trim()) {
      toast.error('Please enter your email address')
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address')
      return
    }

    setIsSubmitting(true)
    
    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success(data.message || 'Welcome to the early community! We\'ll be in touch soon.')
        setEmail('')
        setTimeout(() => {
          setIsNewsletterModalOpen(false)
        }, 2000)
      } else {
        if (response.status === 409) {
          toast.info('You\'re already subscribed to our newsletter!')
        } else {
          toast.error(data.error || 'Something went wrong. Please try again.')
        }
      }
    } catch (error) {
      console.error('Newsletter subscription error:', error)
      toast.error('Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const posts = data?.data || []
  const featuredPosts = posts.slice(0, 2) // First 2 posts as featured
  const remainingPosts = posts.slice(2) // Remaining posts in grid

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

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.4,
        ease: "easeOut"
      }
    },
    hover: {
      scale: 1.02,
      transition: {
        duration: 0.2,
        ease: "easeInOut"
      }
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section - Matching Landing Page Design */}
      <motion.section 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative w-full h-[400px] md:h-[500px] overflow-hidden mb-12"
      >
        {/* Pixel Blast Background - Same as Landing Page */}
        <div className="absolute inset-0 z-0">
          <PixelBlast
            variant="square"
            pixelSize={4}
            color="#8B5CF6"
            patternScale={1.5}
            patternDensity={0.8}
            enableRipples={true}
            rippleIntensityScale={2.0}
            rippleThickness={0.2}
            rippleSpeed={0.6}
            speed={0.3}
            transparent={true}
            edgeFade={0.3}
            liquid={true}
            liquidStrength={0.05}
            liquidRadius={1.5}
            className="w-full h-full"
          />
        </div>
        
        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background/80 z-10" />
        
        {/* Content */}
        <div className="relative z-20 flex flex-col items-center justify-center h-full px-4 sm:px-6 lg:px-8 text-center py-16 md:py-20">
          <div className="max-w-[800px] mx-auto space-y-8">
            {/* Main Heading */}
            <motion.h1 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-4xl md:text-5xl font-extrabold text-foreground"
            >
              Our Blog
            </motion.h1>

            {/* Subtitle */}
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto"
            >
              Stay in the loop with the latest about our products and community.
            </motion.p>

            {/* Newsletter Button */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-center"
            >
              <Button
                onClick={() => setIsNewsletterModalOpen(true)}
                className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-full font-semibold transition-all duration-300 hover:shadow-[0_0_30px_rgba(168,85,247,0.8)] hover:scale-105"
              >
                Subscribe to Newsletter
                <Mail className="ml-2 h-4 w-4" />
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Search and Filters */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.6 }}
        className="py-8 border-b"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto">
            {/* Search Bar */}
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-gray-900/80 backdrop-blur-sm border border-white/10 text-white hover:bg-white/5 transition-all duration-300 rounded-xl shadow-lg shadow-purple-500/10 hover:shadow-purple-500/20 hover:scale-[1.02]"
              />
            </div>

            {/* Category Filters */}
            <div className="flex flex-wrap gap-2 mb-6 justify-center">
              {allCategories.map((category) => (
                <motion.div
                  key={category}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant={selectedCategory === category ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                    className={cn(
                      "rounded-full transition-all duration-200",
                      selectedCategory === category 
                        ? "bg-gradient-to-r from-purple-600 to-violet-600 text-white shadow-lg shadow-purple-500/40 scale-105" 
                        : "bg-gray-900/80 backdrop-blur-sm border border-white/10 text-gray-300 hover:text-white hover:bg-white/5 hover:shadow-purple-500/20"
                    )}
                  >
                    {category === 'all' ? 'All Categories' : category}
                  </Button>
                </motion.div>
              ))}
            </div>

            {/* RSS Feed */}
            <div className="flex items-center justify-center">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-accent">
                <Rss className="h-4 w-4 mr-2" />
                RSS Feed
              </Button>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Blog Content */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {loading ? (
              <div className="space-y-8">
                <Skeleton className="h-96 w-full rounded-2xl" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-80 rounded-xl" />
                  ))}
                </div>
              </div>
            ) : posts.length > 0 ? (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-12"
              >
                {/* Featured Posts Row - First 2 Posts */}
                {featuredPosts.length > 0 && (
                  <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {featuredPosts.map((post) => {
                      const coverImage = getCoverImage(post)
                      const authorName = getAuthorName(post.author)
                      const authorImage = getAuthorImage(post.author)

                      return (
                        <motion.article
                          key={post.id}
                          variants={cardVariants}
                          whileHover="hover"
                          className="group"
                        >
                          <Card className="overflow-hidden bg-black border-0 rounded-xl shadow-lg hover:shadow-[0_0_30px_rgba(168,85,247,0.8)] transition-all duration-300">
                            <Link href={`/blog/${post.slug}`} className="block">
                              {/* Background Image */}
                              <div className="relative h-64 md:h-80 overflow-hidden">
                                {coverImage ? (
                                  <Image
                                    src={coverImage}
                                    alt="Blog Post"
                                    fill
                                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                                  />
                                ) : (
                                  <div className="w-full h-full bg-gradient-to-br from-purple-600/20 to-violet-600/20" />
                                )}
                                {/* Gradient Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                              </div>

                              {/* Content Overlay */}
                              <CardContent className="relative z-10 p-6 h-full flex flex-col justify-end text-white">
                                {/* Title */}
                                <h3 className="text-xl md:text-2xl font-bold leading-tight mb-3 line-clamp-2 group-hover:text-purple-300 transition-colors">
                                  {post.title}
                                </h3>
                                
                                {/* Excerpt */}
                                <p className="text-sm text-gray-200 leading-relaxed mb-4 line-clamp-3">
                                  {post.excerpt || 'No excerpt available'}
                                </p>
                                
                                {/* Author and Date */}
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <Avatar className="h-8 w-8">
                                      <AvatarImage src={authorImage} />
                                      <AvatarFallback>
                                        {authorName.charAt(0).toUpperCase()}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <p className="text-sm font-medium text-white">
                                        {authorName}
                                      </p>
                                      <div className="flex items-center text-xs text-gray-400">
                                        <Clock className="h-3 w-3 mr-1" />
                                        {formatDate(post.createdAt)}
                                      </div>
                                    </div>
                                  </div>
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="opacity-0 group-hover:opacity-100 transition-opacity text-purple-300 hover:text-white hover:bg-purple-500/20"
                                  >
                                    Read More
                                    <ArrowRight className="ml-1 h-3 w-3" />
                                  </Button>
                                </div>
                              </CardContent>
                            </Link>
                          </Card>
                        </motion.article>
                      )
                    })}
                  </motion.div>
                )}

                {/* Grid Posts - Remaining Posts */}
                {remainingPosts.length > 0 && (
                  <motion.div 
                    variants={containerVariants}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                  >
                    {remainingPosts.map((post) => {
                      const coverImage = getCoverImage(post)
                      const authorName = getAuthorName(post.user)
                      const authorImage = getAuthorImage(post.user)

                      return (
                        <motion.article
                          key={post.id}
                          variants={cardVariants}
                          whileHover="hover"
                          className="group"
                        >
                          <Card className="overflow-hidden bg-black border-0 rounded-xl shadow-lg hover:shadow-[0_0_30px_rgba(168,85,247,0.8)] transition-all duration-300">
                            <Link href={`/blog/${post.slug}`} className="block">
                              {/* Background Image */}
                              <div className="relative h-48 overflow-hidden">
                                {coverImage ? (
                                  <Image
                                    src={coverImage}
                                    alt="Blog Post"
                                    fill
                                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                                  />
                                ) : (
                                  <div className="w-full h-full bg-gradient-to-br from-purple-600/20 to-violet-600/20" />
                                )}
                                {/* Gradient Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                              </div>

                              {/* Content Overlay */}
                              <CardContent className="relative z-10 p-4 h-full flex flex-col justify-end text-white">
                                {/* Title */}
                                <h3 className="text-lg font-bold leading-tight mb-2 line-clamp-2 group-hover:text-purple-300 transition-colors">
                                  {post.title}
                                </h3>
                                
                                {/* Excerpt */}
                                <p className="text-xs text-gray-200 leading-relaxed mb-3 line-clamp-2">
                                  {post.excerpt || 'No excerpt available'}
                                </p>
                                
                                {/* Author and Date */}
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <Avatar className="h-6 w-6">
                                      <AvatarImage src={authorImage} />
                                      <AvatarFallback className="text-xs">
                                        {authorName.charAt(0).toUpperCase()}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <p className="text-xs font-medium text-white">
                                        {authorName}
                                      </p>
                                      <div className="flex items-center text-xs text-gray-400">
                                        <Clock className="h-2 w-2 mr-1" />
                                        {formatDate(post.createdAt)}
                                      </div>
                                    </div>
                                  </div>
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="opacity-0 group-hover:opacity-100 transition-opacity text-purple-300 hover:text-white hover:bg-purple-500/20 p-1"
                                  >
                                    <ArrowRight className="h-3 w-3" />
                                  </Button>
                                </div>
                              </CardContent>
                            </Link>
                          </Card>
                        </motion.article>
                      )
                    })}
                  </motion.div>
                )}
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16"
              >
                <div className="text-muted-foreground">
                  <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <h3 className="text-xl font-semibold mb-2">No posts found</h3>
                  <p>Try adjusting your search or filter criteria.</p>
                </div>
              </motion.div>
            )}

            {/* Pagination */}
            {data?.pagination && data.pagination.totalPages > 1 && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex justify-center items-center space-x-2 mt-12"
              >
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={!data.pagination.hasPrev}
                  className="flex items-center bg-gray-900/80 backdrop-blur-sm border border-white/10 text-white hover:bg-white/5 transition-all duration-300 rounded-xl shadow-lg shadow-purple-500/10 hover:shadow-purple-500/20 hover:scale-[1.02]"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                
                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(5, data.pagination.totalPages) }, (_, i) => {
                    const page = i + 1
                    return (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(page)}
                        className={cn(
                          "w-10 h-10 rounded-xl transition-all duration-300",
                          currentPage === page 
                            ? "bg-gradient-to-r from-purple-600 to-violet-600 text-white shadow-lg shadow-purple-500/40 scale-105" 
                            : "bg-gray-900/80 backdrop-blur-sm border border-white/10 text-gray-300 hover:text-white hover:bg-white/5 hover:shadow-purple-500/20"
                        )}
                      >
                        {page}
                      </Button>
                    )
                  })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={!data.pagination.hasNext}
                  className="flex items-center bg-gray-900/80 backdrop-blur-sm border border-white/10 text-white hover:bg-white/5 transition-all duration-300 rounded-xl shadow-lg shadow-purple-500/10 hover:shadow-purple-500/20 hover:scale-[1.02]"
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* Newsletter Subscription Section */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="py-16 bg-card/30 border-t"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Stay in the loop
            </h2>
            <p className="text-muted-foreground mb-8">
              Get the latest articles and updates delivered straight to your inbox.
            </p>
            
            <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 bg-gray-900/80 backdrop-blur-sm border border-white/10 text-white hover:bg-white/5 transition-all duration-300 rounded-xl shadow-lg shadow-purple-500/10 hover:shadow-purple-500/20 hover:scale-[1.02]"
                required
              />
              <Button 
                type="submit" 
                className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-full font-semibold transition-all duration-300 hover:shadow-[0_0_30px_rgba(168,85,247,0.8)] hover:scale-105"
              >
                Subscribe
                <Mail className="ml-2 h-4 w-4" />
              </Button>
            </form>
            
            <p className="text-xs text-muted-foreground mt-4">
              No spam, unsubscribe at any time.
            </p>
          </div>
        </div>
      </motion.section>
      <AnimatePresence>
        {isNewsletterModalOpen && (
          <>
            {/* Background Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.7 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="fixed inset-0 bg-black z-50"
              onClick={() => setIsNewsletterModalOpen(false)}
            />
            
            {/* Modal Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.7 }}
              transition={{ 
                type: "spring", 
                stiffness: 200, 
                damping: 20,
                duration: 0.5
              }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-zinc-900 border border-purple-600 shadow-xl rounded-2xl max-w-5xl w-full mx-auto p-8 relative overflow-hidden">
                {/* Pixel Blast Background - Same as hero section */}
                <div className="absolute inset-0 z-0">
                  <PixelBlast
                    variant="square"
                    pixelSize={4}
                    color="#8B5CF6"
                    patternScale={1.5}
                    patternDensity={0.8}
                    enableRipples={true}
                    rippleIntensityScale={2.0}
                    rippleThickness={0.2}
                    rippleSpeed={0.6}
                    speed={0.3}
                    transparent={true}
                    edgeFade={0.3}
                    liquid={true}
                    liquidStrength={0.05}
                    liquidRadius={1.5}
                    className="w-full h-full"
                  />
                </div>
                
                {/* Overlay for better text readability */}
                <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background/80 z-10" />
                
                {/* Content */}
                <div className="relative z-20">
                  {/* Close Button */}
                  <button
                    onClick={() => setIsNewsletterModalOpen(false)}
                    className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white transition-colors z-30"
                  >
                    <XIcon className="h-5 w-5" />
                  </button>

                {/* Content - Hero Section Style */}
                <div className="text-center space-y-10">
                  {/* CTA Message */}
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="text-center mb-8"
                  >
                    {/* Title Text */}
                    <h2 className="text-xl md:text-2xl lg:text-3xl font-semibold text-foreground leading-tight" style={{ fontFamily: "'Roboto Mono', monospace" }}>
                      Be part of the beginning.{' '}
                      <span className="text-primary">Join our early community</span>{' '}
                      and help shape the future of Mobile Game Hunt.
                    </h2>
                  </motion.div>

                  {/* Futuristic Email Form with Logo - Same as hero section */}
                  <motion.form
                    onSubmit={handleNewsletterSubmit}
                    className="flex flex-col lg:flex-row gap-6 items-center justify-center w-full mx-auto"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                  >
                    {/* Logo and Input Container */}
                    <div className="flex items-center gap-4 w-full lg:w-auto">
                      {/* Logo */}
                      <img
                        src="/logo/mgh-newsletter.png"
                        alt="Mobile Game Hunt Logo"
                        className="object-contain flex-shrink-0"
                        style={{ width: '150px', height: '150px' }}
                        onError={(e) => {
                          e.currentTarget.src = '/logo/moblogo.png';
                        }}
                      />
                      
                      {/* Input Field */}
                      <div 
                        className="w-full lg:w-[450px] p-1 rounded-md relative animate-pulse"
                        style={{
                          background: 'linear-gradient(45deg, rgba(177, 158, 239, 0.3), rgba(177, 158, 239, 0.1))',
                          borderRadius: '8px',
                          boxShadow: '0 0 20px rgba(177, 158, 239, 0.3), inset 0 0 20px rgba(177, 158, 239, 0.1)',
                          border: '1px solid rgba(177, 158, 239, 0.4)',
                          animation: 'pulse 2s infinite',
                        }}
                      >
                        {/* Corner decorations */}
                        <div className="absolute top-0 left-0 w-3 h-3 border-l-2 border-t-2 border-purple-400 animate-pulse"></div>
                        <div className="absolute top-0 right-0 w-3 h-3 border-r-2 border-t-2 border-purple-400 animate-pulse"></div>
                        <div className="absolute bottom-0 left-0 w-3 h-3 border-l-2 border-b-2 border-purple-400 animate-pulse"></div>
                        <div className="absolute bottom-0 right-0 w-3 h-3 border-r-2 border-b-2 border-purple-400 animate-pulse"></div>
                        
                        <input
                          type="email"
                          placeholder="Enter your email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          disabled={isSubmitting}
                          className="w-full p-3 bg-transparent outline-none text-white placeholder:text-gray-300 rounded-md focus:shadow-[0_0_25px_rgba(177,158,239,0.8)] hover:shadow-[0_0_15px_rgba(177,158,239,0.4)] transition-all duration-500"
                          style={{
                            background: 'rgba(0, 0, 0, 0.5)',
                            border: 'none',
                            backdropFilter: 'blur(15px)',
                          }}
                          required
                        />
                      </div>
                    </div>

                    {/* Join Now Button - Same as hero section */}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-8 py-3 font-bold rounded-md transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(177,158,239,0.8)] focus:outline-none focus:ring-2 focus:ring-purple-400 active:scale-95 text-white"
                      style={{
                        background: 'rgba(60, 41, 100, 1)',
                        border: '1px solid rgba(177, 158, 239, 0.5)',
                        boxShadow: '0 0 15px rgba(177, 158, 239, 0.4)',
                        backdropFilter: 'blur(10px)',
                      }}
                    >
                      <ShinyText 
                        text={isSubmitting ? 'Joining...' : 'Join Now'} 
                        disabled={isSubmitting} 
                        speed={3} 
                        className="cta-button" 
                      />
                    </button>
                  </motion.form>
                  
                  {/* Additional text - Same as hero section */}
                  <motion.p
                    className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                  >
                    Get exclusive early access, shape new features, and be the first to discover the next big mobile games.
                  </motion.p>
                </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}