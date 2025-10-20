import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const session = await getServerSession(authOptions)
    
    // For authenticated users, allow access to their own drafts
    // For public access, only show published products
    let whereClause
    if (session?.user?.id) {
      whereClause = {
        slug: slug,
        OR: [
          { status: 'PUBLISHED' as const },
          { status: 'DRAFT' as const, userId: session.user.id }
        ]
      }
    } else {
      whereClause = {
        slug: slug,
        status: 'PUBLISHED' as const
      }
    }
    
    const product = await prisma.product.findFirst({
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
            userId: true,
            email: true,
            role: true,
            isCreator: true,
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
        },
      },
    })

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    return NextResponse.json(product)
  } catch (error) {
    console.error('Error fetching product by slug:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
