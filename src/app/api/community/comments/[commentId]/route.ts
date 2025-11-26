import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { parseMentions, resolveMentions } from '@/lib/mentions'

const updateSchema = z.object({
  content: z.string().min(1).max(500).trim()
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ commentId: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { commentId } = await params

  try {
    const body = await request.json()
    const parsed = updateSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation error', details: parsed.error }, { status: 400 })
    }

    const { content } = parsed.data

    // Find comment
    const comment = await prisma.postComment.findUnique({
      where: { id: commentId },
      include: {
        post: {
          select: { id: true }
        }
      }
    })

    if (!comment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 })
    }

    // Check permissions: author can edit, admin can edit any
    const isAuthor = comment.userId === session.user.id
    const isAdmin = session.user.role === 'ADMIN'

    if (!isAuthor && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Parse new mentions
    const mentionedUsernames = parseMentions(content)
    const mentionMap = await resolveMentions(mentionedUsernames)
    const mentionedUserIds = Array.from(mentionMap.values())

    // Update comment
    const updated = await prisma.postComment.update({
      where: { id: commentId },
      data: {
        content,
        updatedAt: new Date()
      },
      include: {
        user: {
          select: { id: true, name: true, username: true, image: true }
        }
      }
    })

    // Update mentions: delete old, create new
    await prisma.commentMention.deleteMany({
      where: { commentId }
    })

    if (mentionedUserIds.length > 0) {
      await prisma.commentMention.createMany({
        data: mentionedUserIds.map((userId) => ({
          commentId,
          mentionedUserId: userId
        })),
        skipDuplicates: true
      })

      // Create notifications for new mentions (excluding comment author)
      const existingMentions = await prisma.commentMention.findMany({
        where: { commentId },
        select: { mentionedUserId: true }
      })
      const existingMentionIds = new Set(existingMentions.map((m) => m.mentionedUserId))

      const newMentionIds = mentionedUserIds.filter(
        (id) => id !== session.user.id && !existingMentionIds.has(id)
      )

      if (newMentionIds.length > 0) {
        await prisma.notification.createMany({
          data: newMentionIds.map((userId) => ({
            userId,
            type: 'MENTION_IN_COMMENT',
            message: `${session.user.name || 'Someone'} mentioned you in a comment`,
            postId: comment.postId,
            commentId,
            actorId: session.user.id,
            read: false
          }))
        })
      }
    }

    return NextResponse.json(updated)
  } catch (e) {
    console.error('[COMMENT][PATCH] error', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ commentId: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { commentId } = await params

  try {
    // Find comment
    const comment = await prisma.postComment.findUnique({
      where: { id: commentId }
    })

    if (!comment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 })
    }

    // Check permissions: author can soft-delete, admin can hard-delete
    const isAuthor = comment.userId === session.user.id
    const isAdmin = session.user.role === 'ADMIN'

    if (!isAuthor && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    if (isAdmin) {
      // Hard delete for admin
      await prisma.postComment.delete({
        where: { id: commentId }
      })
    } else {
      // Soft delete for author
      await prisma.postComment.update({
        where: { id: commentId },
        data: {
          isDeleted: true,
          content: 'This comment was deleted'
        }
      })
    }

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('[COMMENT][DELETE] error', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}






