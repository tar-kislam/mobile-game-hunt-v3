import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendNewGameEmail } from '@/lib/newsletter'

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
      if (Array.isArray(body?.emails)) {
        manualEmails = Array.from(
          new Set(
            body.emails
              .filter((email: unknown): email is string => typeof email === 'string' && isValidEmail(email))
              .map((email: string) => email.trim())
          )
        )
      }
    } catch (error) {
      console.warn('[NEWSLETTER] Failed to parse send-latest payload:', error)
    }
  }

  try {
    const latest = await prisma.product.findFirst({
      where: { status: 'PUBLISHED' as const },
      orderBy: { createdAt: 'desc' },
      select: {
        title: true,
        tagline: true,
        description: true,
        thumbnail: true,
        image: true,
        slug: true,
      },
    })

    if (!latest) {
      return NextResponse.json({ error: 'No published games found' }, { status: 404 })
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://mobilegamehunt.com'
    const payload = {
      title: latest.title,
      shortPitch: latest.tagline || latest.description,
      thumbnail: latest.thumbnail || latest.image || undefined,
      link: `${baseUrl}/product/${latest.slug}`,
    }

    if (manualEmails.length > 0) {
      const aggregate = {
        attempted: 0,
        sent: 0,
        failed: 0,
        errors: [] as Array<{ email: string; error: string }>
      }

      for (const email of manualEmails) {
        try {
          const result = await sendNewGameEmail(payload, { testEmail: email })
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

      return NextResponse.json({ ok: true, result: aggregate })
    }

    const result = await sendNewGameEmail(payload)

    return NextResponse.json({ ok: true, result })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}


