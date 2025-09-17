import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { CacheService } from "@/lib/redis"
import { RateLimiter, RATE_LIMITS } from "@/lib/rate-limiter"
import { notify } from '@/lib/notificationService'
import { addXPWithBonus } from "@/lib/xpService"
import { checkAndAwardBadges } from "@/lib/badgeService"
import { notifyFollowersOfGameSubmission } from '@/lib/followNotifications'
import { generateSlug, generateUniqueSlug } from '@/lib/slug'

import { z } from "zod"

// Use the global Prisma instance
import { prisma } from '@/lib/prisma'

// Validation schema for product submission
const createProductSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title must be less than 100 characters"),
  tagline: z.string().optional(),
  description: z.string().min(10, "Description must be at least 10 characters").max(1000, "Description must be less than 1000 characters"),
  url: z.string().url("Please enter a valid URL"),
  image: z.string().url("Please enter a valid image URL").optional(),
  images: z.array(z.string().url("Please enter valid image URLs")).optional(),
  video: z.string().url("Please enter a valid video URL").optional(),
  iosUrl: z.string().url("Please enter a valid App Store URL").optional(),
  androidUrl: z.string().url("Please enter a valid Play Store URL").optional(),
  socialLinks: z.object({
    twitter: z.string().url("Please enter a valid Twitter URL").optional()
  }).optional(),
  platforms: z.array(z.string()).min(1, "At least one platform is required").refine(
    (platforms) => platforms.every(platform => 
      ['ios', 'android', 'web', 'windows', 'mac', 'switch', 'ps5', 'xbox', 'tablet'].includes(platform.toLowerCase())
    ),
    "Invalid platform selected"
  ),
  releaseAt: z.string().optional(),
})

