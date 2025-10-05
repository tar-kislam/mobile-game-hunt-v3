import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/user/[id]/games - Get user's submitted games
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get user's games
    const games = await prisma.product.findMany({
      where: { userId: id },
      select: {
        id: true,
        title: true,
        description: true,
        thumbnail: true,
        image: true,
        images: true,
        platforms: true,
        createdAt: true,
        _count: {
          select: {
            votes: true,
            comments: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ games })
  } catch (error) {
    console.error('Error fetching user games:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
