import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    // Support both ?q= and ?query=
    const query = (searchParams.get('q') || searchParams.get('query') || '').trim()
    if (query.length < 2) {
      return NextResponse.json([], { status: 200 })
    }

    // Postgres ILIKE via Prisma: use contains + mode: 'insensitive'
    const games = await prisma.product.findMany({
      where: {
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { slug: { contains: query, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        title: true,
        slug: true,
        thumbnail: true,
        platforms: true,
      },
      take: 10,
      orderBy: { createdAt: 'desc' },
    })

    const result = games.map(g => ({ id: g.id, title: g.title, slug: g.slug, thumbnail: g.thumbnail }))

    return NextResponse.json(result)
  } catch (err) {
    console.error('[GAMES SEARCH] Error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


