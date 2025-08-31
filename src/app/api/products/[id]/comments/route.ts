import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'

// Use development database connection
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://postgres:password@localhost:5432/mobile_game_hunt_dev",
    },
  },
})

const createCommentSchema = z.object({
  content: z.string().min(1, 'Comment cannot be empty').max(1000, 'Comment too long'),
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const comments = await prisma.comment.findMany({
      where: {
        productId: id,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    // Add a default vote count for now
    const commentsWithCount = comments.map(comment => ({
      ...comment,
      _count: {
        votes: 0 // Default to 0 votes for now
      }
    }))

    return NextResponse.json(commentsWithCount)
  } catch (error) {
    console.error('Error fetching comments:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = createCommentSchema.parse(body)

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: id },
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    const comment = await prisma.comment.create({
      data: {
        content: validatedData.content,
        userId: session.user.id,
        productId: id,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        // votes: true, // Include votes to count them
      },
    })

    // Transform comment to include vote count
    const commentWithCount = {
      ...comment,
      _count: {
        votes: 0 // Default to 0 votes for now
      }
    }

    return NextResponse.json(commentWithCount, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error('Error creating comment:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}