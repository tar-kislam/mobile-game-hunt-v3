import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { Prisma } from '@prisma/client'
import { parseMentions, resolveMentions } from '@/lib/mentions'

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

const COMMENT_PAGE_SIZE = 20
const MAX_REPLY_DEPTH = 4

const commentInclude = {
  user: {
    select: { id: true, name: true, username: true, image: true }
  }
}

type PostCommentWithUser = Prisma.PostCommentGetPayload<{
  include: typeof commentInclude
}>

interface CommentTreeNode extends PostCommentWithUser {
  replies: CommentTreeNode[]
}

// Rate limiting: max 10 comments per minute per user
const RATE_LIMIT_COMMENTS_PER_MINUTE = 10

async function checkRateLimit(userId: string): Promise<{ allowed: boolean; resetAt?: Date }> {
  const oneMinuteAgo = new Date(Date.now() - 60 * 1000)
  const recentComments = await prisma.postComment.count({
    where: {
      userId,
      createdAt: { gte: oneMinuteAgo }
    }
  })

  if (recentComments >= RATE_LIMIT_COMMENTS_PER_MINUTE) {
    return { allowed: false, resetAt: new Date(Date.now() + 60 * 1000) }
  }

  return { allowed: true }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: postId } = await params
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
  const take = preview === 'true' ? (limit ?? 3) : (limit ?? COMMENT_PAGE_SIZE)
  const orderBy = { createdAt: order === 'latest' ? 'desc' : 'asc' } as const

  try {
    const topLevel = await prisma.postComment.findMany({
      where: {
        postId,
        parentId: null,
        isDeleted: false,
        status: 'visible'
      },
      orderBy,
      take,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      include: commentInclude
    })

    const topLevelIds = topLevel.map((comment) => comment.id)
    const replies = await fetchRepliesRecursively(postId, topLevelIds)
    const commentTree = buildCommentTree(topLevel, replies)

    const nextCursor = topLevel.length === take ? topLevel[topLevel.length - 1].id : null
    return NextResponse.json({ comments: commentTree, nextCursor })
  } catch (e) {
    console.error('[POST COMMENTS][GET] error', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id: postId } = await params

  try {
    // Rate limiting
    const rateLimit = await checkRateLimit(session.user.id)
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          message: 'Too many comments. Please wait a moment before commenting again.',
          resetAt: rateLimit.resetAt?.toISOString()
        },
        { status: 429 }
      )
    }

    const body = await request.json()
    const parsed = bodySchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation error', details: parsed.error }, { status: 400 })
    }

    const { content, parentId } = parsed.data

    // Verify post exists
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        user: {
          select: { id: true, name: true }
        }
      }
    })

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    // If parentId provided, verify parent comment exists
    let parentComment = null
    if (parentId) {
      parentComment = await prisma.postComment.findUnique({
        where: { id: parentId },
        include: {
          user: {
            select: { id: true, name: true }
          }
        }
      })

      if (!parentComment) {
        return NextResponse.json({ error: 'Parent comment not found' }, { status: 404 })
      }

      if (parentComment.postId !== postId) {
        return NextResponse.json({ error: 'Parent comment does not belong to this post' }, { status: 400 })
      }
    }

    // Parse mentions
    const mentionedUsernames = parseMentions(content)
    const mentionMap = await resolveMentions(mentionedUsernames)

    // Create comment
    const created = await prisma.postComment.create({
      data: {
        postId,
        userId: session.user.id,
        content,
        parentId: parentId ?? null
      },
      include: {
        user: {
          select: { id: true, name: true, username: true, image: true }
        }
      }
    })

    // Create mentions
    const mentionedUserIds = Array.from(mentionMap.values())
    if (mentionedUserIds.length > 0) {
      await prisma.commentMention.createMany({
        data: mentionedUserIds.map((userId) => ({
          commentId: created.id,
          mentionedUserId: userId
        })),
        skipDuplicates: true
      })
    }

    // Track all notified users to avoid duplicates
    const notifiedUserIds = new Set<string>()
    // Always exclude the comment author
    notifiedUserIds.add(session.user.id)

    // Create notifications
    const notificationsToCreate = []

    // 1. Notify post author if it's a top-level comment and not by the author
    if (!parentId && post.userId !== session.user.id) {
      notificationsToCreate.push({
        userId: post.userId,
        type: 'COMMENT_ON_POST',
        message: `${session.user.name || 'Someone'} commented on your post`,
        postId,
        commentId: created.id,
        actorId: session.user.id,
        read: false
      })
      notifiedUserIds.add(post.userId)
    }

    // 2. Notify parent comment author if it's a reply and not by the same user
    if (parentId && parentComment && parentComment.userId !== session.user.id) {
      notificationsToCreate.push({
        userId: parentComment.userId,
        type: 'REPLY_TO_COMMENT',
        message: `${session.user.name || 'Someone'} replied to your comment`,
        postId,
        commentId: created.id,
        actorId: session.user.id,
        read: false
      })
      notifiedUserIds.add(parentComment.userId)
    }

    // 3. Notify mentioned users (excluding comment author and already notified users)
    // Iterate over mentioned user IDs from the mention map
    for (const mentionedUserId of mentionedUserIds) {
      if (!notifiedUserIds.has(mentionedUserId)) {
        notificationsToCreate.push({
          userId: mentionedUserId,
          type: 'MENTION_IN_COMMENT',
          message: `${session.user.name || 'Someone'} mentioned you in a comment`,
          postId,
          commentId: created.id,
          actorId: session.user.id,
          read: false
        })
        notifiedUserIds.add(mentionedUserId) // Mark as notified to avoid duplicates
      }
    }

    if (notificationsToCreate.length > 0) {
      await prisma.notification.createMany({
        data: notificationsToCreate
      })
    }

    // Award XP for commenting
    try {
      const { awardXP } = await import('@/lib/xpService')
      await awardXP(session.user.id, 'comment', 5)
    } catch (xpError) {
      console.error('[XP] Error awarding XP for commenting:', xpError)
      // Don't fail the request if XP awarding fails
    }

    return NextResponse.json(created, { status: 201 })
  } catch (e) {
    console.error('[POST COMMENTS][POST] error', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function fetchRepliesRecursively(
  postId: string,
  parentIds: string[],
  depth = 1
): Promise<PostCommentWithUser[]> {
  if (parentIds.length === 0 || depth > MAX_REPLY_DEPTH) {
    return []
  }

  const replies = await prisma.postComment.findMany({
    where: {
      postId,
      parentId: { in: parentIds },
      isDeleted: false,
      status: 'visible'
    },
    orderBy: { createdAt: 'asc' },
    include: commentInclude
  })

  if (replies.length === 0) {
    return []
  }

  const childReplies = await fetchRepliesRecursively(
    postId,
    replies.map((reply) => reply.id),
    depth + 1
  )

  return [...replies, ...childReplies]
}

function buildCommentTree(
  topLevel: PostCommentWithUser[],
  replies: PostCommentWithUser[]
): CommentTreeNode[] {
  const nodeMap = new Map<string, CommentTreeNode>()

  for (const comment of [...topLevel, ...replies]) {
    nodeMap.set(comment.id, { ...comment, replies: [] })
  }

  const orderedTopLevel = topLevel
    .map((comment) => nodeMap.get(comment.id))
    .filter((node): node is CommentTreeNode => Boolean(node))

  const orderedReplies = [...replies].sort(
    (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
  )

  for (const reply of orderedReplies) {
    if (!reply.parentId) continue
    const parentNode = nodeMap.get(reply.parentId)
    const currentNode = nodeMap.get(reply.id)
    if (parentNode && currentNode) {
      parentNode.replies.push(currentNode)
    }
  }

  return orderedTopLevel
}

