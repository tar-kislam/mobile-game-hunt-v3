import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/admin/submitted-games
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const games = await prisma.product.findMany({
      where: {
        status: 'PUBLISHED',
      },
      select: {
        id: true,
        title: true,
        tagline: true,
        slug: true,
        socialLinks: true,
        youtubeUrl: true,
        iosUrl: true,
        androidUrl: true,
        url: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    // Transform the data to include all social links
    const transformedGames = games.map((game) => {
      const socialLinks = game.socialLinks as any
      return {
        id: game.id,
        title: game.title,
        tagline: game.tagline,
        slug: game.slug,
        socialLinks: {
          website: socialLinks?.website || null,
          discord: socialLinks?.discord || null,
          twitter: socialLinks?.twitter || null,
          tiktok: socialLinks?.tiktok || null,
          instagram: socialLinks?.instagram || null,
          reddit: socialLinks?.reddit || null,
          facebook: socialLinks?.facebook || null,
          linkedin: socialLinks?.linkedin || null,
          youtube: socialLinks?.youtube || game.youtubeUrl || null,
        },
        storeLinks: {
          ios: game.iosUrl || null,
          android: game.androidUrl || null,
          website: game.url || null,
        },
      }
    })

    return NextResponse.json(transformedGames)
  } catch (error) {
    console.error('Error fetching submitted games:', error)
    return NextResponse.json({ error: 'Failed to fetch games' }, { status: 500 })
  }
}

