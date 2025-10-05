import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')

    // Get all posts with hashtags
    const posts = await prisma.post.findMany({
      where: {
        hashtags: {
          not: Prisma.JsonNull
        }
      },
      select: {
        hashtags: true
      }
    })

    // Count hashtag occurrences
    const hashtagCounts: Record<string, number> = {}
    
    posts.forEach(post => {
      if (post.hashtags && Array.isArray(post.hashtags)) {
        post.hashtags.forEach((hashtag) => {
          if (typeof hashtag === 'string' && hashtag.trim()) {
            const cleanHashtag = hashtag.trim().toLowerCase()
            hashtagCounts[cleanHashtag] = (hashtagCounts[cleanHashtag] || 0) + 1
          }
        })
      }
    })

    // Sort by count and return top hashtags
    const trendingHashtags = Object.entries(hashtagCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit)
      .map(([hashtag, count]) => ({
        hashtag: `#${hashtag}`,
        count
      }))

    return NextResponse.json({
      hashtags: trendingHashtags,
      total: Object.keys(hashtagCounts).length
    })
  } catch (error) {
    console.error('Error fetching hashtags:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
