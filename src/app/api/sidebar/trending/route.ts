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
    
    const trendingThisWeek = await prisma.product.findMany({
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
    const sortedTrending = trendingThisWeek.sort((a, b) => b._count.votes - a._count.votes)

    const result = sortedTrending.map((product) => ({
      id: product.id,
      title: product.title,
      platforms: product.platforms || [],
      votes: product._count.votes
    }))

    return NextResponse.json({ games: result })
  } catch (error) {
    console.error('Trending games error:', error)
    return NextResponse.json({ error: 'Failed to fetch trending games' }, { status: 500 })
  }
}
