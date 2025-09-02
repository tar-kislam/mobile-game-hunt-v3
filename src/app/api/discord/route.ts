import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const webhook = process.env.DISCORD_WEBHOOK_URL
    if (!webhook) {
      return NextResponse.json({ error: 'Webhook not configured' }, { status: 400 })
    }
    const payload = await req.json()
    const res = await fetch(webhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    if (!res.ok) {
      const txt = await res.text()
      return NextResponse.json({ error: 'Discord error', details: txt }, { status: 502 })
    }
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}


