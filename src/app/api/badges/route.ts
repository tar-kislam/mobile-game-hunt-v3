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
    const badges = BADGE_CONFIG.map(badgeConfig => ({
      code: badgeConfig.code,
      title: badgeConfig.title,
      emoji: badgeConfig.emoji,
      description: badgeConfig.description,
      threshold: badgeConfig.threshold,
      progress: { current: 0, threshold: badgeConfig.threshold, pct: 0 },
      xp: badgeConfig.xp,
      locked: !earnedBadges.includes(badgeConfig.code as any),
      claimable: false,
      unlockedAt: null
    }))

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


