import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const updateSchema = z.object({
  title: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  excerpt: z.string().min(1).optional(),
  content: z.string().min(1).optional(),
  thumbnail: z.string().url().optional().or(z.literal('').transform(() => undefined)),
  tags: z.array(z.string()).optional(),
})

export async function GET(_request: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const post = await prisma.blogPost.findUnique({
      where: { slug: params.slug },
    })
    if (!post) return NextResponse.json({ ok: false, error: 'Not found' }, { status: 404 })
    return NextResponse.json({ ok: true, data: post })
  } catch (error) {
    console.error('GET /api/blog/[slug] error:', error)
    return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const session = await getServerSession(authOptions)
    const role = (session?.user as any)?.role
    if (!session?.user?.id || !(role === 'ADMIN' || role === 'EDITOR')) {
      return NextResponse.json({ ok: false, error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json().catch(() => null)
    const parsed = updateSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: 'Invalid payload' }, { status: 400 })
    }

    const updated = await prisma.blogPost.update({
      where: { slug: params.slug },
      data: parsed.data,
    })
    return NextResponse.json({ ok: true, data: updated })
  } catch (error: any) {
    if (error?.code === 'P2025') {
      return NextResponse.json({ ok: false, error: 'Not found' }, { status: 404 })
    }
    if (error?.code === 'P2002') {
      return NextResponse.json({ ok: false, error: 'Slug already exists' }, { status: 409 })
    }
    console.error('PUT /api/blog/[slug] error:', error)
    return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const session = await getServerSession(authOptions)
    const role = (session?.user as any)?.role
    if (!session?.user?.id || !(role === 'ADMIN' || role === 'EDITOR')) {
      return NextResponse.json({ ok: false, error: 'Forbidden' }, { status: 403 })
    }

    await prisma.blogPost.delete({ where: { slug: params.slug } })
    return NextResponse.json({ ok: true })
  } catch (error: any) {
    if (error?.code === 'P2025') {
      return NextResponse.json({ ok: false, error: 'Not found' }, { status: 404 })
    }
    console.error('DELETE /api/blog/[slug] error:', error)
    return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 })
  }
}
