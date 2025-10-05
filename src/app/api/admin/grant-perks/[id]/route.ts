import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { calculateLevelProgress } from '@/lib/xpCalculator'
import { awardBadge } from '@/lib/badgeService'

// Admin-only endpoint to ensure an admin user has all badges and max XP
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const { id: targetUserId } = await params

    // Only admins can call this endpoint
    const caller = await prisma.user.findUnique({ where: { id: session.user.id }, select: { role: true } })
    if (!caller || caller.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const user = await prisma.user.findUnique({ where: { id: targetUserId }, select: { id: true, role: true, xp: true } })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Target user is not an admin' }, { status: 400 })
    }

    // Pick a very high XP to effectively complete all levels in practice
    // Level 50 cumulative = 50*51*100/2 = 127_500. We add extra to be beyond.
    const targetXP = 200_000

    // Update XP
    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { xp: targetXP },
      select: { xp: true }
    })

    const levelProgress = calculateLevelProgress(updated.xp)

    // Award all badges (idempotent)
    const allBadgeTypes = [
      'WISE_OWL',
      'FIRE_DRAGON',
      'CLEVER_FOX',
      'GENTLE_PANDA',
      'SWIFT_PUMA',
      'EXPLORER',
      'RISING_STAR',
      'PIONEER',
      'FIRST_LAUNCH'
    ] as const

    const awarded: string[] = []
    for (const badge of allBadgeTypes) {
      try {
        const ok = await awardBadge(user.id, badge as any)
        if (ok) awarded.push(badge)
      } catch (err) {
        // continue; do not fail whole operation
      }
    }

    return NextResponse.json({
      ok: true,
      userId: user.id,
      xp: updated.xp,
      level: levelProgress.level,
      badgesAwardedNow: awarded
    })
  } catch (error) {
    console.error('grant-perks error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


