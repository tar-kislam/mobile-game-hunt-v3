import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { subDays } from 'date-fns'

// GET /api/sidebar/trending
// Returns games that are trending in the last 7 days based on vote count.
// Never returns an empty list if there are published games in the system:
// - Try last 7 days (rolling week, e.g. 17.11.2025–24.11.2025)
// - If no votes, fall back to last 30 days
// - If still empty, fall back to all-time top voted games
export async function GET(req: NextRequest) {
  try {
    if (!(prisma as any).product) {
      return NextResponse.json({ games: [] })
    }

    const now = new Date()

    // Helper that returns top games ordered by vote count in a given window.
    // If since is undefined, it returns all-time top games by total vote count.
    const getTopByVotes = async (since?: Date) => {
      if (!since) {
        // All-time: order directly by total vote count
        const products = await (prisma as any).product.findMany({
          where: { status: 'PUBLISHED' },
          take: 5,
          orderBy: {
            votes: { _count: 'desc' },
          },
          include: {
            _count: { select: { votes: true } },
          },
        })

        return products.map((product: any) => ({
          id: product.id,
          slug: product.slug || product.id,
          title: product.title,
          platforms: product.platforms || [],
          votes: product._count?.votes || 0,
        }))
      }

      // Windowed: group votes within the window and map back to products
      const voteCounts = await (prisma as any).vote.groupBy({
        by: ['productId'],
        where: {
          createdAt: { gte: since },
          product: { status: 'PUBLISHED' },
        },
        _count: { productId: true },
        orderBy: { _count: { productId: 'desc' } },
        take: 5,
      })

      if (!voteCounts.length) {
        return []
      }

      const ids = voteCounts.map((v: any) => v.productId)
      const products = await (prisma as any).product.findMany({
        where: { id: { in: ids } },
        include: { _count: { select: { votes: true } } },
      })

      const countMap = new Map(voteCounts.map((v: any) => [v.productId, v._count.productId]))

      return ids
        .map((id: string) => products.find((p: any) => p.id === id))
        .filter(Boolean)
        .map((product: any) => ({
          id: product.id,
          slug: product.slug || product.id,
          title: product.title,
          platforms: product.platforms || [],
          // Show votes in the selected window, not all-time
          votes: countMap.get(product.id) || 0,
        }))
    }

    // 1) Primary window: last 7 days
    const oneWeekAgo = subDays(now, 7)
    let games = await getTopByVotes(oneWeekAgo)
    let windowStart: Date | null = games.length ? oneWeekAgo : null

    // 2) Fallback: last 30 days
    if (!games.length) {
      const oneMonthAgo = subDays(now, 30)
      games = await getTopByVotes(oneMonthAgo)
      windowStart = games.length ? oneMonthAgo : null
    }

    // 3) Fallback: all-time
    if (!games.length) {
      games = await getTopByVotes(undefined)
      windowStart = null
    }

    const payload: any = { games }

    // Include window information if we used a time-bounded window
    if (windowStart) {
      payload.windowStart = windowStart.toISOString()
      payload.windowEnd = now.toISOString()
    }

    return NextResponse.json(payload)
  } catch (error) {
    console.error('Trending games error:', error)
    return NextResponse.json({ error: 'Failed to fetch trending games' }, { status: 500 })
  }
}
