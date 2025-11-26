import {
  insertTopLevelComment,
  insertReply,
  toggleVoteState,
  buildProductCommentNotifications,
  type ProductCommentNode
} from '../product-comment-utils'

const baseComment = (overrides?: Partial<ProductCommentNode>): ProductCommentNode => ({
  id: 'c1',
  content: 'Hello world',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  parentId: null,
  isDeleted: false,
  status: 'visible',
  user: {
    id: 'u1',
    name: 'Alice',
    username: 'alice',
    image: null
  },
  mentions: [],
  replies: [],
  upvoteCount: 0,
  isUpvoted: false,
  replyCount: 0,
  ...(overrides || {})
})

describe('product comment utils', () => {
  test('insertTopLevelComment prepends comment', () => {
    const existing = [baseComment({ id: 'old' })]
    const next = insertTopLevelComment(existing, baseComment({ id: 'new' }))
    expect(next[0].id).toBe('new')
    expect(next[1].id).toBe('old')
  })

  test('insertReply nests reply under parent', () => {
    const parent = baseComment({ id: 'parent' })
    const reply = baseComment({ id: 'reply', parentId: 'parent' })
    const next = insertReply([parent], 'parent', reply)
    expect(next[0].replies).toHaveLength(1)
    expect(next[0].replies[0].id).toBe('reply')
  })

  test('toggleVoteState updates counts correctly', () => {
    const up = toggleVoteState(false, 2)
    expect(up.isUpvoted).toBe(true)
    expect(up.upvoteCount).toBe(3)

    const down = toggleVoteState(true, 5)
    expect(down.isUpvoted).toBe(false)
    expect(down.upvoteCount).toBe(4)
  })

  test('buildProductCommentNotifications deduplicates recipients', () => {
    const notifications = buildProductCommentNotifications({
      authorId: 'author',
      authorName: 'Author',
      productId: 'product',
      productOwnerId: 'owner',
      productTitle: 'Cool Game',
      productSlug: 'cool-game',
      commentId: 'comment',
      parentAuthorId: 'parent',
      mentionedUserIds: ['mention', 'owner', 'parent'],
      isReply: true
    })

    const userIds = notifications.map((notif) => notif.userId)
    expect(userIds).toEqual(['owner', 'parent', 'mention'])
    notifications.forEach((notif) => {
      expect(notif.meta.productId).toBe('product')
      expect(notif.meta.commentId).toBe('comment')
    })
  })
})




