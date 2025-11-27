import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ commentId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const { commentId } = await params

    const commentExists = await prisma.productComment.findUnique({
      where: { id: commentId },
      select: { id: true }
    })

    if (!commentExists) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 })
    }

    const result = await prisma.$transaction(async (tx) => {
      const existingVote = await tx.commentVote.findUnique({
        where: {
          userId_commentId: {
            userId: session.user.id,
            commentId
          }
        }
      })

      let isUpvoted = false

      if (existingVote) {
        await tx.commentVote.delete({
          where: { id: existingVote.id }
        })
        isUpvoted = false
      } else {
        await tx.commentVote.create({
          data: {
            userId: session.user.id,
            commentId,
            value: 1
          }
        })
        isUpvoted = true
      }

      const upvoteCount = await tx.commentVote.count({
        where: { commentId }
      })

      return { upvoteCount, isUpvoted }
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('[PRODUCT COMMENT][UPVOTE] error', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}






