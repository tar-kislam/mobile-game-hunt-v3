import { NextRequest, NextResponse } from 'next/server'
import { redisClient } from '@/lib/redis'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

type BadgeType = 'EARLY_HUNTER' | 'TOP_VOTER' | 'EXPLORER' | 'BUILDER'

type UserBadges = {
  userId: string
  badges: BadgeType[]
}

const KEY = 'badges:users'

export async function GET() {
  try {
    const raw = await redisClient.get(KEY)
    const list: UserBadges[] = raw ? JSON.parse(raw) : []
    return NextResponse.json({ users: list })
  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions as any)
    if (!session || (session as any).user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const { userId, badge } = body || {}
    const upper = typeof badge === 'string' ? badge.toUpperCase() : ''
    const allowed: BadgeType[] = ['EARLY_HUNTER', 'TOP_VOTER', 'EXPLORER', 'BUILDER']
    if (!userId || !allowed.includes(upper as BadgeType)) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }

    const raw = await redisClient.get(KEY)
    const list: UserBadges[] = raw ? JSON.parse(raw) : []
    const existing = list.find(u => u.userId === userId)
    if (existing) {
      if (!existing.badges.includes(upper as BadgeType)) {
        existing.badges.push(upper as BadgeType)
      }
    } else {
      list.push({ userId, badges: [upper as BadgeType] })
    }
    await redisClient.set(KEY, JSON.stringify(list))
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}


