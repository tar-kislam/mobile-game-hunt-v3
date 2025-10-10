import { NextRequest, NextResponse } from 'next/server'
import { getTrendingData, getTrendingHashtags, getTrendingPosts, clearTrendingCache } from '@/lib/trendingService'

// GET /api/community/trending - Get trending hashtags and posts
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') // 'hashtags', 'posts', or 'all'
    const refresh = searchParams.get('refresh') === 'true'

    // Clear cache if refresh requested
    if (refresh) {
      await clearTrendingCache()
    }

    switch (type) {
      case 'hashtags':
        const hashtags = await getTrendingHashtags()
        return NextResponse.json({
          hashtags,
          success: true
        })

      case 'posts':
        const posts = await getTrendingPosts()
        return NextResponse.json({
          posts,
          success: true
        })

      case 'all':
      default:
        const trendingData = await getTrendingData()
        return NextResponse.json({
          ...trendingData,
          success: true
        })
    }
  } catch (error) {
    console.error('[TRENDING API] Error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch trending data',
        success: false 
      },
      { status: 500 }
    )
  }
}

// POST /api/community/trending - Refresh trending data manually
export async function POST(request: NextRequest) {
  try {
    await clearTrendingCache()
    const trendingData = await getTrendingData()
    
    return NextResponse.json({
      ...trendingData,
      success: true,
      refreshed: true
    })
  } catch (error) {
    console.error('[TRENDING API] Error refreshing:', error)
    return NextResponse.json(
      { 
        error: 'Failed to refresh trending data',
        success: false 
      },
      { status: 500 }
    )
  }
}
