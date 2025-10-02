import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url)
    const take = Math.min(parseInt(url.searchParams.get('take') || '5', 10), 50)

    // Window: last 30 days
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    // Aggregate interaction counts per user in window
    const [votes, comments, follows, posts, submits] = await Promise.all([
      prisma.vote.groupBy({ by: ['userId'], where: { createdAt: { gte: thirtyDaysAgo } }, _count: { userId: true } }),
      prisma.productComment.groupBy({ by: ['userId'], where: { createdAt: { gte: thirtyDaysAgo } }, _count: { userId: true } }),
      prisma.follow.groupBy({ by: ['followerId'], where: { createdAt: { gte: thirtyDaysAgo } }, _count: { followerId: true } }),
      prisma.post.groupBy({ by: ['userId'], where: { createdAt: { gte: thirtyDaysAgo } }, _count: { userId: true } }),
      prisma.product.groupBy({ by: ['userId'], where: { createdAt: { gte: thirtyDaysAgo } }, _count: { userId: true } }),
    ])

    const map = new Map<string, { userId: string; votes: number; comments: number; follows: number; posts: number; submits: number; score: number }>()

    const ensure = (userId: string) => {
      if (!map.has(userId)) map.set(userId, { userId, votes: 0, comments: 0, follows: 0, posts: 0, submits: 0, score: 0 })
      return map.get(userId)!
    }

    votes.forEach(v => { const e = ensure(v.userId); e.votes = v._count.userId })
    comments.forEach(c => { const e = ensure(c.userId); e.comments = c._count.userId })
    follows.forEach(f => { const e = ensure(f.followerId); e.follows = f._count.followerId })
    posts.forEach(p => { const e = ensure(p.userId); e.posts = p._count.userId })
    submits.forEach(s => { const e = ensure(s.userId); e.submits = s._count.userId })

    // Scoring
    const users = Array.from(map.values()).map(u => ({
      ...u,
      score: (u.votes * 2) + (u.comments * 3) + (u.follows * 1) + (u.posts * 5) + (u.submits * 10)
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, take)

    const userIds = users.map(u => u.userId)
    const userInfos = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { 
        id: true, 
        name: true, 
        image: true, 
        username: true,
        badges: {
          select: {
            badge: {
              select: {
                id: true,
                name: true,
                icon: true,
                description: true
              }
            }
          }
        }
      }
    })
    const infoMap = new Map(userInfos.map(u => [u.id, u]))

    return NextResponse.json({
      users: users.map((u, i) => {
        const userInfo = infoMap.get(u.userId);
        return {
          rank: i + 1,
          id: u.userId,
          name: userInfo?.name || 'Anonymous',
          image: userInfo?.image || null,
          username: userInfo?.username || null,
          score: u.score,
          votes: u.votes,
          comments: u.comments,
          follows: u.follows,
          posts: u.posts,
          submits: u.submits,
          badges: userInfo?.badges?.map(ub => ub.badge) || []
        };
      })
    })
  } catch (e) {
    console.error('user leaderboard error', e)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}


