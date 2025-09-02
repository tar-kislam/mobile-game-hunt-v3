import { NextRequest, NextResponse } from 'next/server'
import redis from '@/lib/redis'
import { z } from 'zod'
import { rateLimit } from '@/lib/rate-limit'
import { sendMail } from '@/lib/mail'

type Pledge = {
  id: string
  gameId: string
  userId?: string | null
  amount: number
  note?: string
  createdAt: number
}

function key(gameId?: string) {
  return gameId ? `pledge:${gameId}` : 'pledge:all'
}

export async function GET(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || 'ip:unknown'
    const rl = await rateLimit(`pledge:get:${ip}`, 60, 60)
    if (!rl.allowed) return NextResponse.json({ error: 'Rate limit' }, { status: 429 })
    const { searchParams } = new URL(req.url)
    const gameId = searchParams.get('gameId') || undefined
    const raw = await redis.get(key(gameId))
    const pledges: Pledge[] = raw ? JSON.parse(raw) : []
    const total = pledges.reduce((sum, p) => sum + p.amount, 0)
    return NextResponse.json({ pledges, total })
  } catch (e) {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || 'ip:unknown'
    const rl = await rateLimit(`pledge:post:${ip}`, 10, 60)
    if (!rl.allowed) return NextResponse.json({ error: 'Rate limit' }, { status: 429 })
    const schema = z.object({
      gameId: z.string().min(1),
      amount: z.number().positive(),
      note: z.string().max(500).optional()
    })
    const parsed = schema.safeParse(await req.json())
    if (!parsed.success) return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    const { gameId, amount, note } = parsed.data
    const pledge: Pledge = {
      id: `${gameId}:${Date.now()}:${Math.random().toString(36).slice(2, 8)}`,
      gameId,
      userId: null,
      amount: Number(amount),
      note,
      createdAt: Date.now(),
    }
    const raw = await redis.get(key(gameId))
    const pledges: Pledge[] = raw ? JSON.parse(raw) : []
    const updated = [pledge, ...pledges]
    await redis.set(key(gameId), JSON.stringify(updated))
    // best-effort email
    const to = process.env.NOTIFY_EMAIL
    if (to) {
      void sendMail({ to, subject: 'New pledge received', html: `<p>${gameId}: $${amount}</p>` })
    }
    return NextResponse.json({ ok: true, pledge })
  } catch (e) {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}


