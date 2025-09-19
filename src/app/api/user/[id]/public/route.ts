import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { calculateLevelProgress } from '@/lib/xpCalculator'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Get user data
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        image: true,
        username: true,
        xp: true,
        level: true,
        createdAt: true,
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get user statistics
    const [gamesCount, votesCount, commentsCount, likesReceived] = await Promise.all([
      prisma.product.count({ where: { userId: id } }),
      prisma.vote.count({ where: { userId: id } }),
      prisma.productComment.count({ where: { userId: id } }),
      prisma.vote.count({ 
        where: { 
          product: { userId: id } 
        } 
      })
    ])

    // Get user badges (placeholder - badge system not implemented yet)
    const userBadges: any[] = []

    // Get user games
    const userGames = await prisma.product.findMany({
      where: { userId: id },
      select: {
        id: true,
        title: true,
        thumbnail: true,
        tagline: true,
        platforms: true,
        _count: {
          select: {
            votes: true,
            comments: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    })

    // Get recent activity (posts, votes, comments)
    const [recentPosts, recentVotes, recentComments] = await Promise.all([
      prisma.post.findMany({
        where: { userId: id },
        select: {
          id: true,
          content: true,
          createdAt: true,
        _count: {
          select: {
            likes: true,
            comments: true
          }
        }
        },
        orderBy: { createdAt: 'desc' },
        take: 5
      }),
      prisma.vote.findMany({
        where: { userId: id },
        select: {
          id: true,
          createdAt: true,
          product: {
            select: {
              id: true,
              title: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 5
      }),
      prisma.productComment.findMany({
        where: { userId: id },
        select: {
          id: true,
          content: true,
          createdAt: true,
          product: {
            select: {
              id: true,
              title: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 5
      })
    ])

    // Calculate rank (simple implementation - can be enhanced)
    const userRank = await prisma.user.count({
      where: {
        xp: {
          gt: user.xp
        }
      }
    }) + 1

    // Calculate XP to next level using centralized calculation
    const levelProgress = calculateLevelProgress(user.xp)
    const xpToNextLevel = levelProgress.remainingXP

    const profileData = {
      user: {
        ...user,
        rank: userRank
      },
      stats: {
        gamesSubmitted: gamesCount,
        votesCast: votesCount,
        commentsMade: commentsCount,
        likesReceived
      },
      badges: userBadges.map(ub => ({
        ...ub.badge,
        progress: ub.progress,
        unlocked: ub.unlocked,
        unlockedAt: ub.unlockedAt,
        claimed: ub.claimed
      })),
      games: userGames,
      activity: {
        posts: recentPosts,
        votes: recentVotes,
        comments: recentComments
      },
      xp: {
        current: user.xp,
        currentLevelXP,
        nextLevelXP,
        xpToNextLevel,
        progress: ((user.xp - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100
      }
    }

    return NextResponse.json(profileData)
  } catch (error) {
    console.error('Error fetching public profile:', error)
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    })
    return NextResponse.json(
      { error: 'Failed to fetch profile data', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
