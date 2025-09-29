import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/user/[id]/votes - Get user's votes
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get user's votes with game information
    const votes = await prisma.vote.findMany({
      where: { userId: id },
      select: {
        productId: true,
        createdAt: true,
        product: {
          select: {
            id: true,
            title: true,
            platforms: true,
            thumbnail: true,
            image: true,
            images: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Transform the data to match expected format
    const transformedVotes = votes.map(vote => ({
      gameId: vote.productId,
      title: vote.product.title,
      platforms: vote.product.platforms,
      coverImage: vote.product.thumbnail || vote.product.image || vote.product.images?.[0] || '/placeholder.png',
      votedAt: vote.createdAt
    }))

    return NextResponse.json({ votes: transformedVotes })
  } catch (error) {
    console.error('Error fetching user votes:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
