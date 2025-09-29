import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createPostSchema, postsQuerySchema } from '@/lib/validations/community'
import { revalidatePath } from 'next/cache'
import { notifyFollowersOfCommunityPost } from '@/lib/followNotifications'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify user exists in database (should always exist due to auth callback)
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, name: true, email: true }
    })

    if (!user) {
      console.error(`[COMMUNITY][CREATE] User not found: ${session.user.id}`)
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const body = await request.json()
    console.log('[COMMUNITY][CREATE] Request body:', JSON.stringify(body, null, 2))
    
    try {
      const validatedData = createPostSchema.parse(body)
      let { content, images, hashtags, poll } = validatedData
      
      console.log('[COMMUNITY][CREATE] Validated data:', { 
        content: content?.substring(0, 50) + '...', 
        imagesCount: images?.length || 0, 
        hashtagsCount: hashtags?.length || 0,
        hasPoll: !!poll,
        pollOptions: poll?.options?.length || 0
      })

      // Normalize hashtags: extract from content, strip '#', lowercase, unique
      const extracted = content.match(/#[A-Za-z0-9_]+/g)?.map(h => h.replace(/^#/, '').toLowerCase()) || []
      const provided = (hashtags || []).map(h => h.replace(/^#/, '').toLowerCase())
      const normalizedTags = Array.from(new Set([ ...extracted, ...provided ]))

    // Create the post (with optional poll)
    const postData: any = {
      content: content.trim(),
      images: images || null,
      hashtags: normalizedTags,
      userId: session.user.id,
    }

    // If poll data exists, create it inline
    if (poll) {
      // Validate poll data
      if (poll.options.length < 2) {
        return NextResponse.json({ error: 'At least 2 poll options required' }, { status: 400 })
      }

      // Check if expiresAt is in the future
      const expirationDate = new Date(poll.expiresAt)
      const now = new Date()
      if (expirationDate <= now) {
        return NextResponse.json({ error: 'Poll expiration must be in the future' }, { status: 400 })
      }

      // Derive question from first 100 chars of content
      const pollQuestion = content.trim().substring(0, 100)

      console.log('[COMMUNITY][CREATE] Creating poll:', {
        questionFromPost: poll.questionFromPost,
        question: pollQuestion,
        optionsCount: poll.options.length,
        expiresAt: poll.expiresAt
      })
      
      try {
        const pollCreateData = {
          question: pollQuestion,
          expiresAt: expirationDate,
          options: {
            create: poll.options.map((optionText: string) => ({
              text: optionText.trim()
            }))
          }
        }
        
        console.log('[COMMUNITY][CREATE] Poll create data:', JSON.stringify(pollCreateData, null, 2))
        
        postData.poll = {
          create: pollCreateData
        }
        console.log('[COMMUNITY][CREATE] Poll data structure created successfully')
      } catch (pollError) {
        console.error('[COMMUNITY][CREATE] Error creating poll data structure:', pollError)
        
        // Log detailed error information
        if (pollError instanceof Error) {
          console.error('[COMMUNITY][CREATE] Poll error details:', {
            message: pollError.message,
            stack: pollError.stack,
            name: pollError.name
          })
        }
        
        throw pollError
      }
    }

    console.log('[COMMUNITY][CREATE] Post data to create:', JSON.stringify(postData, null, 2))
    
    let post
    try {
      post = await prisma.post.create({
        data: postData,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            }
          },
          _count: {
            select: {
              likes: true,
              comments: true,
            }
          },
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
      console.log('[COMMUNITY][CREATE] Post created successfully:', post.id)

      // Notify followers of new community post
      try {
        const userWithUsername = await prisma.user.findUnique({
          where: { id: session.user.id },
          select: { username: true }
        })
        
        if (userWithUsername?.username) {
          await notifyFollowersOfCommunityPost(session.user.id, userWithUsername.username, post.id)
        }
      } catch (followNotificationError) {
        console.error('[FOLLOW_NOTIFICATIONS] Error notifying followers of community post:', followNotificationError)
      }
    } catch (prismaError) {
      console.error('[COMMUNITY][CREATE] Prisma error:', prismaError)
      if (prismaError instanceof Error) {
        console.error('[COMMUNITY][CREATE] Error details:', {
          message: prismaError.message,
          code: 'code' in prismaError ? prismaError.code : undefined,
          meta: 'meta' in prismaError ? prismaError.meta : undefined
        })
      }
      throw prismaError
    }

    // Dev-only debug log
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[COMMUNITY][CREATE] user=${session.user.id} post=${post.id}`)
    }

    // Best-effort revalidation; do not block response
    try {
      revalidatePath('/community')
    } catch {}

      return NextResponse.json(post, { status: 201 })
    } catch (validationError) {
      console.error('[COMMUNITY][CREATE] Validation error:', validationError)
      if (validationError instanceof Error && validationError.name === 'ZodError') {
        return NextResponse.json({ error: 'Validation error', details: validationError.message }, { status: 400 })
      }
      throw validationError
    }
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Validation error', details: error.message }, { status: 400 })
    }
    console.error('Error creating post:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const { searchParams } = new URL(request.url)
    const tagParam = new URL(request.url).searchParams.get('tag') || undefined
    const parsed = postsQuerySchema.safeParse({
      page: searchParams.get('page') ?? undefined,
      limit: searchParams.get('limit') ?? undefined,
      filter: searchParams.get('filter') ?? undefined,
      hashtag: searchParams.get('hashtag') ?? tagParam,
    })
    const validatedQuery = parsed.success
      ? parsed.data
      : { page: '1', limit: '20', filter: 'latest', hashtag: undefined as string | undefined }

    const page = parseInt(validatedQuery.page)
    const limit = parseInt(validatedQuery.limit)
    const skip = (page - 1) * limit

    // Build where clause
    let where: any = {}
    
    if (validatedQuery.hashtag) {
      const lc = validatedQuery.hashtag.toLowerCase()
      where = {
        ...where,
        OR: [
          // New normalized storage (array of strings without '#')
          { hashtags: { array_contains: [lc] } },
          // Backward-compat for older rows saved with '#'
          { hashtags: { array_contains: [`#${lc}`] } }
        ]
      }
    }

    // Build orderBy clause
    let orderBy: any = { createdAt: 'desc' }
    
    if (validatedQuery.filter === 'trending') {
      // For trending, we'll order by likes count and recency
      // This is a simplified approach - in production you might want more sophisticated trending logic
      orderBy = [
        { likes: { _count: 'desc' } },
        { createdAt: 'desc' }
      ]
    }

    // Show all posts to everyone (no published field exists, all posts are public)
    // Authors can see their own posts, but everyone sees all posts
    let posts = await prisma.post.findMany({
      where: where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          }
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          }
        },
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
      },
      orderBy,
      skip,
      take: limit
    })

    // No extra filtering needed; stored normalized

    const total = await prisma.post.count({ where: where })

    if (process.env.NODE_ENV !== 'production') {
      console.log(`[COMMUNITY][FEED] user=${session?.user?.id || 'anon'} count=${posts.length} filter=${validatedQuery.filter} hashtag=${validatedQuery.hashtag || ''}`)
    }

    return NextResponse.json({
      posts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching posts:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
