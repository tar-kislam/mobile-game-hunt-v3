import { NextRequest, NextResponse } from 'next/server'
import redis from '@/lib/redis'
import { z } from 'zod'
import { rateLimit } from '@/lib/rate-limit'

type TrendItem = {
  id: string
  title: string
  url?: string
  tags?: string[]
  createdAt: number
}

const KEY = 'trends:items'

export async function GET() {
  try {
    const raw = await redis.get(KEY)
    const items: TrendItem[] = raw ? JSON.parse(raw) : []
    return NextResponse.json({ items })
  } catch (e) {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || 'ip:unknown'
    const rl = await rateLimit(`trends:post:${ip}`, 10, 60)
    if (!rl.allowed) return NextResponse.json({ error: 'Rate limit' }, { status: 429 })
    const schema = z.object({
      title: z.string().min(2),
      url: z.string().url().optional(),
      tags: z.array(z.string()).max(8).optional()
    })
    const parsed = schema.safeParse(await req.json())
    if (!parsed.success) return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    const { title, url, tags } = parsed.data
    const item: TrendItem = {
      id: `${Date.now()}:${Math.random().toString(36).slice(2, 8)}`,
      title,
      url,
      tags: Array.isArray(tags) ? tags.slice(0, 8) : undefined,
      createdAt: Date.now(),
    }
    const raw = await redis.get(KEY)
    const items: TrendItem[] = raw ? JSON.parse(raw) : []
    await redis.set(KEY, JSON.stringify([item, ...items]))
    return NextResponse.json({ ok: true, item })
  } catch (e) {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}


