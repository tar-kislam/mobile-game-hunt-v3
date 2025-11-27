import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendUserFeedbackEmail } from '@/lib/email'

const isValidEmail = (value?: string) => {
  if (!value || typeof value !== 'string') return false
  const trimmed = value.trim()
  if (!trimmed) return false
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(trimmed)
}

// POST /api/admin/users/feedback-email
// Sends a short feedback-request email to all users with an email address.
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    let customEmails: string[] = []
    if (request.headers.get('content-type')?.includes('application/json')) {
      try {
        const body = await request.json()
        if (Array.isArray(body?.emails)) {
          customEmails = Array.from(
            new Set(
              body.emails
                .filter((email: unknown): email is string => typeof email === 'string' && isValidEmail(email))
                .map((email: string) => email.trim())
            )
          )
        }
      } catch (error) {
        console.warn('[USER FEEDBACK EMAIL] Failed to parse payload:', error)
      }
    }

    // Fetch all users (email is required in schema, but we filter defensively in JS)
    let users = await prisma.user.findMany({
      select: {
        email: true,
        name: true,
        username: true,
      },
      where: customEmails.length > 0 ? { email: { in: customEmails } } : undefined,
    })

    const validUsers = customEmails.length
      ? customEmails.map((email) => {
          const match = users.find((u) => u.email === email)
          if (match && match.email) {
            return match
          }
          return { email, name: null, username: null }
        })
      : users.filter((u) => !!u.email)

    const results = {
      total: validUsers.length,
      sent: 0,
      failed: 0,
      errors: [] as string[],
    }

    const batchSize = 5

    for (let i = 0; i < validUsers.length; i += batchSize) {
      const batch = validUsers.slice(i, i + batchSize)

      const batchPromises = batch.map(async (user) => {
        const email = user.email as string
        const displayName =
          user.name && user.name.trim().length > 0
            ? user.name
            : user.username && user.username.trim().length > 0
            ? user.username
            : email.split('@')[0]

        try {
          console.log(`[USER FEEDBACK EMAIL] Sending to: ${email}`)
          const result = await sendUserFeedbackEmail(email, displayName)
          if (result.success) {
            results.sent++
            console.log(`[USER FEEDBACK EMAIL] ✅ Sent to: ${email}`)
          } else {
            results.failed++
            results.errors.push(`${email}: ${result.error}`)
            console.warn(`[USER FEEDBACK EMAIL] ❌ Failed for: ${email} - ${result.error}`)
          }
        } catch (error) {
          results.failed++
          const errorMsg = error instanceof Error ? error.message : 'Unknown error'
          results.errors.push(`${email}: ${errorMsg}`)
          console.warn(`[USER FEEDBACK EMAIL] ❌ Error for: ${email} - ${errorMsg}`)
        }
      })

      await Promise.all(batchPromises)

      if (i + batchSize < validUsers.length) {
        // Small pause between batches
        await new Promise((resolve) => setTimeout(resolve, 1500))
      }
    }

    return NextResponse.json({
      success: true,
      message: 'User feedback email campaign completed',
      results: {
        total: results.total,
        sent: results.sent,
        failed: results.failed,
        errors: results.errors.slice(0, 10),
      },
    })
  } catch (error) {
    console.error('[USER FEEDBACK EMAIL] Campaign failed:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    )
  }
}


