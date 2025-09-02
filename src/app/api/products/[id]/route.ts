import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { sendMail } from '@/lib/mail'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const schema = z.object({ releaseAt: z.string().datetime().nullable() })
    const parsed = schema.safeParse(await req.json())
    if (!parsed.success) return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    const before = await prisma.product.findUnique({ where: { id }, select: { releaseAt: true, title: true, followUsers: { include: { user: true } } } })
    const updated = await prisma.product.update({ where: { id }, data: { releaseAt: parsed.data.releaseAt ? new Date(parsed.data.releaseAt) : null } })
    if (before?.releaseAt?.toISOString() !== updated.releaseAt?.toISOString()) {
      // notify followers (best-effort)
      const followers = before?.followUsers || []
      const to = process.env.NOTIFY_EMAIL
      if (to) {
        void sendMail({ to, subject: 'Release date changed', html: `<p>${before?.title} new date: ${updated.releaseAt}</p>` })
      }
      for (const f of followers) {
        const email = (f as any).user?.email
        if (email) void sendMail({ to: email, subject: 'Release date updated', html: `<p>${before?.title} new date: ${updated.releaseAt}</p>` })
      }
    }
    return NextResponse.json({ ok: true, product: updated })
  } catch (e) {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const product = await prisma.product.findUnique({
      where: {
        id: id,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },

        _count: {
          select: {
            votes: true,
            comments: true,
          },
        },
      },
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(product)
  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
