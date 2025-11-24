import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { awardXP } from '@/lib/xpService'
import { checkAndAwardBadges } from '@/lib/badgeService'
import { parseMentions, resolveMentions } from '@/lib/mentions'
import {
  productCommentInclude,
  serializeProductComment,
  type ProductCommentResponse,
  type ProductCommentWithRelations
} from '@/lib/comments/product-comment-serializer'
import { buildProductCommentNotifications } from '@/lib/comments/product-comment-utils'
import { Prisma } from '@prisma/client'

const COMMENT_PAGE_SIZE = 10
const MAX_REPLY_DEPTH = 3
let visibilityFiltersSupported: boolean | null = null
const VISIBILITY_ERROR_CODES = new Set(['P2022', 'P2003', 'P2010'])

const createCommentSchema = z.object({
  content: z.string().min(1, 'Comment cannot be empty').max(1000, 'Comment too long'),
  parentId: z.string().cuid().optional()
})

const querySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).optional(),
  cursor: z.string().optional(),
  order: z.enum(['latest', 'oldest']).optional().default('latest')
})

function isVisibilityColumnError(error: unknown): error is Prisma.PrismaClientKnownRequestError {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    VISIBILITY_ERROR_CODES.has(error.code)
  )
}

async function runWithVisibilityFilters<T>(
  baseWhere: Prisma.ProductCommentWhereInput,
  operation: (where: Prisma.ProductCommentWhereInput) => Promise<T>
): Promise<T> {
  if (visibilityFiltersSupported === false) {
    return operation(baseWhere)
  }

  const whereWithVisibility: Prisma.ProductCommentWhereInput = {
    ...baseWhere,
    status: 'visible',
    isDeleted: false
  }

  try {
    const result = await operation(whereWithVisibility)
    visibilityFiltersSupported = true
    return result
  } catch (error) {
    if (isVisibilityColumnError(error)) {
      console.warn('[PRODUCT COMMENTS] visibility columns missing; falling back without status/isDeleted filters')
      visibilityFiltersSupported = false
      return operation(baseWhere)
    }
    throw error
  }
}

async function findCommentsWithVisibility(
  baseWhere: Prisma.ProductCommentWhereInput,
  args: Omit<Prisma.ProductCommentFindManyArgs, 'where'>
): Promise<ProductCommentWithRelations[]> {
  return runWithVisibilityFilters(baseWhere, (where) =>
    prisma.productComment.findMany({
      ...args,
      where
    })
  )
}

async function countCommentsWithVisibility(
  baseWhere: Prisma.ProductCommentWhereInput
): Promise<number> {
  return runWithVisibilityFilters(baseWhere, (where) =>
    prisma.productComment.count({ where })
  )
}

