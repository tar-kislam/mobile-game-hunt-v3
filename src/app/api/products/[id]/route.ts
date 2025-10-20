import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendMail } from '@/lib/mail'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    
    // Check if the product belongs to the authenticated user
    const product = await prisma.product.findUnique({
      where: { id },
      select: { userId: true }
    })

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    if (product.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Delete related records first, then the product
    await prisma.$transaction(async (tx) => {
      // Delete votes
      await tx.vote.deleteMany({
        where: { productId: id }
      })

      // Delete follows
      await tx.gameFollow.deleteMany({
        where: { gameId: id }
      })

      // Delete metrics
      await tx.metric.deleteMany({
        where: { gameId: id }
      })

      // Delete comments
      await tx.productComment.deleteMany({
        where: { productId: id }
      })

      // Delete product makers
      await tx.productMaker.deleteMany({
        where: { productId: id }
      })

      // Delete product tags
      await tx.productTag.deleteMany({
        where: { productId: id }
      })

      // Delete product categories
      await tx.productCategory.deleteMany({
        where: { productId: id }
      })

      // Finally delete the product
      await tx.product.delete({
        where: { id }
      })
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting product:', error)
    
    // Check if it's a foreign key constraint error
    if (error instanceof Error && error.message.includes('Foreign key constraint')) {
      return NextResponse.json(
        { error: 'Cannot delete product with existing related data' },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(req: NextRequest, context: any) {
  const params = (context?.params || {}) as { id: string }
  try {
    const id = params.id
    const schema = z.object({ releaseAt: z.string().datetime().nullable() })
    const parsed = schema.safeParse(await req.json())
    if (!parsed.success) return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    const before = await prisma.product.findUnique({ where: { id }, select: { releaseAt: true, title: true, followUsers: { include: { user: true } } } })
    const updated = await prisma.product.update({ where: { id }, data: { releaseAt: parsed.data.releaseAt ? new Date(parsed.data.releaseAt) : null } })
    if (before?.releaseAt?.toISOString() !== updated.releaseAt?.toISOString()) {
      // notify followers (best-effort)
      const followers = before?.followUsers || []
      const to = process.env.NOTIFY_EMAIL
      if (to) {
        void sendMail({ to, subject: 'Release date changed', html: `<p>${before?.title} new date: ${updated.releaseAt}</p>` })
      }
      for (const f of followers) {
        const email = (f as any).user?.email
        if (email) void sendMail({ to: email, subject: 'Release date updated', html: `<p>${before?.title} new date: ${updated.releaseAt}</p>` })
      }
    }
    return NextResponse.json({ ok: true, product: updated })
  } catch (e) {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

// PUT /api/products/[id] - Update product (owner only)
export async function PUT(req: NextRequest, context: any) {
  const paramsPromise = (context?.params || {}) as Promise<{ id: string }>
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await paramsPromise
    const body = await req.json()
    console.log('PUT /api/products/[id] - body:', body)

    // Validate payload (keep flexible, only fields we allow to change)
    const schema = z.object({
      title: z.string().min(1).max(100).optional(),
      description: z.string().min(1).max(5000).optional(),
      tagline: z.string().max(200).optional(),
      iosUrl: z.string().url().optional().nullable(),
      androidUrl: z.string().url().optional().nullable(),
      image: z.string().optional().nullable(),
      thumbnail: z.string().optional().nullable(),
      images: z.array(z.string()).optional().nullable(),
      video: z.string().url().optional().nullable(),
      platforms: z.array(z.string()).optional().nullable(),
      socialLinks: z.record(z.string(), z.any()).optional().nullable() as any,
    })
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      console.log('PUT /api/products/[id] - validation failed:', parsed.error.flatten())
      return NextResponse.json({ error: 'Invalid payload', details: parsed.error.flatten() }, { status: 400 })
    }

    // Check ownership
    const product = await prisma.product.findUnique({ where: { id }, select: { userId: true } })
    if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    if (product.userId !== session.user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const updated = await prisma.product.update({
      where: { id },
      data: parsed.data as any,
    })

    return NextResponse.json({ success: true, product: updated })
  } catch (e) {
    console.error('Update product error:', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(
  request: NextRequest,
  context: any
) {
  const params = (context?.params || {}) as Promise<{ id: string }>
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    console.log('GET /api/products/[id] - Session:', session?.user?.id ? 'Authenticated' : 'Not authenticated')
    console.log('GET /api/products/[id] - Session user ID:', session?.user?.id)
    console.log('GET /api/products/[id] - Product ID:', id)
    
    // For authenticated users, allow access to their own drafts
    // For public access, only show published products
    let whereClause
    if (session?.user?.id) {
      whereClause = {
        id: id,
        OR: [
          { status: 'PUBLISHED' as const },
          { status: 'DRAFT' as const, userId: session.user.id }
        ]
      }
      console.log('GET /api/products/[id] - Using authenticated where clause')
    } else {
      whereClause = {
        id: id,
        status: 'PUBLISHED' as const
      }
      console.log('GET /api/products/[id] - Using public where clause')
    }
    
    const product = await prisma.product.findUnique({
      where: whereClause,
      select: {
        id: true,
        title: true,
        slug: true,
        tagline: true,
        description: true,
        url: true,
        image: true,
        thumbnail: true,
        gallery: true,
        videoUrl: true,
        gameplayGifUrl: true,
        demoUrl: true,
        youtubeUrl: true,
        images: true,
        video: true,
        platforms: true,
              iosUrl: true,
      androidUrl: true,
        socialLinks: true,
        createdAt: true,
        releaseAt: true,
        status: true,
        launchType: true,
        launchDate: true,
        monetization: true,
        engine: true,
        languages: true,
        clicks: true,
        follows: true,
        pricing: true,
        promoOffer: true,
        promoCode: true,
        promoExpiry: true,
        playtestQuota: true,
        playtestExpiry: true,
        sponsorRequest: true,
        sponsorNote: true,
        crowdfundingPledge: true,
        gamificationTags: true,
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        tags: {
          select: {
            tag: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        categories: {
          select: {
            category: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        makers: {
          select: {
            id: true,
            role: true,
            isCreator: true,
            email: true,
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
        },
        _count: {
          select: {
            votes: true,
            comments: true,
          },
        },
      },
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(product)
  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
