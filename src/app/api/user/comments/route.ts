import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/user/comments
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Count comments by this user grouped by game
    const counts = await prisma.productComment.groupBy({
      by: ['productId'],
      where: { userId: session.user.id },
      _count: { productId: true },
      orderBy: { _count: { productId: 'desc' } }
    })

    const productIds = counts.map(c => c.productId)
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, title: true, platforms: true, thumbnail: true, image: true, images: true }
    })
    const map = new Map(products.map(p => [p.id, p]))

    const result = counts.map(c => {
      const p = map.get(c.productId)!
      return {
        gameId: p.id,
        title: p.title,
        platforms: p.platforms || [],
        coverImage: p.thumbnail || p.image || (p.images?.[0] ?? '/placeholder.png'),
        commentCount: c._count.productId
      }
    })

    return NextResponse.json({ comments: result })
  } catch (e) {
    console.error('comments error', e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}


