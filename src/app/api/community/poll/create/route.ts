import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { rateLimit } from '@/lib/rate-limit'
import { z } from 'zod'

const createPollSchema = z.object({
  postId: z.string().min(1, 'Post ID is required'),
  question: z.string().min(1, 'Question is required').max(100, 'Question too long (max 100 characters)'),
  options: z.array(z.object({
    text: z.string().min(1, 'Option text is required').max(50, 'Option too long (max 50 characters)')
  })).min(2, 'At least 2 options required').max(4, 'Maximum 4 options allowed'),
  expiresAt: z.string().datetime('Invalid expiration date')
})

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'ip:unknown'
    const rl = await rateLimit(`poll:create:${ip}`, 5, 60) // 5 polls per minute
    if (!rl.allowed) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
    }

    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const body = await request.json()
    const { postId, question, options, expiresAt } = createPollSchema.parse(body)
    const userId = session.user.id

    // Verify the post exists and belongs to the user
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { id: true, userId: true, pollId: true }
    })

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    if (post.userId !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    if (post.pollId) {
      return NextResponse.json({ error: 'Post already has a poll' }, { status: 400 })
    }

    // Create the poll with options
    const poll = await prisma.poll.create({
      data: {
        question,
        expiresAt: new Date(expiresAt),
        options: {
          create: options.map(option => ({
            text: option.text
          }))
        }
      },
      include: {
        options: true
      }
    })

    // Link the poll to the post
    await prisma.post.update({
      where: { id: postId },
      data: { pollId: poll.id }
    })

    return NextResponse.json({
      message: 'Poll created successfully',
      poll: {
        id: poll.id,
        question: poll.question,
        expiresAt: poll.expiresAt,
        options: poll.options.map(option => ({
          id: option.id,
          text: option.text,
          votesCount: 0
        }))
      }
    })

  } catch (error) {
    console.error('Error creating poll:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
