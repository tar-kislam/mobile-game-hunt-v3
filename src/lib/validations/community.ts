import { z } from 'zod'

// Post creation schema
export const createPostSchema = z.object({
  content: z.string().min(1, 'Content is required').max(2000, 'Content too long (max 2000 characters)'),
  images: z.array(z.string()).max(4, 'Maximum 4 images allowed').optional(),
  hashtags: z.array(z.string()).max(10, 'Maximum 10 hashtags allowed').optional(),
  poll: z.object({
    questionFromPost: z.boolean().optional(),
    options: z.array(z.string().min(1, 'Option text cannot be empty').max(50, 'Option too long (max 50 characters)')).min(2, 'At least 2 options required').max(5, 'Maximum 5 options allowed'),
    expiresAt: z.string().datetime('Invalid expiration date')
  }).optional(),
})

// Comment creation schema
export const createCommentSchema = z.object({
  postId: z.string().min(1, 'Post ID is required'),
  content: z.string().min(1, 'Content is required').max(500, 'Content too long (max 500 characters)'),
})

// Like toggle schema
export const toggleLikeSchema = z.object({
  postId: z.string().min(1, 'Post ID is required'),
})

// Posts query schema
export const postsQuerySchema = z.object({
  page: z.string().optional().default('1'),
  limit: z.string().optional().default('20'),
  filter: z.enum(['latest', 'trending']).optional().default('latest'),
  hashtag: z.string().optional(),
})

// User posts query schema
export const userPostsQuerySchema = z.object({
  page: z.string().optional().default('1'),
  limit: z.string().optional().default('20'),
})

// Notifications query schema
export const notificationsQuerySchema = z.object({
  page: z.string().optional().default('1'),
  limit: z.string().optional().default('20'),
  unreadOnly: z.string().optional().default('false'),
})

export type CreatePostInput = z.infer<typeof createPostSchema>
export type CreateCommentInput = z.infer<typeof createCommentSchema>
export type ToggleLikeInput = z.infer<typeof toggleLikeSchema>
export type PostsQueryInput = z.infer<typeof postsQuerySchema>
export type UserPostsQueryInput = z.infer<typeof userPostsQuerySchema>
export type NotificationsQueryInput = z.infer<typeof notificationsQuerySchema>
