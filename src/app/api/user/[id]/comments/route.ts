import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/user/[id]/comments - Get user's comments
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

    // Get user's comments with game information
    const comments = await prisma.productComment.findMany({
      where: { userId: id },
      select: {
        id: true,
        content: true,
        createdAt: true,
        productId: true,
        product: {
          select: {
            id: true,
            title: true,
            platforms: true,
            thumbnail: true,
            image: true,
            images: true,
            _count: {
              select: {
                comments: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Transform the data to match expected format
    const transformedComments = comments.map(comment => ({
      gameId: comment.productId,
      title: comment.product.title,
      platforms: comment.product.platforms,
      coverImage: comment.product.thumbnail || comment.product.image || comment.product.images?.[0] || '/placeholder.png',
      commentCount: comment.product._count.comments,
      content: comment.content,
      createdAt: comment.createdAt
    }))

    return NextResponse.json({ comments: transformedComments })
  } catch (error) {
    console.error('Error fetching user comments:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
