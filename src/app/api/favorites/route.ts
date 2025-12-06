import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || 'daily'
    const tagFilter = searchParams.get('tag') || null

    // Validate period parameter
    if (period !== 'daily' && period !== 'weekly') {
      return NextResponse.json(
        { error: 'Invalid period parameter. Use: daily or weekly' },
        { status: 400 }
      )
    }

    // Calculate time windows
    const now = new Date()
    const dailyStart = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    const weeklyStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    const windowStart = period === 'daily' ? dailyStart : weeklyStart
    const limit = period === 'daily' ? 5 : 10

    // Build where clause for published products
    const where: any = {
      status: 'PUBLISHED'
    }

    // Add tag filter if provided
    if (tagFilter) {
      where.tags = {
        some: {
          tag: {
            slug: tagFilter.toLowerCase()
          }
        }
      }
    }

    // Get visits for the time window (last 24h for daily, last 7 days for weekly)
    const visitsInPeriod = await prisma.metric.groupBy({
      by: ['gameId'],
      where: {
        timestamp: { gte: windowStart },
        type: { in: ['view', 'INTERNAL', 'click'] }
      },
      _count: { id: true }
    })

    // Create map for visits in period
    const visitsMap = new Map(visitsInPeriod.map(v => [v.gameId, v._count.id]))

    // Fetch all published products
    const products = await prisma.product.findMany({
      where,
      select: {
        id: true,
        slug: true,
        title: true,
        tagline: true,
        description: true,
        thumbnail: true,
        image: true,
        url: true,
        _count: {
          select: {
            votes: true,
            comments: true
          }
        },
        tags: {
          include: {
            tag: {
              select: {
                slug: true,
                name: true
              }
            }
          }
        }
      }
    })

    // Calculate raw metrics for each product
    const productsWithRawMetrics = products.map(product => {
      const rawVisits = visitsMap.get(product.id) || 0
      const rawLikes = product._count.votes

      return {
        id: product.id,
        slug: product.slug,
        title: product.title,
        tagline: product.tagline,
        shortPitch: product.tagline || (product.description ? product.description.substring(0, 150) : ''),
        thumbnail: product.thumbnail || product.image,
        url: product.url,
        rawVisits,
        rawLikes
      }
    })

    // Find maximum values for normalization
    const maxVisits = productsWithRawMetrics.length > 0
      ? Math.max(...productsWithRawMetrics.map(p => p.rawVisits), 0)
      : 0
    const maxLikes = productsWithRawMetrics.length > 0
      ? Math.max(...productsWithRawMetrics.map(p => p.rawLikes), 0)
      : 0

    // Calculate normalized scores and hybrid score
    const productsWithMetrics = productsWithRawMetrics.map(product => {
      const visitsNorm = maxVisits > 0 ? product.rawVisits / maxVisits : 0
      const likesNorm = maxLikes > 0 ? product.rawLikes / maxLikes : 0
      const score = visitsNorm * 0.6 + likesNorm * 0.4

      return {
        id: product.id,
        slug: product.slug,
        title: product.title,
        tagline: product.tagline,
        shortPitch: product.shortPitch,
        thumbnail: product.thumbnail,
        url: product.url,
        metrics: {
          score,
          visits: product.rawVisits,
          likes: product.rawLikes
        }
      }
    })

    // Sort by hybrid score (descending)
    productsWithMetrics.sort((a, b) => b.metrics.score - a.metrics.score)

    // Return top games
    const topGames = productsWithMetrics.slice(0, limit)

    return NextResponse.json(topGames)
  } catch (error) {
    console.error('Error fetching favorites:', error)
    return NextResponse.json(
      { error: 'Failed to fetch favorites' },
      { status: 500 }
    )
  }
}
