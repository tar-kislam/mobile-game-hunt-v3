import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params

    if (!username) {
      return NextResponse.json({ error: 'Username is required' }, { status: 400 })
    }

    // Fetch user by username
    const user = await prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        name: true,
        username: true,
        image: true,
        createdAt: true,
        role: true,
        xp: true,
        level: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Fetch user stats
    const stats = await prisma.$transaction([
      prisma.product.count({
        where: { userId: user.id }
      }),
      prisma.vote.count({
        where: { userId: user.id }
      }),
      prisma.productComment.count({
        where: { userId: user.id }
      }),
    ])

    // Fetch user's games
    const games = await prisma.product.findMany({
      where: { userId: user.id },
      select: {
        id: true,
        title: true,
        tagline: true,
        thumbnail: true,
        platforms: true,
        _count: {
          select: {
            votes: true,
            comments: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    })

    // Fetch user's activity
    const [votes, comments, posts] = await prisma.$transaction([
      prisma.vote.findMany({
        where: { userId: user.id },
        select: {
          id: true,
          createdAt: true,
          product: {
            select: {
              id: true,
              title: true,
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 10
      }),
      prisma.productComment.findMany({
        where: { userId: user.id },
        select: {
          id: true,
          content: true,
          createdAt: true,
          product: {
            select: {
              id: true,
              title: true,
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 10
      }),
      prisma.post.findMany({
        where: { userId: user.id },
        select: {
          id: true,
          content: true,
          createdAt: true,
          _count: {
            select: {
              likes: true,
              comments: true,
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 10
      })
    ])

    // Calculate XP data
    const currentXP = user.xp || 0
    const currentLevel = user.level || 1
    const xpForNextLevel = currentLevel * 100 // Simple XP calculation
    const xpToNextLevel = Math.max(0, xpForNextLevel - currentXP)
    const progress = xpForNextLevel > 0 ? (currentXP / xpForNextLevel) * 100 : 100

    // Get user rank (simplified - could be improved with actual ranking logic)
    const userCount = await prisma.user.count({
      where: {
        xp: { gt: currentXP }
      }
    })
    const rank = userCount + 1

    // Fetch user badges (simplified - you might want to implement proper badge logic)
    const badges = []

    return NextResponse.json({
      user: {
        ...user,
        rank
      },
      stats: {
        gamesSubmitted: stats[0],
        votesCast: stats[1],
        commentsMade: stats[2],
      },
      badges,
      games,
      activity: {
        votes,
        comments,
        posts,
      },
      xp: {
        current: currentXP,
        nextLevelXP: xpForNextLevel,
        xpToNextLevel,
        progress: Math.min(progress, 100),
      }
    })

  } catch (error) {
    console.error('Error fetching user profile by username:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
