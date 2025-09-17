import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

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
  }
]

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user exists - try by ID first, then by email if needed
    let user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        _count: {
          select: {
            products: true,
            votes: true,
            comments: true,
            gameFollows: true
          }
        }
      }
    })

    // If user not found by ID, try by email (for OAuth users)
    if (!user && session.user.email) {
      user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: {
          id: true,
          _count: {
            select: {
              products: true,
              votes: true,
              comments: true,
              gameFollows: true
            }
          }
        }
      })
    }

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const userStats = user

    // Get likes received on user's products
    const likesReceived = await prisma.vote.count({
      where: {
        product: {
          userId: user.id
        }
      }
    })

    // Get user's earned badges from Redis
    const { getUserBadges } = await import('@/lib/badgeService')
    const earnedBadges = await getUserBadges(user.id)

    // Calculate progress for each badge
    const badges = BADGE_CONFIG.map(badgeConfig => {
      let current = 0
      
      switch (badgeConfig.type) {
        case 'comments':
          current = userStats._count.comments
          break
        case 'games':
          current = userStats._count.products
          break
        case 'votes':
          current = userStats._count.votes
          break
        case 'likes':
          current = likesReceived
          break
        case 'follows':
          current = userStats._count.gameFollows
          break
      }

      const pct = Math.min((current / badgeConfig.threshold) * 100, 100)
      const isEarned = earnedBadges.includes(badgeConfig.code as any)
      const locked = !isEarned
      const claimable = !isEarned && current >= badgeConfig.threshold

      return {
        code: badgeConfig.code,
        title: badgeConfig.title,
        emoji: badgeConfig.emoji,
        description: badgeConfig.description,
        threshold: badgeConfig.threshold,
        progress: {
          current,
          threshold: badgeConfig.threshold,
          pct
        },
        xp: badgeConfig.xp,
        locked,
        claimable,
        unlockedAt: isEarned ? new Date().toISOString() : null
      }
    })

    return NextResponse.json(badges)
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

    const { awardBadge } = await import('@/lib/badgeService')
    const success = await awardBadge(userId, badge)
    
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


