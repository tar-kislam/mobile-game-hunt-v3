import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const notifSchema = z.object({
  notificationsEnabled: z.boolean().optional(),
  marketingOptIn: z.boolean().optional(),
})

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const parsed = notifSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
    }

    const updated = await prisma.user.update({
      where: { id: session.user.id },
      data: parsed.data,
      select: { notificationsEnabled: true, marketingOptIn: true }
    })

    return NextResponse.json({ ok: true, settings: updated })
  } catch (e) {
    console.error('Notifications update error:', e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}


