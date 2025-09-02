import { NextRequest, NextResponse } from 'next/server'
import redis from '@/lib/redis'

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
    const body = await req.json()
    const { gameId, amount, note } = body || {}
    if (!gameId || !amount || isNaN(Number(amount))) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }
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
    return NextResponse.json({ ok: true, pledge })
  } catch (e) {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}


