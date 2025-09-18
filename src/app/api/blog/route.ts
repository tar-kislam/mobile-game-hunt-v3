import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { resolveUserId } from '@/lib/userUtils'
import { z } from 'zod'
import { BlogStatus } from '@prisma/client'
import { isFeatureEnabled } from '@/lib/config'

const createSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  excerpt: z.string().optional().default(''),
  content: z.union([
    z.string().transform((str) => {
      try {
        const parsed = JSON.parse(str)
        if (Array.isArray(parsed)) return parsed
        throw new Error('Content must be an array')
      } catch (error) {
        // If JSON parsing fails, create a simple paragraph with the text
        return [{ type: 'paragraph', children: [{ text: str }] }]
      }
    }),
    z.array(z.any()).transform((arr) => {
      if (Array.isArray(arr) && arr.length > 0) return arr
      return [{ type: 'paragraph', children: [{ text: '' }] }]
    })
  ]),
  coverImage: z.string().optional().transform(v => (v && v.length ? v : undefined)),
  status: z.string()
    .optional()
    .default('DRAFT')
    .transform(val => {
      if (!val) return BlogStatus.DRAFT
      const normalized = val.toUpperCase().trim()
      if (normalized === 'DRAFT' || normalized === 'PUBLISHED' || normalized === 'ARCHIVED') {
        return normalized as BlogStatus
      }
      throw new Error(`Invalid status: ${val}. Must be one of: DRAFT, PUBLISHED, ARCHIVED`)
    })
})

export async function GET(request: NextRequest) {
  // Feature flag check - return 404 if blog is disabled
  if (!isFeatureEnabled('BLOG_ENABLED')) {
    return NextResponse.json({ ok: false, error: 'Not Found' }, { status: 404 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const q = searchParams.get('q')?.trim() || ''
    const status = searchParams.get('status') || 'PUBLISHED'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '9')
    const skip = (page - 1) * limit

    const where: any = {}

    if (status !== 'ALL') {
      where.status = status as BlogStatus
    }

    if (q) {
      where.OR = [
        { title: { contains: q, mode: 'insensitive' as const } },
        { excerpt: { contains: q, mode: 'insensitive' as const } },
      ]
    }

    const [posts, totalCount] = await Promise.all([
      prisma.blogPost.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          coverImage: true,
          status: true,
          createdAt: true,
          author: {
            select: {
              id: true,
              name: true,
              image: true
            }
          }
        }
      }),
      prisma.blogPost.count({ where })
    ])

    // Get unique categories for filter (can be implemented later)
    const categories: string[] = []

    const totalPages = Math.ceil(totalCount / limit)

    return NextResponse.json({ 
      ok: true, 
      data: posts,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      },
      categories: categories
    })
  } catch (error) {
    console.error('GET /api/blog error:', error)
    return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  // Feature flag check - return 404 if blog is disabled
  if (!isFeatureEnabled('BLOG_ENABLED')) {
    return NextResponse.json({ ok: false, error: 'Not Found' }, { status: 404 })
  }

  try {
    const session = await getServerSession(authOptions)
    const role = (session?.user as any)?.role
    if (!session?.user?.id || !(role === 'ADMIN' || role === 'EDITOR')) {
      return NextResponse.json({ ok: false, error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json().catch(() => null)
    const parsed = createSchema.safeParse(body)
    if (!parsed.success) {
      console.warn('POST /api/blog invalid payload:', parsed.error?.flatten?.() || body)
      return NextResponse.json({ ok: false, error: 'Invalid payload', details: parsed.error?.flatten?.() }, { status: 400 })
    }

    // Resolve the actual database user ID
    const userId = await resolveUserId(session.user)
    if (!userId) {
      return NextResponse.json({ ok: false, error: 'User not found' }, { status: 404 })
    }

    const { title, slug, excerpt, content, coverImage, status } = parsed.data

    // Check for duplicate slug
    const existingPost = await prisma.blogPost.findUnique({
      where: { slug }
    })

    if (existingPost) {
      return NextResponse.json({ ok: false, error: 'Slug already exists' }, { status: 409 })
    }

    const created = await prisma.blogPost.create({
      data: {
        title,
        slug,
        excerpt: excerpt || null,
        content: content,
        coverImage: coverImage || null,
        status: status as BlogStatus,
        authorId: userId,
      },
      select: { 
        id: true, 
        title: true, 
        slug: true,
        excerpt: true,
        status: true,
        createdAt: true
      }
    })

    return NextResponse.json({ ok: true, data: created }, { status: 201 })
  } catch (error: any) {
    if (error?.code === 'P2002') {
      return NextResponse.json({ ok: false, error: 'Slug already exists' }, { status: 409 })
    }
    console.error('POST /api/blog error:', error?.message || error, error?.stack)
    return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 })
  }
}