import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const dateParam = searchParams.get('date')
    
    if (!dateParam) {
      return NextResponse.json({ error: 'Date parameter is required' }, { status: 400 })
    }

    // Parse the date parameter (expected format: YYYY-MM-DD)
    const targetDate = new Date(dateParam)
    if (isNaN(targetDate.getTime())) {
      return NextResponse.json({ error: 'Invalid date format. Use YYYY-MM-DD' }, { status: 400 })
    }

    // Create date range for the entire day
    const startOfDay = new Date(targetDate)
    startOfDay.setHours(0, 0, 0, 0)
    
    const endOfDay = new Date(targetDate)
    endOfDay.setHours(23, 59, 59, 999)

    // Fetch products with release date matching the selected day
    const releases = await prisma.product.findMany({
      where: {
        status: 'PUBLISHED',
        releaseAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      select: {
        id: true,
        title: true,
        tagline: true,
        description: true,
        thumbnail: true,
        platforms: true,
        countries: true,
        releaseAt: true,
        url: true,
        slug: true,
        categories: {
          select: {
            category: { 
              select: { 
                id: true, 
                name: true 
              } 
            },
          },
        },
        user: { 
          select: { 
            name: true,
            username: true 
          } 
        },
        _count: {
          select: {
            votes: true,
            comments: true,
            followUsers: true,
          }
        }
      },
      orderBy: { releaseAt: 'asc' },
    })

    // Format the response
    const formattedReleases = releases.map(release => ({
      id: release.id,
      title: release.title,
      tagline: release.tagline,
      description: release.description,
      thumbnail: release.thumbnail,
      platforms: release.platforms,
      countries: release.countries,
      releaseAt: release.releaseAt,
      url: release.url,
      slug: release.slug,
      categories: release.categories.map(cat => ({
        id: cat.category.id,
        name: cat.category.name
      })),
      developer: {
        name: release.user.name,
        username: release.user.username
      },
      stats: {
        votes: release._count.votes,
        comments: release._count.comments,
        followers: release._count.followUsers,
      }
    }))

    return NextResponse.json({
      date: dateParam,
      releases: formattedReleases,
      count: formattedReleases.length
    })

  } catch (error) {
    console.error('Releases API error:', error)
    return NextResponse.json({ 
      error: 'Failed to load releases for the selected date' 
    }, { status: 500 })
  }
}
