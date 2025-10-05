import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/user/stats
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id

    const [gamesCount, votesCount, commentsCount] = await Promise.all([
      prisma.product.count({ where: { userId } }),
      prisma.vote.count({ where: { userId } }),
      prisma.productComment.count({ where: { userId } })
    ])

    // Engagement ranking: posts*2 + likes + comments (adapted -> games*2 + votes + comments)
    const engagementScore = gamesCount * 2 + votesCount + commentsCount

    // Compute ranking among all users by engagementScore
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        _count: {
          select: { products: true, votes: true, comments: true }
        }
      }
    })

    const scores = allUsers.map(u => ({
      id: u.id,
      score: (u._count.products || 0) * 2 + (u._count.votes || 0) + (u._count.comments || 0)
    }))
      .sort((a, b) => b.score - a.score)

    const rank = scores.findIndex(s => s.id === userId) + 1 || scores.length

    return NextResponse.json({
      totalGames: gamesCount,
      totalVotes: votesCount,
      totalComments: commentsCount,
      ranking: rank,
      engagementScore
    })
  } catch (e) {
    console.error('stats error', e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}


