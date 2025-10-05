import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const postId = searchParams.get('postId')

    if (!postId) {
      return NextResponse.json({ error: 'Post ID is required' }, { status: 400 })
    }

    // Get post with poll data
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        poll: {
          include: {
            options: {
              include: {
                _count: {
                  select: { votes: true }
                }
              }
            }
          }
        }
      }
    })

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    if (!post.poll) {
      return NextResponse.json({ error: 'This post does not have a poll' }, { status: 400 })
    }

    const poll = post.poll
    const totalVotes = poll.options.reduce((sum, opt) => sum + opt._count.votes, 0)

    return NextResponse.json({
      options: poll.options.map(opt => ({
        id: opt.id,
        text: opt.text,
        votesCount: opt._count.votes,
        percentage: totalVotes > 0 ? Math.round((opt._count.votes / totalVotes) * 100) : 0
      })),
      totalVotes,
      isExpired: poll.expiresAt < new Date()
    })

  } catch (error) {
    console.error('Error fetching poll results:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
