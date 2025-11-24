import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendSocialPromoEmail, getDisplayNameForUser } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'EDITOR')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const users = await prisma.user.findMany({
      select: {
        email: true,
        name: true,
        username: true
      }
    })

    const recipients = users.filter((user) => Boolean(user.email))

    const results = {
      total: recipients.length,
      sent: 0,
      failed: 0,
      errors: [] as string[]
    }

    const batchSize = 10

    for (let i = 0; i < recipients.length; i += batchSize) {
      const batch = recipients.slice(i, i + batchSize)

      await Promise.all(
        batch.map(async (user) => {
          const email = user.email as string
          const displayName = getDisplayNameForUser({ ...user, email })

          try {
            const result = await sendSocialPromoEmail(email, displayName)
            if (result.success) {
              results.sent++
            } else {
              results.failed++
              if (result.error) {
                results.errors.push(`${email}: ${result.error}`)
              }
            }
          } catch (error) {
            results.failed++
            const message = error instanceof Error ? error.message : 'Unknown error'
            results.errors.push(`${email}: ${message}`)
          }
        })
      )

      if (i + batchSize < recipients.length) {
        await new Promise((resolve) => setTimeout(resolve, 1500))
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Social promo email campaign completed',
      results: {
        total: results.total,
        sent: results.sent,
        failed: results.failed,
        errors: results.errors.slice(0, 10)
      }
    })
  } catch (error) {
    console.error('[SOCIAL PROMO EMAIL] campaign failed', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

