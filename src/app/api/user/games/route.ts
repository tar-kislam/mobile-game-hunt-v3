import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const games = await prisma.product.findMany({
      where: {
        userId: session.user.id,
        status: 'PUBLISHED'
      },
      select: {
        id: true,
        title: true,
        description: true,
        image: true,
        url: true,
        platforms: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(games)
  } catch (error) {
    console.error('Error fetching user games:', error)
    return NextResponse.json({ error: 'Failed to fetch games' }, { status: 500 })
  }
}