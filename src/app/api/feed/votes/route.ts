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

    const votes = await prisma.vote.findMany({
      where: {
        userId: session.user.id
      },
      include: {
        product: {
          select: {
            id: true,
            title: true,
            thumbnail: true,
            _count: {
              select: {
                votes: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10
    })

    const games = votes.map(vote => ({
      id: vote.product.id,
      title: vote.product.title,
      thumbnail: vote.product.thumbnail,
      votesCount: vote.product._count.votes
    }))

    return NextResponse.json({ games })
  } catch (error) {
    console.error('Error fetching voted games:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
