import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20', 10)

    // fetch all users, then compute engagement; filter out zero-score later
    const users = await prisma.user.findMany({ select: { id: true, name: true, image: true } })

    // compute counts per user (posts created; likes and comments on those posts)
    const scored = await Promise.all(users.map(async (u) => {
      const [postsCount, likesCount, commentsCount] = await Promise.all([
        prisma.post.count({ where: { userId: u.id } }),
        prisma.like.count({ where: { post: { userId: u.id } } }),
        prisma.postComment.count({ where: { post: { userId: u.id } } }),
      ])
      const engagementScore = postsCount * 2 + likesCount + commentsCount
      return { userId: u.id, name: u.name, avatar: u.image, postsCount, likesCount, commentsCount, engagementScore }
    }))
    const top = scored
      .filter(u => u.engagementScore > 0)
      .sort((a, b) => b.engagementScore - a.engagementScore)
      .slice(0, limit)

    return NextResponse.json({ users: top })
  } catch (e) {
    console.error('Error fetching top hunters:', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


