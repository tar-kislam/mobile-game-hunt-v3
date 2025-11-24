import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { DAILY_POST_LIMIT } from '../route'
import { evaluateDailyQuota } from '@/lib/community/quota'

// GET /api/community/posts/limit - Get user's daily post count and limit info
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        communityDailyPostCount: true,
        communityLastPostDate: true
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const quota = evaluateDailyQuota(
      user.communityDailyPostCount,
      user.communityLastPostDate,
      DAILY_POST_LIMIT,
      new Date()
    )

    if (quota.needsReset) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          communityDailyPostCount: 0,
          communityLastPostDate: quota.todayStart
        }
      })
    }

    const postsToday = quota.needsReset ? 0 : quota.used

    return NextResponse.json({
      canPost: quota.canPost,
      limit: DAILY_POST_LIMIT,
      used: postsToday,
      remaining: quota.remaining,
      resetTime: quota.nextReset.toISOString(),
      resetTimeFormatted: quota.nextReset.toUTCString()
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
