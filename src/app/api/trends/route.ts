import { NextRequest, NextResponse } from 'next/server'
import redis from '@/lib/redis'

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
    const body = await req.json()
    const { title, url, tags } = body || {}
    if (!title) {
      return NextResponse.json({ error: 'Title required' }, { status: 400 })
    }
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


