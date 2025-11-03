import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { subDays, startOfWeek, startOfMonth } from 'date-fns'

// GET /api/sidebar/top-rated
export async function GET(req: NextRequest) {
  try {
    // window: daily | weekly | monthly | alltime (default: alltime)
    const { searchParams } = new URL(req.url)
    const window = (searchParams.get('window') || 'alltime').toLowerCase()

    // Determine time window filter (applies to votes via where on Vote.createdAt)
    let voteSince: Date | undefined
    if (window === 'daily') {
      voteSince = subDays(new Date(), 1)
    } else if (window === 'weekly') {
      voteSince = startOfWeek(new Date(), { weekStartsOn: 1 }) // Monday
    } else if (window === 'monthly') {
      voteSince = startOfMonth(new Date())
    }

    if (!(prisma as any).product) {
      return NextResponse.json({ games: [] })
    }

    // Only include PUBLISHED games. Order by vote count in the selected window.
    // For all-time, order directly by _count.votes. For windows, compute counts via aggregation.
    let top: any[]

    if (!voteSince) {
      // All-time: simple and fast
      top = await (prisma as any).product.findMany({
        where: { status: 'PUBLISHED' },
        take: 5,
        orderBy: {
          votes: { _count: 'desc' }
        },
        include: {
          _count: { select: { votes: true } }
        }
      })
    } else {
      // Time-window: count votes in the window using a separate query then map IDs back
      const voteCounts = await (prisma as any).vote.groupBy({
        by: ['productId'],
        where: { createdAt: { gte: voteSince }, product: { status: 'PUBLISHED' } },
        _count: { productId: true },
        orderBy: { _count: { productId: 'desc' } },
        take: 5
      })

      const ids = voteCounts.map((v: any) => v.productId)
      const products = ids.length
        ? await (prisma as any).product.findMany({
            where: { id: { in: ids } },
            include: { _count: { select: { votes: true } } }
          })
        : []
      // Preserve order by voteCounts
      const countMap = new Map(voteCounts.map((v: any) => [v.productId, v._count.productId]))
      top = ids
        .map((id: string) => products.find((p: any) => p.id === id))
        .filter(Boolean)
        .map((p: any) => ({ ...p, _windowVotes: countMap.get(p.id) || 0 }))
    }

    const result = (top || []).map((product: any, index: number) => ({
      id: product.id,
      slug: product.slug || product.id,
      title: product.title,
      platforms: product.platforms || [],
      votes: voteSince ? (product._windowVotes || 0) : (product._count?.votes || 0),
      rank: index + 1
    }))

    return NextResponse.json({ games: result })
  } catch (error) {
    console.error('Top rated games error:', error)
    return NextResponse.json({ error: 'Failed to fetch top rated games' }, { status: 500 })
  }
}
