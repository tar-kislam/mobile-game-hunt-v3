import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const id = params?.id

    if (!id) {
      return NextResponse.json({ error: 'Missing subscriber id' }, { status: 400 })
    }

    if (!(prisma as any).newsletterSubscription) {
      return NextResponse.json({ error: 'NewsletterSubscription model unavailable' }, { status: 500 })
    }

    await (prisma as any).newsletterSubscription.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return NextResponse.json({ error: 'Subscriber not found' }, { status: 404 })
      }
      if (['P2022', 'P2010', 'P2011', 'P2021'].includes(error.code)) {
        console.warn('[NEWSLETTER][DELETE] schema mismatch detected.', error.message)
        return NextResponse.json({ error: 'Newsletter subscription schema missing' }, { status: 500 })
      }
    }

    console.error('[NEWSLETTER][DELETE] failed', error)
    return NextResponse.json({ error: 'Failed to delete subscriber' }, { status: 500 })
  }
}


