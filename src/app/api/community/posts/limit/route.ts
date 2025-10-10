import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { DAILY_POST_LIMIT } from '../route'

// GET /api/community/posts/limit - Get user's daily post count and limit info
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check daily post count (24 hours from now)
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
    const postsToday = await prisma.post.count({
      where: {
        userId: session.user.id,
        createdAt: { gte: twentyFourHoursAgo }
      }
    })

    const canPost = postsToday < DAILY_POST_LIMIT
    const remainingPosts = Math.max(0, DAILY_POST_LIMIT - postsToday)
    
    // Calculate when the user can post again (next reset time)
    const nextResetTime = new Date(Date.now() + 24 * 60 * 60 * 1000)

    return NextResponse.json({
      canPost,
      limit: DAILY_POST_LIMIT,
      used: postsToday,
      remaining: remainingPosts,
      resetTime: nextResetTime.toISOString(),
      resetTimeFormatted: nextResetTime.toLocaleString()
    })
  } catch (error) {
    console.error('[POST LIMIT API] Error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to check post limit',
        canPost: false,
        limit: DAILY_POST_LIMIT,
        used: 0,
        remaining: 0
      },
      { status: 500 }
    )
  }
}
