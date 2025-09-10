import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/user/games
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const products = await prisma.product.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        status: true,
        createdAt: true,
        thumbnail: true,
        image: true,
        images: true,
        clicks: true,
        follows: true,
        _count: { select: { votes: true, comments: true } }
      },
      take: 20
    })

    return NextResponse.json({ games: products })
  } catch (e) {
    console.error('games error', e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}


