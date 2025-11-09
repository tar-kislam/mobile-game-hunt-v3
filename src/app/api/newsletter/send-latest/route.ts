import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendNewGameEmail } from '@/lib/newsletter'

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
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
    const result = await sendNewGameEmail({
      title: latest.title,
      shortPitch: latest.tagline || latest.description,
      thumbnail: latest.thumbnail || latest.image || undefined,
      link: `${baseUrl}/product/${latest.slug}`,
    })

    return NextResponse.json({ ok: true, result })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}


