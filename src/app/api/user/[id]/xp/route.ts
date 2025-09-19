import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { resolveUserId } from '@/lib/userUtils'
import { calculateLevelProgress } from '@/lib/xpCalculator'

// GET /api/user/[id]/xp - Get user's XP information
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Try to find user by the provided ID first
    let user = await prisma.user.findUnique({ 
      where: { id }, 
      select: { id: true, xp: true } 
    })
    
    // If not found, try to resolve from session if this is a session user ID
    if (!user) {
      // This might be a session user ID, try to resolve it
      const resolvedId = await resolveUserId({ id })
      if (resolvedId) {
        user = await prisma.user.findUnique({ 
          where: { id: resolvedId }, 
          select: { id: true, xp: true } 
        })
      }
    }

    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    // Calculate level progress using the user's actual XP
    const levelProgress = calculateLevelProgress(user.xp)
    const progressPercentage = Math.round((levelProgress.currentXP / levelProgress.requiredXP) * 100)

    return NextResponse.json({
      id: user.id,
      xp: user.xp,
      level: levelProgress.level,
      xpToNextLevel: levelProgress.requiredXP,
      xpProgress: progressPercentage,
      currentXP: levelProgress.currentXP,
      remainingXP: levelProgress.remainingXP
    })
  } catch (error) {
    console.error('Error fetching user XP:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
