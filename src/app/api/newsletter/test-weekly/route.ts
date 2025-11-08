import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { sendWeeklyTop5 } from '@/lib/newsletter'

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  let testEmail: string | undefined
  try {
    if (request.headers.get('content-type')?.includes('application/json')) {
      const body = await request.json()
      if (body?.email && typeof body.email === 'string') {
        testEmail = body.email
      }
    }
  } catch (error) {
    console.warn('[NEWSLETTER] Failed to parse test-weekly payload:', error)
  }

  try {
    const result = await sendWeeklyTop5({ testEmail })
    return NextResponse.json({ ok: true, ...result })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}


