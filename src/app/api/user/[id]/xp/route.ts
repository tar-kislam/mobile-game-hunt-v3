import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { resolveUserId } from '@/lib/userUtils'

// GET /api/user/[id]/xp - Get user's XP information
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Try to find user by the provided ID first
    let user = await prisma.user.findUnique({ where: { id }, select: { id: true } })
    
    // If not found, try to resolve from session if this is a session user ID
    if (!user) {
      // This might be a session user ID, try to resolve it
      const resolvedId = await resolveUserId({ id })
      if (resolvedId) {
        user = await prisma.user.findUnique({ where: { id: resolvedId }, select: { id: true } })
      }
    }

    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    return NextResponse.json({
      id: user.id,
      xp: 0,
      level: 1,
      xpToNextLevel: 100,
      xpProgress: 0
    })
  } catch (error) {
    console.error('Error fetching user XP:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