// GET /api/products - Fetch all products or user-specific products
export async function GET(request: NextRequest) {
  const startTime = Date.now()
  const cacheService = CacheService.getInstance()
  const rateLimiter = RateLimiter.getInstance()
  
  try {
    // Apply rate limiting
    const rateLimitResult = await rateLimiter.checkLimit(request, RATE_LIMITS.PRODUCTS)
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { 
          error: 'Rate limit exceeded. Please try again later.',
          retryAfter: Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)
        },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': RATE_LIMITS.PRODUCTS.maxRequests.toString(),
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
            'X-RateLimit-Reset': rateLimitResult.resetTime.toString(),
            'Retry-After': Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString()
          }
        }
      )
    }
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const limitParam = searchParams.get('limit')
    const pageParam = searchParams.get('page')
    const categoryId = searchParams.get('categoryId')
    const year = searchParams.get('year')
    const sortBy = searchParams.get('sortBy') || 'newest'
    const timeWindow = searchParams.get('timeWindow') || 'alltime'
    const monetization = searchParams.get('monetization')?.split(',').filter(Boolean) || []
    const engine = searchParams.get('engine')?.split(',').filter(Boolean) || []
    const pricing = searchParams.get('pricing')?.split(',').filter(Boolean) || []
    const limit = limitParam ? parseInt(limitParam, 10) : 50
    const page = pageParam ? parseInt(pageParam, 10) : 1
    const skip = (page - 1) * limit

    // Validate timeWindow parameter
    const validTimeWindows = ['daily', 'weekly', 'monthly', 'yearly', 'alltime']
    if (!validTimeWindows.includes(timeWindow)) {
      return NextResponse.json(
        { error: 'Invalid timeWindow parameter. Use: daily, weekly, monthly, yearly, or alltime' },
        { status: 400 }
      )
    }

    // Generate cache key for this query
    const cacheKey = cacheService.generateLeaderboardKey(
      timeWindow,
      sortBy,
      categoryId || undefined,
      page,
      limit,
      monetization.length > 0 ? monetization : undefined,
      engine.length > 0 ? engine : undefined,
      pricing.length > 0 ? pricing : undefined
    )

    // Try to get from cache first (only for non-user-specific queries)
    if (!userId) {
      const cachedResult = await cacheService.get(cacheKey)
      if (cachedResult) {
        const duration = Date.now() - startTime
        console.log(`[CACHE HIT] Products API - ${duration}ms - Key: ${cacheKey}`)
        return NextResponse.json(cachedResult)
      }
    }

    // Calculate window start date
    const now = new Date()
    const windowStart = {
      daily: new Date(now.getTime() - 24 * 60 * 60 * 1000),
      weekly: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      monthly: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
      yearly: new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000),
      alltime: null
    }[timeWindow]

    const where: any = userId ? { userId } : {}

    // Only return published products (unless filtering by userId for dashboard)
    if (!userId) {
      where.status = 'PUBLISHED'
    }

    // Add category filter if provided
    if (categoryId) {
      where.categories = {
        some: {
          category: {
            name: {
              equals: categoryId,
              mode: 'insensitive'
            }
          }
        }
      }
    }

    // Add year filter if provided
    if (year) {
      const yearInt = parseInt(year);
      if (!isNaN(yearInt)) {
        where.releaseAt = {
          gte: new Date(yearInt, 0, 1),
          lt: new Date(yearInt + 1, 0, 1)
        };
      }
    }

    // Add monetization filter if provided
    if (monetization.length > 0) {
      where.monetization = {
        in: monetization.map(m => m.toUpperCase())
      }
    }

    // Add engine filter if provided
    if (engine.length > 0) {
      where.engine = {
        in: engine.map(e => e.toUpperCase())
      }
    }

    // Add pricing filter if provided
    if (pricing.length > 0) {
      where.pricing = {
        in: pricing.map(p => p.toUpperCase())
      }
    }

    // Editor's choice column not present in DB; skip filtering

    // Get time-window aggregated counts for all products
    const whereWindow = windowStart ? { createdAt: { gte: windowStart } } : {}
    
    // Aggregate votes in time window
    const votesInWindow = await prisma.vote.groupBy({
      by: ['productId'],
      where: whereWindow,
      _count: { id: true }
    })
    
    // Aggregate follows in time window
    const followsInWindow = await prisma.gameFollow.groupBy({
      by: ['gameId'],
      where: whereWindow,
      _count: { id: true }
    })
    
    // Aggregate clicks/views in time window (using Metric table)
    const clicksInWindow = await prisma.metric.groupBy({
      by: ['gameId'],
      where: {
        timestamp: windowStart ? { gte: windowStart } : undefined,
        type: { in: ['click', 'view'] }
      },
      _count: { id: true }
    })

    // Create maps for quick lookup
    const votesMap = new Map(votesInWindow.map(v => [v.productId, v._count.id]))
    const followsMap = new Map(followsInWindow.map(f => [f.gameId, f._count.id]))
    const clicksMap = new Map(clicksInWindow.map(c => [c.gameId, c._count.id]))

    // Fetch products with basic info
    const products = await prisma.product.findMany({
      where,
      select: {
        id: true,
        title: true,
        slug: true,
        tagline: true,
        thumbnail: true,
        image: true,
        platforms: true,
        createdAt: true,
        status: true,
        releaseAt: true,
        clicks: true,
        editorChoice: true,
        monetization: true,
        engine: true,
        pricing: true,
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          }
        },
        categories: {
          select: {
            category: {
              select: {
                id: true,
                name: true,
              }
            }
          }
        },
        _count: {
          select: {
            votes: true,
            comments: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
    })

    // Calculate scores and add time-window counts
    const productsWithScores = products.map(product => {
      const votesInWindowCount = votesMap.get(product.id) || 0
      const followsInWindowCount = followsMap.get(product.id) || 0
      const clicksInWindowCount = clicksMap.get(product.id) || 0
      
      // Calculate age in hours
      const ageHours = (now.getTime() - product.createdAt.getTime()) / (1000 * 60 * 60)
      
      // Calculate leaderboard score
      const baseScore = Math.log1p(votesInWindowCount) + 0.6 * Math.log1p(followsInWindowCount) + 0.4 * Math.log1p(clicksInWindowCount)
      const decay = Math.exp(-ageHours / 36)
      const score = baseScore * decay

      return {
        ...product,
        votesInWindow: votesInWindowCount,
        followsInWindow: followsInWindowCount,
        clicksInWindow: clicksInWindowCount,
        viewsInWindow: clicksInWindowCount, // Using clicks as views for now
        score: parseFloat(score.toFixed(4))
      }
    })

    // Apply sorting based on time-window counts
    let sortedProducts = productsWithScores
    switch (sortBy) {
      case 'most-upvoted':
        sortedProducts = productsWithScores.sort((a, b) => b.votesInWindow - a.votesInWindow)
        break
      case 'most-viewed':
        sortedProducts = productsWithScores.sort((a, b) => b.viewsInWindow - a.viewsInWindow)
        break
      case 'leaderboard':
        // Sort by calculated leaderboard score
        sortedProducts = productsWithScores.sort((a, b) => b.score - a.score)
        break
      case 'editors-choice':
        // Filter by editorChoice flag if available, then sort by score
        const editorChoiceProducts = productsWithScores.filter(p => p.editorChoice)
        if (editorChoiceProducts.length > 0) {
          sortedProducts = editorChoiceProducts.sort((a, b) => b.score - a.score)
        } else {
          // Fall back to newest if no editor's choice products
          sortedProducts = productsWithScores.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        }
        break
      case 'newest':
      default:
        sortedProducts = productsWithScores.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        break
    }

    // Apply pagination
    const paginatedProducts = sortedProducts.slice(skip, skip + limit)

    // Cache the result (only for non-user-specific queries)
    if (!userId) {
      const ttl = timeWindow === 'daily' ? 30 : timeWindow === 'weekly' ? 60 : 120 // 30s, 1min, 2min
      await cacheService.set(cacheKey, paginatedProducts, ttl)
    }

    const duration = Date.now() - startTime
    console.log(`[DB QUERY] Products API - ${duration}ms - TimeWindow: ${timeWindow}, Sort: ${sortBy}, Page: ${page}`)

    return NextResponse.json(paginatedProducts)
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}

