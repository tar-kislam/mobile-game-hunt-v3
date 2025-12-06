import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    // SECURITY: Require authentication
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      const { logSecurityEvent, extractIp, extractUserAgent } = await import('@/lib/security-monitor')
      await logSecurityEvent({
        type: 'UNAUTHORIZED_ACCESS',
        severity: 'medium',
        message: 'Unauthorized access attempt to Discord webhook endpoint',
        details: {},
        ip: extractIp(req),
        userAgent: extractUserAgent(req),
        path: '/api/discord',
      })
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const webhook = process.env.DISCORD_WEBHOOK_URL
    if (!webhook) {
      return NextResponse.json({ error: 'Webhook not configured' }, { status: 400 })
    }
    
    const payload = await req.json()
    
    // SECURITY: Validate payload size (prevent abuse)
    const payloadSize = JSON.stringify(payload).length
    if (payloadSize > 2000) { // Discord webhook limit is 2000 characters
      return NextResponse.json({ error: 'Payload too large' }, { status: 400 })
    }
    
    const res = await fetch(webhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(5000), // 5 second timeout
    })
    
    if (!res.ok) {
      const txt = await res.text()
      return NextResponse.json({ error: 'Discord error', details: txt }, { status: 502 })
    }
    return NextResponse.json({ ok: true })
  } catch (e) {
    if (e instanceof Error && e.name === 'TimeoutError') {
      return NextResponse.json({ error: 'Request timeout' }, { status: 408 })
    }
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}


