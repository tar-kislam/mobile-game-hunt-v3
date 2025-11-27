import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const newsletterModel = (prisma as any).newsletterSubscription
    if (!newsletterModel) {
      return NextResponse.json([])
    }

    const testRecipients = await newsletterModel.findMany({
      where: {
        isActive: true,
        source: 'test'
      },
      select: {
        id: true,
        email: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(
      testRecipients.map((recipient: { id: string; email: string; createdAt: Date }) => ({
        id: recipient.id,
        email: recipient.email,
        createdAt: recipient.createdAt?.toISOString?.() ?? new Date().toISOString()
      }))
    )
  } catch (error) {
    console.error('[TEST EMAILS] Failed to fetch test recipients', error)
    return NextResponse.json({ error: 'Failed to load test recipients' }, { status: 500 })
  }
}

