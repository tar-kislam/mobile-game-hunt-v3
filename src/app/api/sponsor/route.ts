import { NextRequest, NextResponse } from 'next/server'
import redis from '@/lib/redis'

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
    const body = await req.json()
    const { gameId, slot, startsAt, endsAt } = body || {}
    if (!gameId || !slot || !startsAt || !endsAt) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }
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
    return NextResponse.json({ ok: true, sponsor: record })
  } catch (e) {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}


