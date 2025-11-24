import type { Prisma } from '@prisma/client'

export interface ProductCommentResponse {
  id: string
  content: string
  createdAt: string
  updatedAt: string
  parentId: string | null
  isDeleted: boolean
  status: string
  user: {
    id: string
    name: string | null
    username?: string | null
    image?: string | null
  } | null
  mentions: Array<{
    id: string
    username?: string | null
    name?: string | null
  }>
  replies: ProductCommentResponse[]
  upvoteCount: number
  isUpvoted: boolean
  replyCount: number
}

export const productCommentInclude = {
  user: {
    select: {
      id: true,
      name: true,
      username: true,
      image: true
    }
  },
  mentions: {
    include: {
      mentionedUser: {
        select: {
          id: true,
          username: true,
          name: true
        }
      }
    }
  },
  _count: {
    select: {
      votes: true,
      replies: true
    }
  }
} satisfies Prisma.ProductCommentInclude

export type ProductCommentWithRelations = Prisma.ProductCommentGetPayload<{
  include: typeof productCommentInclude
}>

export function serializeProductComment(
  comment: ProductCommentWithRelations,
  upvotedCommentIds: Set<string>
): ProductCommentResponse {
  const mentionList =
    comment.mentions?.map((mention) => ({
      id: mention.mentionedUser.id,
      username: mention.mentionedUser.username,
      name: mention.mentionedUser.name
    })) ?? []

  const isDeleted = comment.isDeleted
  const placeholderText = 'This comment was deleted.'

  return {
    id: comment.id,
    content: isDeleted ? placeholderText : comment.content,
    createdAt: comment.createdAt.toISOString(),
    updatedAt: comment.updatedAt.toISOString(),
    parentId: comment.parentId,
    isDeleted,
    status: comment.status,
    user: comment.user
      ? {
          id: comment.user.id,
          name: comment.user.name,
          username: comment.user.username,
          image: comment.user.image
        }
      : null,
    mentions: mentionList,
    replies: [],
    upvoteCount: comment._count?.votes ?? 0,
    isUpvoted: upvotedCommentIds.has(comment.id),
    replyCount: comment._count?.replies ?? 0
  }
}

