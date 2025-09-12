import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/user/[id]/xp - Get user's XP information
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        xp: true,
        level: true
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Calculate XP progress to next level
    const currentLevelXP = (user.level - 1) * 100
    const nextLevelXP = user.level * 100
    const xpToNextLevel = nextLevelXP - user.xp
    const xpProgress = ((user.xp - currentLevelXP) / 100) * 100

    return NextResponse.json({
      id: user.id,
      xp: user.xp,
      level: user.level,
      xpToNextLevel: Math.max(0, xpToNextLevel),
      xpProgress: Math.min(100, Math.max(0, xpProgress))
    })
  } catch (error) {
    console.error('Error fetching user XP:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
