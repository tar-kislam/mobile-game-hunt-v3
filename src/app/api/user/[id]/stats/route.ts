import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/user/[id]/stats - Get user statistics
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

    // Get user statistics
    const [
      totalGames,
      totalVotes,
      totalComments,
      ranking
    ] = await Promise.all([
      prisma.product.count({
        where: { userId: id }
      }),
      prisma.vote.count({
        where: { userId: id }
      }),
      prisma.productComment.count({
        where: { userId: id }
      }),
      // Calculate ranking based on XP
      prisma.user.findUnique({
        where: { id },
        select: { xp: true }
      }).then(user => 
        prisma.user.count({
          where: {
            xp: {
              gt: user?.xp || 0
            }
          }
        }).then(count => count + 1)
      )
    ])

    return NextResponse.json({
      totalGames,
      totalVotes,
      totalComments,
      ranking
    })
  } catch (error) {
    console.error('Error fetching user stats:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
