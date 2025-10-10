import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const querySchema = z.object({
  preview: z.enum(['true', 'false']).optional().default('false'),
  limit: z.coerce.number().int().positive().optional(),
  cursor: z.string().optional(),
  order: z.enum(['latest', 'oldest']).optional().default('latest')
})

const bodySchema = z.object({
  content: z.string().min(1).max(500).trim(),
  parentId: z.string().optional()
})

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { searchParams } = new URL(request.url)
  const parsed = querySchema.safeParse({
    preview: searchParams.get('preview') ?? undefined,
    limit: searchParams.get('limit') ?? undefined,
    cursor: searchParams.get('cursor') ?? undefined,
    order: searchParams.get('order') ?? undefined
  })
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid query' }, { status: 400 })
  }
  const { preview, limit, cursor, order } = parsed.data
  const take = preview === 'true' ? (limit ?? 3) : (limit ?? 20)
  const orderBy = { createdAt: order === 'latest' ? 'desc' : 'asc' } as const

  try {
    const topLevel = await prisma.postComment.findMany({
      where: { postId: id, parentId: null },
      orderBy,
      take,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      include: {
        user: { select: { id: true, name: true, username: true, image: true } },
        _count: { select: { children: true } },
        ...(preview === 'true' ? {
          children: {
            take: 2,
            orderBy: { createdAt: 'desc' },
            include: { user: { select: { id: true, name: true, username: true, image: true } } }
          }
        } : {})
      }
    })

    const nextCursor = topLevel.length === take ? topLevel[topLevel.length - 1].id : null
    return NextResponse.json({ comments: topLevel, nextCursor })
  } catch (e) {
    console.error('[POST COMMENTS][GET] error', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { id } = await params

  try {
    const body = await request.json()
    const parsed = bodySchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation error' }, { status: 400 })
    }
    const { content, parentId } = parsed.data

    // Basic rate limit placeholder (per-user simple count last minute)
    // NOTE: Integrate Redis token bucket later if needed

    const created = await prisma.postComment.create({
      data: {
        postId: id,
        userId: session.user.id,
        content,
        parentId: parentId ?? null
      },
      include: { user: { select: { id: true, name: true, username: true, image: true } } }
    })

    return NextResponse.json(created, { status: 201 })
  } catch (e) {
    console.error('[POST COMMENTS][POST] error', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

