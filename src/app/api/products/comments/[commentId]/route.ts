import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { parseMentions, resolveMentions } from '@/lib/mentions'
import {
  productCommentInclude,
  serializeProductComment,
  type ProductCommentWithRelations
} from '@/lib/comments/product-comment-serializer'

const updateCommentSchema = z.object({
  content: z.string().min(1, 'Comment cannot be empty').max(1000, 'Comment too long'),
  status: z.enum(['visible', 'hidden', 'flagged']).optional()
})

async function getComment(commentId: string) {
  return prisma.productComment.findUnique({
    where: { id: commentId },
    include: {
      ...productCommentInclude,
      product: {
        select: {
          id: true,
          userId: true,
          slug: true
        }
      }
    }
  })
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ commentId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const { commentId } = await params
    const body = await request.json()
    const parsed = updateCommentSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? 'Invalid payload' },
        { status: 400 }
      )
    }

    const existingComment = await getComment(commentId)
    if (!existingComment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 })
    }

    const isAuthor = existingComment.userId === session.user.id
    const isAdmin = session.user.role === 'ADMIN'

    if (!isAuthor && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const mentionedUsernames = parseMentions(parsed.data.content)
    const mentionMap = await resolveMentions(mentionedUsernames)
    const mentionedUserIds = Array.from(new Set(mentionMap.values())).filter(
      (mentionId) => mentionId !== session.user.id
    )

    const updatedComment = await prisma.$transaction(async (tx) => {
      const updated = await tx.productComment.update({
        where: { id: commentId },
        data: {
          content: parsed.data.content,
          status: isAdmin && parsed.data.status ? parsed.data.status : undefined
        },
        include: productCommentInclude
      })

      await tx.productCommentMention.deleteMany({ where: { commentId } })

      if (mentionedUserIds.length > 0) {
        await tx.productCommentMention.createMany({
          data: mentionedUserIds.map((mentionedUserId) => ({
            commentId,
            mentionedUserId
          })),
          skipDuplicates: true
        })
      }

      return updated
    })

    const hasUpvoted = await prisma.commentVote.findFirst({
      where: {
        commentId,
        userId: session.user.id
      },
      select: { id: true }
    })

    const serialized = serializeProductComment(
      updatedComment as ProductCommentWithRelations,
      new Set(hasUpvoted ? [commentId] : [])
    )
    return NextResponse.json(serialized)
  } catch (error) {
    console.error('[PRODUCT COMMENT][PATCH] error', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ commentId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const { commentId } = await params
    const existingComment = await prisma.productComment.findUnique({
      where: { id: commentId },
      select: { id: true, userId: true }
    })

    if (!existingComment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 })
    }

    const isAuthor = existingComment.userId === session.user.id
    const isAdmin = session.user.role === 'ADMIN'

    if (!isAuthor && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await prisma.$transaction(async (tx) => {
      await tx.productComment.update({
        where: { id: commentId },
        data: {
          isDeleted: true,
          status: 'hidden',
          content: 'This comment was deleted.'
        }
      })

      await tx.productCommentMention.deleteMany({ where: { commentId } })
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[PRODUCT COMMENT][DELETE] error', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

