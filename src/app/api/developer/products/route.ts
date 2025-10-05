import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get all products for the developer with analytics summary
    const products = await prisma.product.findMany({
      where: {
        userId: user.id
      },
      select: {
        id: true,
        title: true,
        status: true,
        releaseAt: true,
        createdAt: true,
        clicks: true,
        follows: true,
        _count: {
          select: {
            votes: true,
            comments: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Calculate analytics summary
    const analyticsSummary = {
      totalProducts: products.length,
      totalViews: products.reduce((sum, product) => sum + (product.clicks || 0), 0),
      totalVotes: products.reduce((sum, product) => sum + product._count.votes, 0),
      totalFollows: products.reduce((sum, product) => sum + (product.follows || 0), 0),
      totalClicks: products.reduce((sum, product) => sum + (product.clicks || 0), 0)
    }

    return NextResponse.json({
      ok: true,
      products: products.map(product => ({
        id: product.id,
        name: product.title,
        status: product.status,
        releaseDate: product.releaseAt,
        createdAt: product.createdAt,
        totalViews: product.clicks || 0,
        totalVotes: product._count.votes,
        totalFollows: product.follows || 0,
        totalClicks: product.clicks || 0
      })),
      analyticsSummary
    })
  } catch (error) {
    console.error('Error fetching developer products:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

