import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const body = await request.json()
    const { gameId } = body

    if (!gameId) {
      return NextResponse.json({ error: 'Game ID is required' }, { status: 400 })
    }

    const userId = session.user.id

    // Check if game exists
    const game = await prisma.product.findUnique({
      where: { id: gameId },
      select: { id: true, title: true }
    })

    if (!game) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 })
    }

    // Check if already following
    const existingFollow = await prisma.gameFollow.findUnique({
      where: {
        userId_gameId: {
          userId,
          gameId
        }
      }
    })

    if (existingFollow) {
      // Unfollow (toggle logic)
      await prisma.gameFollow.delete({
        where: {
          id: existingFollow.id
        }
      })

      // Update follow count
      await prisma.product.update({
        where: { id: gameId },
        data: {
          follows: {
            decrement: 1
          }
        }
      })

      return NextResponse.json({
        success: true,
        following: false,
        message: `You unfollowed ${game.title}`
      })
    } else {
      // Follow
      await prisma.gameFollow.create({
        data: {
          userId,
          gameId
        }
      })

      // Update follow count
      await prisma.product.update({
        where: { id: gameId },
        data: {
          follows: {
            increment: 1
          }
        }
      })

      return NextResponse.json({
        success: true,
        following: true,
        message: `You are now following ${game.title}`
      })
    }

  } catch (error) {
    console.error('Game follow error:', error)
    return NextResponse.json(
      { error: 'Failed to follow game' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const { searchParams } = new URL(request.url)
    const gameId = searchParams.get('gameId')

    if (!gameId) {
      return NextResponse.json({ error: 'Game ID is required' }, { status: 400 })
    }

    if (!session?.user?.id) {
      return NextResponse.json({ following: false })
    }

    const userId = session.user.id

    // Check if following
    const follow = await prisma.gameFollow.findUnique({
      where: {
        userId_gameId: {
          userId,
          gameId
        }
      }
    })

    return NextResponse.json({
      following: !!follow
    })

  } catch (error) {
    console.error('Game follow status check error:', error)
    return NextResponse.json({ following: false })
  }
}