function buildCommentTree(
  topLevel: ProductCommentWithRelations[],
  replies: ProductCommentWithRelations[],
  upvotedCommentIds: Set<string>
): ProductCommentResponse[] {
  const all = [...topLevel, ...replies]
  const nodeMap = new Map<string, ProductCommentResponse>()

  for (const comment of all) {
    nodeMap.set(comment.id, serializeProductComment(comment, upvotedCommentIds))
  }

  const orderedTopLevel = topLevel.map((comment) => nodeMap.get(comment.id)!).filter(Boolean)

  const repliesOrdered = [...replies].sort(
    (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
  )

  for (const reply of repliesOrdered) {
    const parentNode = reply.parentId ? nodeMap.get(reply.parentId) : null
    const currentNode = nodeMap.get(reply.id)
    if (parentNode && currentNode) {
      parentNode.replies.push(currentNode)
    }
  }

  return orderedTopLevel
}

async function fetchRepliesRecursively(
  productId: string,
  parents: string[],
  depth = 1
): Promise<ProductCommentWithRelations[]> {
  if (parents.length === 0 || depth > MAX_REPLY_DEPTH) {
    return []
  }

  const replies = await findCommentsWithVisibility(
    {
      productId,
      parentId: { in: parents }
    },
    {
      orderBy: { createdAt: 'asc' },
      include: productCommentInclude
    }
  )

  if (replies.length === 0) {
    return []
  }

  const childReplies = await fetchRepliesRecursively(
    productId,
    replies.map((reply) => reply.id),
    depth + 1
  )

  return [...replies, ...childReplies]
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const viewerId = session?.user?.id
    const { searchParams } = new URL(request.url)
    const { id } = await params

    const { limit, cursor, order } = querySchema.parse({
      limit: searchParams.get('limit') ?? undefined,
      cursor: searchParams.get('cursor') ?? undefined,
      order: searchParams.get('order') ?? undefined
    })

    const take = limit ?? COMMENT_PAGE_SIZE

    const topLevel = await findCommentsWithVisibility(
      {
        productId: id,
        parentId: null
      },
      {
        orderBy: {
          createdAt: order === 'oldest' ? 'asc' : 'desc'
        },
        take,
        ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
        include: productCommentInclude
      }
    )

    const topLevelIds = topLevel.map((comment) => comment.id)
    const replies = await fetchRepliesRecursively(id, topLevelIds)

    const commentIds = [...topLevelIds, ...replies.map((reply) => reply.id)]
    const userVotes = viewerId
      ? await prisma.commentVote.findMany({
          where: { commentId: { in: commentIds }, userId: viewerId },
          select: { commentId: true }
        })
      : []

    const upvotedSet = new Set(userVotes.map((vote) => vote.commentId))

    const commentsTree = buildCommentTree(topLevel, replies, upvotedSet)

    const totalTopLevel = await countCommentsWithVisibility({
      productId: id,
      parentId: null
    })

    const nextCursor = topLevel.length === take ? topLevel[topLevel.length - 1].id : null

    return NextResponse.json({
      comments: commentsTree,
      nextCursor,
      totalCount: totalTopLevel
    })
  } catch (error) {
    console.error('Error fetching product comments:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = createCommentSchema.parse(body)

    const [user, product] = await Promise.all([
      prisma.user.findUnique({
        where: { id: session.user.id },
        select: { id: true, name: true, username: true }
      }),
      prisma.product.findUnique({
        where: { id },
        select: { id: true, slug: true, title: true, userId: true }
      })
    ])

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    let parentComment: ProductCommentWithRelations | null = null
    if (validatedData.parentId) {
      parentComment = await prisma.productComment.findFirst({
        where: { id: validatedData.parentId, productId: id },
        include: productCommentInclude
      })

      if (!parentComment) {
        return NextResponse.json(
          { error: 'Parent comment not found for this product' },
          { status: 404 }
        )
      }
    }

    const mentionedUsernames = parseMentions(validatedData.content)
    const mentionMap = await resolveMentions(mentionedUsernames)
    const mentionedUserIds = Array.from(new Set(mentionMap.values())).filter(
      (mentionedUserId) => mentionedUserId !== user.id
    )

    const createdComment = await prisma.$transaction(async (tx) => {
      const comment = await tx.productComment.create({
        data: {
          content: validatedData.content,
          userId: user.id,
          productId: id,
          parentId: validatedData.parentId ?? null,
          status: 'visible'
        },
        include: productCommentInclude
      })

      if (mentionedUserIds.length > 0) {
        await tx.productCommentMention.createMany({
          data: mentionedUserIds.map((mentionedUserId) => ({
            commentId: comment.id,
            mentionedUserId
          })),
          skipDuplicates: true
        })
      }

      const actorName = user.name || user.username || 'Someone'
      const notificationPayloads = buildProductCommentNotifications({
        authorId: user.id,
        authorName: actorName,
        productId: product.id,
        productOwnerId: product.userId,
        productTitle: product.title,
        productSlug: product.slug ?? undefined,
        commentId: comment.id,
        parentAuthorId: parentComment?.user.id,
        mentionedUserIds,
        isReply: Boolean(validatedData.parentId)
      })

      if (notificationPayloads.length > 0) {
        const notifications: Prisma.NotificationCreateManyInput[] = notificationPayloads.map(
          (payload) => ({
            userId: payload.userId,
            type: payload.type,
            message: payload.message,
            productId: payload.productId,
            commentId: payload.commentId,
            actorId: payload.actorId,
            link: payload.link,
            meta: payload.meta
          })
        )

        await tx.notification.createMany({
          data: notifications
        })
      }

      return tx.productComment.findUniqueOrThrow({
        where: { id: comment.id },
        include: productCommentInclude
      })
    })

    try {
      const xpResult = await awardXP(user.id, 'comment')
      if (xpResult.levelUp) {
        console.log(`[XP] User ${user.id} leveled up from ${xpResult.previousLevel} to ${xpResult.newLevel}`)
      }

      await checkAndAwardBadges(user.id).catch((badgeError) => {
        console.error('[BADGES] Error checking badges:', badgeError)
      })

      console.log(`[XP] Awarded ${xpResult.xpAwarded} XP to user ${user.id} for commenting`)
    } catch (xpError) {
      console.error('[XP] Error awarding XP for comment:', xpError)
    }

    const upvotedSet = new Set<string>()
    const serialized = serializeProductComment(createdComment, upvotedSet)

    return NextResponse.json(serialized, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues?.[0]?.message || 'Validation failed' },
        { status: 400 }
      )
    }

    console.error('Error creating product comment:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}