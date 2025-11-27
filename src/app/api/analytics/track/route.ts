import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

type TrackPayload = {
  path?: string
  pageType?: string
  referrer?: string | null
  durationSeconds?: number
  sessionId?: string
  userAgent?: string | null
  country?: string | null
}

const isValidTrackPayload = (payload: TrackPayload) => {
  if (!payload) return false
  if (!payload.path || typeof payload.path !== 'string') return false
  if (!payload.sessionId || typeof payload.sessionId !== 'string') return false
  if (typeof payload.durationSeconds !== 'number' || Number.isNaN(payload.durationSeconds)) return false
  return true
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || !session.user.role) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { role } = session.user
    if (role === 'ADMIN' || role === 'EDITOR') {
      // Do not track staff/editorial visits
      return NextResponse.json({ success: true, ignored: true })
    }

    const payload = (await request.json().catch(() => null)) as TrackPayload | null

    if (!isValidTrackPayload(payload)) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }

    await prisma.userActivityEvent.create({
      data: {
        userId: session.user.id,
        sessionId: payload!.sessionId!,
        path: payload!.path!,
        pageType: payload?.pageType,
        referrer: payload?.referrer || null,
        durationSeconds: Math.max(0, payload?.durationSeconds ?? 0),
        userAgent: payload?.userAgent || request.headers.get('user-agent') || null,
        country: payload?.country || request.headers.get('x-vercel-ip-country') || null
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[ANALYTICS][TRACK] Failed to record activity', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

