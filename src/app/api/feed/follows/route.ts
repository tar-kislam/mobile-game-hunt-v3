import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get followed users
    const followedUsers = await prisma.follow.findMany({
      where: {
        followerId: session.user.id
      },
      include: {
        following: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10
    })

    // Get followed products (if product follows exist)
    const followedProducts = await prisma.productFollow?.findMany?.({
      where: {
        userId: session.user.id
      },
      include: {
        product: {
          select: {
            id: true,
            title: true,
            thumbnail: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10
    }).catch(() => []) // Gracefully handle if productFollow doesn't exist

    const userItems = followedUsers.map(follow => ({
      id: follow.following.id,
      name: follow.following.name || 'Anonymous',
      username: follow.following.username,
      image: follow.following.image,
      type: 'user' as const
    }))

    const gameItems = (followedProducts || []).map(follow => ({
      id: follow.product.id,
      title: follow.product.title,
      thumbnail: follow.product.thumbnail,
      type: 'game' as const
    }))

    const items = [...userItems, ...gameItems].sort((a, b) => 
      new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    ).slice(0, 10)

    return NextResponse.json({ items })
  } catch (error) {
    console.error('Error fetching follows:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
