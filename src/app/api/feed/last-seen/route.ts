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

    // For now, we'll return recently viewed products based on creation date
    // In a real implementation, you'd track user clicks in a UserActivity table
    const recentProducts = await prisma.product.findMany({
      where: {
        // Only get products that have some activity (votes or comments)
        OR: [
          {
            votes: {
              some: {
                userId: session.user.id
              }
            }
          },
          {
            comments: {
              some: {
                userId: session.user.id
              }
            }
          }
        ]
      },
      select: {
        id: true,
        title: true,
        thumbnail: true,
        createdAt: true,
        votes: {
          where: {
            userId: session.user.id
          },
          select: {
            createdAt: true
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 1
        },
        comments: {
          where: {
            userId: session.user.id
          },
          select: {
            createdAt: true
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 1
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10
    })

    const products = recentProducts.map(product => {
      const lastVote = product.votes[0]
      const lastComment = product.comments[0]
      
      let lastViewed = product.createdAt
      if (lastVote && lastComment) {
        lastViewed = new Date(lastVote.createdAt) > new Date(lastComment.createdAt) 
          ? lastVote.createdAt 
          : lastComment.createdAt
      } else if (lastVote) {
        lastViewed = lastVote.createdAt
      } else if (lastComment) {
        lastViewed = lastComment.createdAt
      }

      return {
        id: product.id,
        title: product.title,
        thumbnail: product.thumbnail,
        lastViewed: lastViewed.toISOString()
      }
    })

    // Sort by last viewed date
    products.sort((a, b) => new Date(b.lastViewed).getTime() - new Date(a.lastViewed).getTime())

    return NextResponse.json({ products })
  } catch (error) {
    console.error('Error fetching last seen products:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
