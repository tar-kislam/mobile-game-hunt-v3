export interface ProductCommentNode {
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
  replies: ProductCommentNode[]
  upvoteCount: number
  isUpvoted: boolean
  replyCount: number
}

export function insertTopLevelComment(
  comments: ProductCommentNode[],
  comment: ProductCommentNode
): ProductCommentNode[] {
  return [comment, ...comments]
}

export function insertReply(
  comments: ProductCommentNode[],
  parentId: string,
  reply: ProductCommentNode
): ProductCommentNode[] {
  return comments.map((comment) => {
    if (comment.id === parentId) {
      return {
        ...comment,
        replies: [...comment.replies, reply],
        replyCount: comment.replyCount + 1
      }
    }

    if (comment.replies.length > 0) {
      return {
        ...comment,
        replies: insertReply(comment.replies, parentId, reply)
      }
    }

    return comment
  })
}

export function updateCommentNode(
  comments: ProductCommentNode[],
  updated: ProductCommentNode
): ProductCommentNode[] {
  return comments.map((comment) => {
    if (comment.id === updated.id) {
      return { ...updated }
    }

    if (comment.replies.length > 0) {
      return {
        ...comment,
        replies: updateCommentNode(comment.replies, updated)
      }
    }

    return comment
  })
}

export function markCommentDeleted(
  comments: ProductCommentNode[],
  commentId: string
): ProductCommentNode[] {
  return comments.map((comment) => {
    if (comment.id === commentId) {
      return {
        ...comment,
        isDeleted: true,
        status: 'hidden',
        content: 'This comment was deleted.'
      }
    }

    if (comment.replies.length > 0) {
      return {
        ...comment,
        replies: markCommentDeleted(comment.replies, commentId)
      }
    }

    return comment
  })
}

export function toggleVoteState(
  isCurrentlyUpvoted: boolean,
  currentCount: number
): { isUpvoted: boolean; upvoteCount: number } {
  if (isCurrentlyUpvoted) {
    return {
      isUpvoted: false,
      upvoteCount: Math.max(0, currentCount - 1)
    }
  }

  return {
    isUpvoted: true,
    upvoteCount: currentCount + 1
  }
}

export interface CommentNotificationContext {
  authorId: string
  authorName: string
  productId: string
  productOwnerId: string
  productTitle?: string | null
  productSlug?: string | null
  commentId: string
  parentAuthorId?: string | null
  mentionedUserIds?: string[]
  isReply: boolean
}

export interface NotificationPayload {
  userId: string
  type: 'COMMENT_ON_PRODUCT' | 'REPLY_TO_COMMENT' | 'MENTION_IN_COMMENT'
  message: string
  productId: string
  commentId: string
  actorId: string
  link: string | null
  meta: {
    productId: string
    commentId: string
    productSlug?: string | null
  }
}

export function buildProductCommentNotifications(
  context: CommentNotificationContext
): NotificationPayload[] {
  const notifications: NotificationPayload[] = []
  const notifiedUserIds = new Set<string>([context.authorId])
  const link = context.productSlug
    ? `/product/${context.productSlug}#comment-${context.commentId}`
    : null
  const messageMeta = {
    productId: context.productId,
    commentId: context.commentId,
    productSlug: context.productSlug
  }

  if (!context.isReply && context.productOwnerId !== context.authorId) {
    notifications.push({
      userId: context.productOwnerId,
      type: 'COMMENT_ON_PRODUCT',
      message: `${context.authorName} commented on ${context.productTitle ?? 'your game'}`,
      productId: context.productId,
      commentId: context.commentId,
      actorId: context.authorId,
      link,
      meta: messageMeta
    })
    notifiedUserIds.add(context.productOwnerId)
  }

  if (
    context.isReply &&
    context.parentAuthorId &&
    context.parentAuthorId !== context.authorId &&
    !notifiedUserIds.has(context.parentAuthorId)
  ) {
    notifications.push({
      userId: context.parentAuthorId,
      type: 'REPLY_TO_COMMENT',
      message: `${context.authorName} replied to your comment`,
      productId: context.productId,
      commentId: context.commentId,
      actorId: context.authorId,
      link,
      meta: messageMeta
    })
    notifiedUserIds.add(context.parentAuthorId)
  }

  const mentionTargetIds = context.mentionedUserIds ?? []
  for (const mentionedUserId of mentionTargetIds) {
    if (!notifiedUserIds.has(mentionedUserId)) {
      notifications.push({
        userId: mentionedUserId,
        type: 'MENTION_IN_COMMENT',
        message: `${context.authorName} mentioned you in a comment`,
        productId: context.productId,
        commentId: context.commentId,
        actorId: context.authorId,
        link,
        meta: messageMeta
      })
      notifiedUserIds.add(mentionedUserId)
    }
  }

  return notifications
}

