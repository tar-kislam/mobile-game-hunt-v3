import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const startDateParam = searchParams.get('startDate')
    const endDateParam = searchParams.get('endDate')
    
    if (!startDateParam || !endDateParam) {
      return NextResponse.json({ error: 'Start date and end date parameters are required' }, { status: 400 })
    }

    // Parse the date parameters (expected format: YYYY-MM-DD)
    const startDate = new Date(startDateParam)
    const endDate = new Date(endDateParam)
    
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return NextResponse.json({ error: 'Invalid date format. Use YYYY-MM-DD' }, { status: 400 })
    }

    // Create date range
    const startOfRange = new Date(startDate)
    startOfRange.setHours(0, 0, 0, 0)
    
    const endOfRange = new Date(endDate)
    endOfRange.setHours(23, 59, 59, 999)

    // Fetch products with release date within the range
    const releases = await prisma.product.findMany({
      where: {
        status: 'PUBLISHED',
        releaseAt: {
          gte: startOfRange,
          lte: endOfRange,
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
        category: {
          id: cat.category.id,
          name: cat.category.name
        }
      })),
      user: {
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
      startDate: startDateParam,
      endDate: endDateParam,
      releases: formattedReleases,
      count: formattedReleases.length
    })

  } catch (error) {
    console.error('Releases range API error:', error)
    return NextResponse.json({ 
      error: 'Failed to load releases for the date range' 
    }, { status: 500 })
  }
}
