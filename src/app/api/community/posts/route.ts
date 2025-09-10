import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createPostSchema, postsQuerySchema } from '@/lib/validations/community'
import { revalidatePath } from 'next/cache'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = createPostSchema.parse(body)
    const { content, images, hashtags } = validatedData

    // Create the post
    const post = await prisma.post.create({
      data: {
        content: content.trim(),
        images: images || null,
        hashtags: hashtags || null,
        userId: session.user.id,
      },
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
        }
      }
    })

    // Dev-only debug log
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[COMMUNITY][CREATE] user=${session.user.id} post=${post.id}`)
    }

    // Best-effort revalidation; do not block response
    try {
      revalidatePath('/community')
    } catch {}

    return NextResponse.json(post, { status: 201 })
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
    const parsed = postsQuerySchema.safeParse({
      page: searchParams.get('page') ?? undefined,
      limit: searchParams.get('limit') ?? undefined,
      filter: searchParams.get('filter') ?? undefined,
      hashtag: searchParams.get('hashtag') ?? undefined,
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
      where.hashtags = {
        path: '$[*]',
        array_contains: [validatedQuery.hashtag]
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

    // Ensure author sees their own posts if any moderation flags are introduced later
    const whereWithAuthor = session?.user?.id
      ? { OR: [ where, { userId: session.user.id } ] }
      : where

    const posts = await prisma.post.findMany({
      where: whereWithAuthor,
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
        }
      },
      orderBy,
      skip,
      take: limit
    })

    const total = await prisma.post.count({ where })

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
