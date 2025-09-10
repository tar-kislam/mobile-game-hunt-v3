import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/user/votes
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const votes = await prisma.vote.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      select: {
        productId: true,
        createdAt: true,
        product: {
          select: {
            id: true,
            title: true,
            platforms: true,
            thumbnail: true,
            image: true,
            images: true,
          }
        }
      },
      take: 50
    })

    const result = votes.map(v => ({
      gameId: v.productId,
      title: v.product.title,
      platforms: v.product.platforms || [],
      coverImage: v.product.thumbnail || v.product.image || (v.product.images?.[0] ?? '/placeholder.png'),
      voteDate: v.createdAt
    }))

    return NextResponse.json({ votes: result })
  } catch (e) {
    console.error('votes error', e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}


