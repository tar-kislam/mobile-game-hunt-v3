import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { resolveUserId } from '@/lib/userUtils'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: targetUserId } = await params

    // Get user stats for progress calculation
    const userStats = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: {
        _count: {
          select: {
            products: true,
            votes: true,
            comments: true,
            following: true
          }
        }
      }
    })

    if (!userStats) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get follow counts for Explorer and Rising Star badges
    const userFollows = await prisma.follow.count({
      where: { followerId: targetUserId }
    })

    const followers = await prisma.follow.count({
      where: { followingId: targetUserId }
    })

    // Count likes received on user's products
    const likesReceived = await prisma.vote.count({
      where: {
        product: {
          userId: targetUserId
        }
      }
    })

    // Count published games for First Launch badge
    const publishedGamesCount = await prisma.product.count({
      where: {
        userId: targetUserId,
        status: 'PUBLISHED'
      }
    })

    // Check Pioneer badge eligibility
    const isPioneerEligible = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: { createdAt: true }
    }).then(async (user) => {
      if (!user) return false
      const usersBeforeCount = await prisma.user.count({
        where: {
          createdAt: {
            lt: user.createdAt
          }
        }
      })
      return usersBeforeCount < 1000
    })

    // Get user's earned badges from Redis
    let earnedBadges: string[] = []
    try {
      const { getUserBadges } = await import('@/lib/badgeService')
      earnedBadges = await getUserBadges(targetUserId)
    } catch (error) {
      console.warn('[USER BADGES API] Badge service not available, using fallback:', error)
      earnedBadges = []
    }

    const BADGE_CONFIG = [
      {
        code: 'WISE_OWL',
        title: 'Wise Owl',
        emoji: '🦉',
        description: 'Make 50 comments to earn this badge',
        threshold: 50,
        xp: 100,
        type: 'comments'
      },
      {
        code: 'FIRE_DRAGON',
        title: 'Fire Dragon',
        emoji: '🐉',
        description: 'Submit 10 games to earn this badge',
        threshold: 10,
        xp: 200,
        type: 'games'
      },
      {
        code: 'CLEVER_FOX',
        title: 'Clever Fox',
        emoji: '🦊',
        description: 'Cast 100 votes to earn this badge',
        threshold: 100,
        xp: 150,
        type: 'votes'
      },
      {
        code: 'GENTLE_PANDA',
        title: 'Gentle Panda',
        emoji: '🐼',
        description: 'Receive 50 likes to earn this badge',
        threshold: 50,
        xp: 120,
        type: 'likes'
      },
      {
        code: 'SWIFT_PUMA',
        title: 'Swift Puma',
        emoji: '🐆',
        description: 'Follow 25 games to earn this badge',
        threshold: 25,
        xp: 80,
        type: 'follows'
      },
      {
        code: 'EXPLORER',
        title: 'Explorer',
        emoji: '🧭',
        description: 'Follow your first 10 users to earn this badge',
        threshold: 10,
        xp: 100,
        type: 'user_follows'
      },
      {
        code: 'RISING_STAR',
        title: 'Rising Star',
        emoji: '⭐',
        description: 'Reach 100 followers to earn this badge',
        threshold: 100,
        xp: 300,
        type: 'followers'
      },
      {
        code: 'PIONEER',
        title: 'Pioneer',
        emoji: '🛡️',
        description: 'One of the first 1000 users to join the platform',
        threshold: 1000,
        xp: 500,
        type: 'registration_order'
      },
      {
        code: 'FIRST_LAUNCH',
        title: 'First Launch',
        emoji: '🎯',
        description: 'Successfully published your first game',
        threshold: 1,
        xp: 150,
        type: 'first_game'
      }
    ]

    const badges = BADGE_CONFIG.map(badgeConfig => {
      let current = 0
      
      // Calculate current progress based on badge type
      switch (badgeConfig.type) {
        case 'comments':
          current = userStats?._count.comments || 0
          break
        case 'games':
          current = userStats?._count.products || 0
          break
        case 'votes':
          current = userStats?._count.votes || 0
          break
        case 'likes':
          current = likesReceived
          break
        case 'follows':
          current = userStats?._count.following || 0
          break
        case 'user_follows':
          current = userFollows
          break
        case 'followers':
          current = followers
          break
        case 'registration_order':
          // Pioneer badge: 100% if eligible, 0% if not
          current = isPioneerEligible ? badgeConfig.threshold : 0
          break
        case 'first_game':
          // First Launch badge: progress is number of published games
          current = publishedGamesCount
          break
        default:
          current = 0
      }

      const pct = Math.min((current / badgeConfig.threshold) * 100, 100)
      
      // Special handling for Pioneer and First Launch badges
      let isUnlocked = false
      if (badgeConfig.code === 'PIONEER') {
        isUnlocked = isPioneerEligible
      } else if (badgeConfig.code === 'FIRST_LAUNCH') {
        isUnlocked = current >= badgeConfig.threshold
      } else {
        isUnlocked = earnedBadges.includes(badgeConfig.code as any) || current >= badgeConfig.threshold
      }

      return {
        code: badgeConfig.code,
        title: badgeConfig.title,
        emoji: badgeConfig.emoji,
        description: badgeConfig.description,
        threshold: badgeConfig.threshold,
        progress: { 
          current: Math.min(current, badgeConfig.threshold), 
          threshold: badgeConfig.threshold, 
          pct: Math.round(pct) 
        },
        xp: badgeConfig.xp,
        locked: !isUnlocked,
        claimable: false,
        unlockedAt: isUnlocked ? new Date().toISOString() : null
      }
    })

    // Sort badges: completed first (by unlock date desc), then locked badges
    const sortedBadges = badges.sort((a, b) => {
      // If both are unlocked, sort by unlock date (most recent first)
      if (!a.locked && !b.locked) {
        return new Date(b.unlockedAt || 0).getTime() - new Date(a.unlockedAt || 0).getTime()
      }
      // If only one is unlocked, unlocked comes first
      if (!a.locked && b.locked) return -1
      if (a.locked && !b.locked) return 1
      // If both are locked, maintain original order
      return 0
    })

    return NextResponse.json(sortedBadges)
  } catch (error) {
    console.error('[USER BADGES API] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}