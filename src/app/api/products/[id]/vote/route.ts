import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

// Use development database connection
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://postgres:password@localhost:5432/mobile_game_hunt_dev",
    },
  },
})

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

    const productId = id
    const userId = session.user.id

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    // Check if user already voted
    const existingVote = await prisma.vote.findUnique({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    })

    if (existingVote) {
      // Remove vote (toggle)
      await prisma.vote.delete({
        where: {
          userId_productId: {
            userId,
            productId,
          },
        },
      })

      return NextResponse.json({ 
        message: 'Vote removed',
        voted: false 
      })
    } else {
      // Add vote
      await prisma.vote.create({
        data: {
          userId,
          productId,
        },
      })

      return NextResponse.json({ 
        message: 'Vote added',
        voted: true 
      })
    }
  } catch (error) {
    console.error('Error handling vote:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
