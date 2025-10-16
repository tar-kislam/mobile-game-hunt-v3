import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { resolveUserId } from '@/lib/userUtils'

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

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Resolve the actual database user ID
    const userId = await resolveUserId(session.user)
    if (!userId) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Fallback for when badge service is not available
    let earnedBadges: string[] = []
    try {
      const { getUserBadges } = await import('@/lib/badgeService')
      earnedBadges = await getUserBadges(userId)
    } catch (error) {
      console.warn('[BADGES API] Badge service not available, using fallback:', error)
      earnedBadges = [] // Fallback to empty array
    }

    // Get user stats for progress calculation
    const userStats = await prisma.user.findUnique({
      where: { id: userId },
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

    // Get follow counts for Explorer and Rising Star badges
    const userFollows = await prisma.follow.count({
      where: { followerId: userId }
    })

    const followers = await prisma.follow.count({
      where: { followingId: userId }
    })

    // Count likes received on user's products
    const likesReceived = await prisma.vote.count({
      where: {
        product: {
          userId: userId
        }
      }
    })

    // Check Pioneer badge eligibility
    const isPioneerEligible = await prisma.user.findUnique({
      where: { id: userId },
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

    // Get published games count for First Launch badge
    const publishedGamesCount = await prisma.product.count({
      where: {
        userId: userId,
        status: 'PUBLISHED'
      }
    })

    const badges = BADGE_CONFIG.map(badgeConfig => {
      let current = 0
      
      // Calculate current progress based on badge type
      switch (badgeConfig.type) {
        case 'comments':
          current = userStats?._count.comments || 0
          break
        case 'games':
          // For Fire Dragon badge, only count PUBLISHED games
          current = publishedGamesCount
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
          // First Launch badge: use pre-calculated published games count
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
        // First Launch badge: unlocked if user has published at least 1 game
        isUnlocked = current >= badgeConfig.threshold
      } else {
        isUnlocked = earnedBadges.includes(badgeConfig.code as any)
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
        unlockedAt: isUnlocked ? new Date().toISOString() : null,
        isCompleted: isUnlocked
      }
    })

    // Sort badges: completed first (by completion date), then incomplete
    const sortedBadges = badges.sort((a, b) => {
      // If both are completed, sort by completion date (latest first)
      if (a.isCompleted && b.isCompleted) {
        return new Date(b.unlockedAt || 0).getTime() - new Date(a.unlockedAt || 0).getTime()
      }
      // If only one is completed, completed one comes first
      if (a.isCompleted && !b.isCompleted) return -1
      if (!a.isCompleted && b.isCompleted) return 1
      // If neither is completed, maintain original order
      return 0
    })

    return NextResponse.json(sortedBadges)
  } catch (error) {
    console.error('[BADGES API] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session as any).user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const { userId, badge } = body || {}
    
    if (!userId || !badge) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }

    let success = false
    try {
      const { awardBadge } = await import('@/lib/badgeService')
      success = await awardBadge(userId, badge)
    } catch (error) {
      console.warn('[BADGES API] Badge service not available for awarding:', error)
      success = false
    }
    
    if (success) {
      return NextResponse.json({ ok: true })
    } else {
      return NextResponse.json({ error: 'Badge already exists' }, { status: 400 })
    }
  } catch (e) {
    console.error('[BADGES API] Error:', e)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}


