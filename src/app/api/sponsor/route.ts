import { NextRequest, NextResponse } from 'next/server'
import redis from '@/lib/redis'
import { z } from 'zod'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { rateLimit } from '@/lib/rate-limit'

type SponsorRecord = {
  id: string
  gameId: string
  slot: string
  startsAt: number
  endsAt: number
  createdAt: number
}

const KEY_ALL = 'sponsor:all'

export async function GET(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || 'ip:unknown'
    const rl = await rateLimit(`sponsor:get:${ip}`, 60, 60)
    if (!rl.allowed) return NextResponse.json({ error: 'Rate limit' }, { status: 429 })
    const { searchParams } = new URL(req.url)
    const gameId = searchParams.get('gameId')
    const now = Date.now()
    const raw = await redis.get(KEY_ALL)
    const list: SponsorRecord[] = raw ? JSON.parse(raw) : []
    const active = list.filter(r => now >= r.startsAt && now <= r.endsAt)
    if (gameId) {
      const forGame = active.find(r => r.gameId === gameId)
      return NextResponse.json({ sponsored: Boolean(forGame), sponsor: forGame || null })
    }
    return NextResponse.json({ sponsors: active })
  } catch (e) {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions as any)
    if (!session || (session as any).user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    const schema = z.object({
      gameId: z.string().min(1),
      slot: z.string().min(1),
      startsAt: z.number().int().positive(),
      endsAt: z.number().int().positive()
    })
    const parse = schema.safeParse(await req.json())
    if (!parse.success) return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    const { gameId, slot, startsAt, endsAt } = parse.data
    const record: SponsorRecord = {
      id: `${gameId}:${slot}:${startsAt}`,
      gameId,
      slot: String(slot),
      startsAt: Number(startsAt),
      endsAt: Number(endsAt),
      createdAt: Date.now(),
    }
    const raw = await redis.get(KEY_ALL)
    const list: SponsorRecord[] = raw ? JSON.parse(raw) : []
    const updated = [record, ...list.filter(r => r.id !== record.id)]
    await redis.set(KEY_ALL, JSON.stringify(updated))
    try {
      const to = process.env.NOTIFY_EMAIL
      if (to) {
        const { sendMail } = await import('@/lib/mail')
        void sendMail({ to, subject: 'Sponsor approved', html: `<p>Game ${gameId} approved for slot ${slot}</p>` })
      }
    } catch {}
    return NextResponse.json({ ok: true, sponsor: record })
  } catch (e) {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}


