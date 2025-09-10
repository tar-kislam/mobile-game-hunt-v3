import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const postId = searchParams.get('postId') || ''
    if (!postId) return NextResponse.json({ comments: [] })

    const comments = await prisma.postComment.findMany({
      where: { postId },
      include: {
        user: { select: { id: true, name: true, image: true } }
      },
      orderBy: { createdAt: 'asc' }
    })

    return NextResponse.json({ comments })
  } catch (e) {
    console.error('Error fetching comments:', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const body = await request.json()
    const { postId, content } = body || {}
    if (!postId || !content || !content.trim()) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }

    const comment = await prisma.postComment.create({
      data: {
        postId,
        userId: session.user.id,
        content: content.trim(),
      },
      include: {
        user: { select: { id: true, name: true, image: true } }
      }
    })

    return NextResponse.json(comment, { status: 201 })
  } catch (e) {
    console.error('Error creating comment:', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


