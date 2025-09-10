import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const now = new Date()
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000)

    // Count posts created today
    const postsToday = await prisma.post.count({
      where: {
        createdAt: {
          gte: startOfToday
        }
      }
    })

    // Count distinct users who were active in the last 24 hours
    // (created posts, comments, or likes)
    const activeUsers = await prisma.$queryRaw<Array<{ userId: string }>>`
      SELECT DISTINCT "userId" FROM (
        SELECT "userId" FROM "Post" WHERE "createdAt" >= ${last24Hours}
        UNION
        SELECT "userId" FROM "PostComment" WHERE "createdAt" >= ${last24Hours}
        UNION
        SELECT "userId" FROM "Like" WHERE "createdAt" >= ${last24Hours}
      ) AS active_users
    `

    const activeMembers = activeUsers.length

    return NextResponse.json({
      activeMembers,
      postsToday
    })
  } catch (error) {
    console.error('Error fetching community stats:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
