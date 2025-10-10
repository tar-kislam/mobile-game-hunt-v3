import { prisma } from './prisma'
import { redisClient } from './redis'
import { Prisma } from '@prisma/client'

// Configuration constants
export const TRENDING_CONFIG = {
  LOOKBACK_DAYS: 7,
  CACHE_TTL: 60 * 60, // 1 hour in seconds
  MAX_TRENDING_ITEMS: 10,
  HASHTAG_WEIGHT: 0.3,
  LIKES_WEIGHT: 0.7,
  POST_RECENCY_WEIGHT: 100,
} as const

interface HashtagStats {
  tag: string
  score: number
  likes: number
  mentions: number
}

interface TrendingPost {
  id: string
  content: string
  authorId: string
  author: {
    name: string | null
    username: string | null
    image: string | null
  }
  likeCount: number
  createdAt: Date
  hashtags: string[]
  score: number
}

interface TrendingData {
  hashtags: HashtagStats[]
  posts: TrendingPost[]
  lastUpdated: Date
}

/**
 * Calculate trending hashtags based on likes and mentions in the last 7 days
 */
export async function calculateTrendingHashtags(): Promise<HashtagStats[]> {
  const oneWeekAgo = new Date(Date.now() - TRENDING_CONFIG.LOOKBACK_DAYS * 24 * 60 * 60 * 1000)

  // Get all posts from the last 7 days with their likes
  const posts = await prisma.post.findMany({
    where: {
      createdAt: { gte: oneWeekAgo },
      hashtags: { not: Prisma.JsonNull }
    },
    include: {
      likes: {
        select: { id: true }
      },
      user: {
        select: { id: true, name: true, username: true, image: true }
      }
    }
  })

  // Aggregate hashtag statistics
  const hashtagStats: Record<string, { likes: number; mentions: number }> = {}

  for (const post of posts) {
    const hashtags = post.hashtags as string[] | null
    if (!hashtags || !Array.isArray(hashtags)) continue

    const likeCount = post.likes.length

    for (const tag of hashtags) {
      const normalizedTag = tag.toLowerCase().trim()
      if (!normalizedTag) continue

      if (!hashtagStats[normalizedTag]) {
        hashtagStats[normalizedTag] = { likes: 0, mentions: 0 }
      }

      hashtagStats[normalizedTag].mentions++
      hashtagStats[normalizedTag].likes += likeCount
    }
  }

  // Calculate trend scores and sort
  const trending = Object.entries(hashtagStats)
    .map(([tag, stats]) => ({
      tag,
      score: stats.likes * TRENDING_CONFIG.LIKES_WEIGHT + stats.mentions * TRENDING_CONFIG.HASHTAG_WEIGHT,
      likes: stats.likes,
      mentions: stats.mentions,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, TRENDING_CONFIG.MAX_TRENDING_ITEMS)

  return trending
}

/**
 * Calculate trending posts based on likes and recency
 */
export async function calculateTrendingPosts(): Promise<TrendingPost[]> {
  const oneWeekAgo = new Date(Date.now() - TRENDING_CONFIG.LOOKBACK_DAYS * 24 * 60 * 60 * 1000)

  // Get posts from the last 7 days with their likes and author info
  const posts = await prisma.post.findMany({
    where: {
      createdAt: { gte: oneWeekAgo },
      content: { not: null }
    },
    include: {
      likes: true,
      user: {
        select: { id: true, name: true, username: true, image: true }
      },
      _count: {
        select: { likes: true }
      }
    },
    orderBy: { createdAt: 'desc' },
    take: 50 // Get more posts to calculate scores from
  })

  const now = new Date()

  // Calculate post scores and filter
  const scoredPosts = posts
    .map(post => {
      const likeCount = post._count.likes
      const hoursSincePost = (now.getTime() - post.createdAt.getTime()) / (1000 * 60 * 60)
      
      // Post score: likes weighted more heavily + recency boost
      const score = (likeCount * 0.8) + (1 / (hoursSincePost + 2)) * TRENDING_CONFIG.POST_RECENCY_WEIGHT

      return {
        id: post.id,
        content: post.content || '',
        authorId: post.userId,
        author: post.user,
        likeCount,
        createdAt: post.createdAt,
        hashtags: (post.hashtags as string[]) || [],
        score
      }
    })
    .filter(post => post.score > 0) // Filter out posts with no engagement
    .sort((a, b) => b.score - a.score)
    .slice(0, TRENDING_CONFIG.MAX_TRENDING_ITEMS)

  return scoredPosts
}

/**
 * Get cached trending data or calculate fresh data
 */
export async function getTrendingData(): Promise<TrendingData> {
  const cacheKey = 'trending:community:data'
  
  try {
    // Try to get from cache first
    const cached = await redisClient.get(cacheKey)
    if (cached) {
      const parsed = JSON.parse(cached)
      // Convert date strings back to Date objects
      parsed.lastUpdated = new Date(parsed.lastUpdated)
      return parsed
    }
  } catch (error) {
    console.warn('[TRENDING] Failed to get cached data:', error)
  }

  // Calculate fresh data
  console.log('[TRENDING] Calculating fresh trending data...')
  
  const [hashtags, posts] = await Promise.all([
    calculateTrendingHashtags(),
    calculateTrendingPosts()
  ])

  const trendingData: TrendingData = {
    hashtags,
    posts,
    lastUpdated: new Date()
  }

  // Cache the results
  try {
    await redisClient.setex(
      cacheKey,
      TRENDING_CONFIG.CACHE_TTL,
      JSON.stringify(trendingData)
    )
    console.log('[TRENDING] Cached trending data successfully')
  } catch (error) {
    console.warn('[TRENDING] Failed to cache data:', error)
  }

  return trendingData
}

/**
 * Clear trending cache (useful for testing or manual refresh)
 */
export async function clearTrendingCache(): Promise<void> {
  const cacheKey = 'trending:community:data'
  try {
    await redisClient.del(cacheKey)
    console.log('[TRENDING] Cache cleared successfully')
  } catch (error) {
    console.warn('[TRENDING] Failed to clear cache:', error)
  }
}

/**
 * Get trending hashtags only (for specific UI components)
 */
export async function getTrendingHashtags(): Promise<HashtagStats[]> {
  const trendingData = await getTrendingData()
  return trendingData.hashtags
}

/**
 * Get trending posts only (for specific UI components)
 */
export async function getTrendingPosts(): Promise<TrendingPost[]> {
  const trendingData = await getTrendingData()
  return trendingData.posts
}
