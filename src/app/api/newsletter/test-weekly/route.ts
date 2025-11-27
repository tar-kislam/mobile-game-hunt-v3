import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { sendWeeklyTop5 } from '@/lib/newsletter'

const isValidEmail = (value?: string) => {
  if (!value || typeof value !== 'string') return false
  const trimmed = value.trim()
  if (!trimmed) return false
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(trimmed)
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  let manualEmails: string[] = []
  if (request.headers.get('content-type')?.includes('application/json')) {
    try {
      const body = await request.json()
      const collected: string[] = []
      if (body?.email && typeof body.email === 'string') {
        collected.push(body.email)
      }
      if (Array.isArray(body?.emails)) {
        collected.push(
          ...body.emails.filter((email: unknown): email is string => typeof email === 'string')
        )
      }
      manualEmails = Array.from(
        new Set(
          collected
            .filter((email) => isValidEmail(email))
            .map((email) => email.trim())
        )
      )
    } catch (error) {
      console.warn('[NEWSLETTER] Failed to parse test-weekly payload:', error)
    }
  }

  try {
    if (manualEmails.length > 0) {
      const aggregate = {
        attempted: 0,
        sent: 0,
        failed: 0,
        errors: [] as Array<{ email: string; error: string }>
      }

      for (const email of manualEmails) {
        try {
          const result = await sendWeeklyTop5({ testEmail: email })
          aggregate.attempted += result.attempted ?? 0
          aggregate.sent += result.sent ?? 0
          aggregate.failed += result.failed ?? 0
          if (Array.isArray(result.errors)) {
            aggregate.errors.push(...result.errors)
          }
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Unknown error'
          aggregate.failed += 1
          aggregate.errors.push({ email, error: message })
        }
      }

      return NextResponse.json({ ok: true, ...aggregate })
    }

    const result = await sendWeeklyTop5()
    return NextResponse.json({ ok: true, ...result })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}


