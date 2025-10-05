import { NextRequest, NextResponse } from 'next/server'
import { getFeaturedGamesFromDB } from '@/lib/featured-games-service'

/**
 * GET /api/featured-games
 * Returns featured games based on the algorithm
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '6')
    
    // Validate limit
    if (limit < 1 || limit > 20) {
      return NextResponse.json(
        { error: 'Limit must be between 1 and 20' },
        { status: 400 }
      )
    }

    const featuredGames = await getFeaturedGamesFromDB(limit)
    
    return NextResponse.json({
      success: true,
      count: featuredGames.length,
      limit,
      games: featuredGames,
    })
  } catch (error) {
    console.error('Error fetching featured games:', error)
    return NextResponse.json(
      { error: 'Failed to fetch featured games' },
      { status: 500 }
    )
  }
}
