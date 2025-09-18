import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isFeatureEnabled } from '@/lib/config'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  // Feature flag check - return 404 if blog is disabled
  if (!isFeatureEnabled('BLOG_ENABLED')) {
    return NextResponse.json({ ok: false, error: 'Not Found' }, { status: 404 })
  }

  try {
    const { slug } = await params

    const post = await prisma.blogPost.findUnique({
      where: { slug },
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        content: true,
        coverImage: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        author: {
          select: {
            id: true,
            name: true,
            image: true
          }
        }
      }
    })

    if (!post) {
      return NextResponse.json({ ok: false, error: 'Post not found' }, { status: 404 })
    }

    // Only return published posts unless it's an admin request
    if (post.status !== 'PUBLISHED') {
      return NextResponse.json({ ok: false, error: 'Post not found' }, { status: 404 })
    }

    return NextResponse.json({ ok: true, data: post })
  } catch (error) {
    console.error('GET /api/blog/[slug] error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}