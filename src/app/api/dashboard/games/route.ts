import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/dashboard/games
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user?.id) {
      return NextResponse.redirect(new URL('/api/auth/signin', req.url))
    }

    const userId = session.user.id

    const games = await prisma.product.findMany({
      where: { userId },
      select: {
        id: true,
        title: true,
        status: true,
        images: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    const result = games.map((g) => ({
      id: g.id,
      title: g.title,
      status: g.status ?? 'PUBLISHED',
      thumbnail: Array.isArray(g.images) && g.images.length > 0 ? String(g.images[0]) : null,
    }))

    return NextResponse.json({ games: result })
  } catch (error) {
    console.error('Error fetching dashboard games:', error)
    return NextResponse.json({ error: 'Failed to fetch games' }, { status: 500 })
  }
}




