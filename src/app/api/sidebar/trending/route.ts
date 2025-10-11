import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { startOfWeek } from 'date-fns'

// GET /api/sidebar/trending
export async function GET(req: NextRequest) {
  try {
    // Calculate week start (Monday)
    const now = new Date()
    const weekStart = new Date(now)
    weekStart.setDate(now.getDate() - now.getDay() + 1) // Monday
    weekStart.setHours(0, 0, 0, 0)
    
    if (!(prisma as any).product) {
      return NextResponse.json({ games: [] })
    }
    const trendingThisWeek = await (prisma as any).product.findMany({
      where: { 
        createdAt: { 
          gte: weekStart 
        } 
      },
      take: 5,
      include: { 
        _count: { 
          select: { 
            votes: true 
          } 
        } 
      },
    })

    // Sort by vote count manually
    const sortedTrending = trendingThisWeek.sort((a: any, b: any) => (b._count?.votes || 0) - (a._count?.votes || 0))

    const result = sortedTrending.map((product: any) => ({
      id: product.id,
      slug: product.slug || product.id, // Use slug if available, fallback to id
      title: product.title,
      platforms: product.platforms || [],
      votes: product._count?.votes || 0
    }))

    return NextResponse.json({ games: result })
  } catch (error) {
    console.error('Trending games error:', error)
    return NextResponse.json({ error: 'Failed to fetch trending games' }, { status: 500 })
  }
}
