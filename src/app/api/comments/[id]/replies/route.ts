import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const querySchema = z.object({
  limit: z.coerce.number().int().positive().optional().default(20),
  cursor: z.string().optional(),
  order: z.enum(['latest', 'oldest']).optional().default('latest')
})

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { searchParams } = new URL(request.url)
  const parsed = querySchema.safeParse({
    limit: searchParams.get('limit') ?? undefined,
    cursor: searchParams.get('cursor') ?? undefined,
    order: searchParams.get('order') ?? undefined
  })
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid query' }, { status: 400 })
  }
  const { limit, cursor, order } = parsed.data

  try {
    const replies = await prisma.postComment.findMany({
      where: { parentId: id },
      orderBy: { createdAt: order === 'latest' ? 'desc' : 'asc' },
      take: limit,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      include: { user: { select: { id: true, name: true, username: true, image: true } } }
    })

    const nextCursor = replies.length === limit ? replies[replies.length - 1].id : null
    return NextResponse.json({ replies, nextCursor })
  } catch (e) {
    console.error('[COMMENT REPLIES][GET] error', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

