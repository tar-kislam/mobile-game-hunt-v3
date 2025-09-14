import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// PATCH - Update editorial settings for a specific game
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { id: gameId } = await params
    const body = await request.json()
    const { editorial_boost, editorial_override } = body

    if (!gameId) {
      return NextResponse.json({ error: 'Game ID is required' }, { status: 400 })
    }

    if (typeof editorial_boost === 'undefined' && typeof editorial_override === 'undefined') {
      return NextResponse.json({ error: 'At least one field to update is required' }, { status: 400 })
    }

    const updateData: any = {}
    if (typeof editorial_boost === 'boolean') updateData.editorial_boost = editorial_boost
    if (typeof editorial_override === 'boolean') updateData.editorial_override = editorial_override

    const updatedGame = await prisma.product.update({
      where: { id: gameId },
      data: updateData,
      select: {
        id: true,
        title: true,
        editorial_boost: true,
        editorial_override: true
      }
    })

    return NextResponse.json({
      success: true,
      game: updatedGame
    })
  } catch (error) {
    console.error('Error updating game:', error)
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
