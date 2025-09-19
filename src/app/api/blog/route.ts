import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  excerpt: z.string().min(1).optional().default(''),
  content: z.string().min(1),
  thumbnail: z.string().optional().transform(v => (v && v.length ? v : undefined)),
  thumbnailUrl: z.string().optional().transform(v => (v && v.length ? v : undefined)),
  coverImage: z.string().optional().transform(v => (v && v.length ? v : undefined)),
  coverImageUrl: z.string().optional().transform(v => (v && v.length ? v : undefined)),
  tags: z.array(z.string()).optional().default([]),
  status: z.enum(['draft','published']).optional().default('draft')
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const q = searchParams.get('q')?.trim() || ''

    const where = q
      ? {
          OR: [
            { title: { contains: q, mode: 'insensitive' as const } },
            { tags: { has: q } },
          ],
        }
      : {}

    const posts = await prisma.blogPost.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        thumbnail: true,
        thumbnailUrl: true,
        coverImage: true,
        coverImageUrl: true,
        tags: true,
        status: true,
        createdAt: true,
      }
    })

    return NextResponse.json({ ok: true, data: posts })
  } catch (error) {
    console.error('GET /api/blog error:', error)
    return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const role = (session?.user as any)?.role
    if (!session?.user?.id || !(role === 'ADMIN' || role === 'EDITOR')) {
      return NextResponse.json({ ok: false, error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json().catch(() => null)
    const parsed = createSchema.safeParse(body)
    if (!parsed.success) {
      console.warn('POST /api/blog invalid payload:', parsed.error?.flatten?.() || body)
      return NextResponse.json({ ok: false, error: 'Invalid payload' }, { status: 400 })
    }

    if (!(prisma as any).blogPost) {
      console.error('POST /api/blog fatal: prisma.blogPost is undefined. Did you run prisma generate?')
      return NextResponse.json({ ok: false, error: 'Server not ready' }, { status: 500 })
    }

    const { title, slug, excerpt, content, thumbnail, thumbnailUrl, coverImage, coverImageUrl, tags, status } = parsed.data

    const created = await prisma.blogPost.create({
      data: {
        title, slug, excerpt, content, thumbnail, thumbnailUrl, coverImage, coverImageUrl, tags, status,
        authorId: (session.user as any).id,
      },
      select: { id: true, slug: true, status: true }
    })

    return NextResponse.json({ ok: true, data: created }, { status: 201 })
  } catch (error: any) {
    if (error?.code === 'P2002') {
      return NextResponse.json({ ok: false, error: 'Slug already exists' }, { status: 409 })
    }
    console.error('POST /api/blog error:', error?.message || error, error?.stack)
    return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 })
  }
}