// POST /api/products - Create a new product (authenticated users only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const body = await request.json()
    
    // Validate input
    const validatedData = createProductSchema.parse(body)

    // Generate unique slug
    const baseSlug = generateSlug(validatedData.title)
    const existingSlugs = await prisma.product.findMany({
      select: { slug: true }
    }).then(products => products.map(p => p.slug))
    const uniqueSlug = generateUniqueSlug(baseSlug, existingSlugs)

    // Create the product
    const product = await prisma.product.create({
      data: {
        title: validatedData.title,
        slug: uniqueSlug,
        tagline: validatedData.tagline,
        description: validatedData.description,
        url: validatedData.iosUrl || validatedData.androidUrl || '', // Use one of the URLs as the primary URL
        image: validatedData.image,
        images: validatedData.images || [],
        video: validatedData.video,
        platforms: validatedData.platforms,
              iosUrl: validatedData.iosUrl,
      androidUrl: validatedData.androidUrl,
        socialLinks: validatedData.socialLinks,
        userId: user.id,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          }
        },
        _count: {
          select: {
            votes: true,
            comments: true,
          }
        }
      }
    })

    // Award XP for game submission with first-time bonus
    try {
      const xpResult = await addXPWithBonus(user.id, 20, 10, 'submit')
      console.log(`[XP] Awarded ${xpResult.isFirstTime ? '30' : '20'} XP to user ${user.id} for game submission${xpResult.isFirstTime ? ' (first-time bonus!)' : ''}`)
      
      // Check for new badges after XP award
      try {
        const newBadges = await checkAndAwardBadges(user.id)
        if (newBadges.length > 0) {
          console.log(`[BADGES] User ${user.id} earned new badges:`, newBadges)
        }
      } catch (badgeError) {
        console.error('[BADGES] Error checking badges:', badgeError)
        // Don't fail the request if badge checking fails
      }

      // Send milestone notification for first game submission
      try {
        const existingGames = await prisma.product.count({
          where: { userId: user.id }
        })
        
        if (existingGames === 1) {
          await notify(user.id, "🕹️ Your first game was submitted successfully 👏", "milestone")
        }
      } catch (notificationError) {
        console.error('[NOTIFICATION] Error sending game submission notification:', notificationError)
      }

      // Notify followers of new game submission
      try {
        if (user.username) {
          await notifyFollowersOfGameSubmission(user.id, user.username, product.title, product.id)
        }
      } catch (followNotificationError) {
        console.error('[FOLLOW_NOTIFICATIONS] Error notifying followers of game submission:', followNotificationError)
      }
    } catch (xpError) {
      console.error('[XP] Error awarding XP for game submission:', xpError)
      // Don't fail the request if XP awarding fails
    }

    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    console.error('Error creating product:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: (error as any).issues || [] },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    )
  }
}
