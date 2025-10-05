import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Fetch all games for editorial control
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const games = await prisma.product.findMany({
      select: {
        id: true,
        title: true,
        _count: {
          select: {
            votes: true,
            comments: true
          }
        },
        editorial_boost: true,
        editorial_override: true,
        editorChoice: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Transform data to match expected format
    const transformedGames = games.map(game => ({
      id: game.id,
      title: game.title,
      upvotes: game._count.votes,
      comments: game._count.comments,
      rating: null, // We'll add rating calculation if needed
      editorial_boost: game.editorial_boost,
      editorial_override: game.editorial_override
    }))

    return NextResponse.json(transformedGames)
  } catch (error) {
    console.error('Error fetching games:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH - Update editorial settings
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const body = await request.json()
    const { id, editorial_boost, editorial_override } = body

    if (!id || typeof editorial_boost === 'undefined' && typeof editorial_override === 'undefined') {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const updateData: any = {}
    if (typeof editorial_boost === 'boolean') updateData.editorial_boost = editorial_boost
    if (typeof editorial_override === 'boolean') updateData.editorial_override = editorial_override

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        title: true,
        editorial_boost: true,
        editorial_override: true
      }
    })

    return NextResponse.json(updatedProduct)
  } catch (error) {
    console.error('Error updating product:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
