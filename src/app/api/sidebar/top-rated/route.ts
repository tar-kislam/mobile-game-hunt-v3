import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { startOfWeek } from 'date-fns'

// GET /api/sidebar/top-rated
export async function GET(req: NextRequest) {
  try {
    if (!(prisma as any).product) {
      return NextResponse.json({ games: [] })
    }
    const allProducts = await (prisma as any).product.findMany({
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
    const sortedProducts = allProducts.sort((a: any, b: any) => (b._count?.votes || 0) - (a._count?.votes || 0))

    const result = sortedProducts.map((product: any, index: number) => ({
      id: product.id,
      title: product.title,
      platforms: product.platforms || [],
      votes: product._count?.votes || 0,
      rank: index + 1
    }))

    return NextResponse.json({ games: result })
  } catch (error) {
    console.error('Top rated games error:', error)
    return NextResponse.json({ error: 'Failed to fetch top rated games' }, { status: 500 })
  }
}
