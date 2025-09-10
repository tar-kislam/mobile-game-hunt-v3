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
    let { content, images, hashtags } = validatedData

    // Normalize hashtags: extract from content, strip '#', lowercase, unique
    const extracted = content.match(/#[A-Za-z0-9_]+/g)?.map(h => h.replace(/^#/, '').toLowerCase()) || []
    const provided = (hashtags || []).map(h => h.replace(/^#/, '').toLowerCase())
    const normalizedTags = Array.from(new Set([ ...extracted, ...provided ]))

    // Create the post
    const post = await prisma.post.create({
      data: {
        content: content.trim(),
        images: images || null,
        hashtags: normalizedTags,
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
