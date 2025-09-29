import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { addXP } from '@/lib/xpService'
import { checkAndAwardBadges, getUserBadges } from '@/lib/badgeService'
import { prisma } from '@/lib/prisma'
import { calculateLevelProgress } from '@/lib/xpCalculator'
import { z } from 'zod'

// Only allow in development
if (process.env.NODE_ENV !== 'development') {
  throw new Error('Test notifications endpoint is only available in development')
}

const testNotificationSchema = z.object({
  kind: z.enum(['xp', 'level', 'badge_unlock', 'badge_claim'])
})

export async function POST(req: NextRequest) {
  try {
    // Double-check environment
    if (process.env.NODE_ENV !== 'development') {
      return NextResponse.json({ error: 'Not available in production' }, { status: 403 })
    }

    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { kind } = testNotificationSchema.parse(body)

    const userId = session.user.id
    let result: any = { success: true, kind }

    switch (kind) {
      case 'xp': {
        // Add 25 XP to trigger XP notification
        const xpResult = await addXP(userId, 25)
        result = {
          ...result,
          message: 'Added 25 XP',
          xpBefore: xpResult.xp - 25,
          xpAfter: xpResult.xp,
          level: xpResult.level
        }
        break
      }

      case 'level': {
        // Get current user XP and level
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { xp: true, level: true }
        })

        if (!user) {
          return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        // Calculate XP needed to reach next level using centralized calculation
        const levelProgress = calculateLevelProgress(user.xp)
        const xpNeeded = levelProgress.remainingXP + 1 // Add 1 to ensure level up

        // Add XP to trigger level up
        const levelResult = await addXP(userId, xpNeeded)
        result = {
          ...result,
          message: `Added ${xpNeeded} XP to trigger level up`,
          xpBefore: user.xp,
          xpAfter: levelResult.xp,
          levelBefore: levelProgress.level,
          levelAfter: calculateLevelProgress(levelResult.xp).level
        }
        break
      }

      case 'badge_unlock': {
        // Get user's current comment count
        const commentCount = await prisma.postComment.count({
          where: { userId }
        })

        // Get Wise Owl badge requirement (50 comments)
        const badgeRequirement = 50
        const commentsNeeded = Math.max(0, badgeRequirement - commentCount)

        if (commentsNeeded === 0) {
          // User already has enough comments, check if badge is already unlocked
          const userBadges = await getUserBadges(userId)
          if (userBadges.includes('WISE_OWL')) {
            result = {
              ...result,
              message: 'Wise Owl badge already unlocked',
              badgeStatus: 'already_unlocked'
            }
          } else {
            // Force check badges to unlock
            const newBadges = await checkAndAwardBadges(userId)
            result = {
              ...result,
              message: 'Checked badges for unlock',
              newBadges,
              badgeStatus: 'unlocked'
            }
          }
        } else {
          // Add fake comments to reach threshold
          for (let i = 0; i < commentsNeeded; i++) {
            await prisma.postComment.create({
              data: {
                content: `Test comment ${i + 1} for badge unlock`,
                userId,
                postId: 'test-post-id', // This will fail if no posts exist, but that's ok for testing
                createdAt: new Date()
              }
            })
          }

          // Check for badge unlock
          const newBadges = await checkAndAwardBadges(userId)
          result = {
            ...result,
            message: `Added ${commentsNeeded} test comments to unlock Wise Owl badge`,
            commentsAdded: commentsNeeded,
            newBadges,
            badgeStatus: 'unlocked'
          }
        }
        break
      }

      case 'badge_claim': {
        // Check if user has any unlocked badges
        const userBadges = await getUserBadges(userId)
        
        if (userBadges.length === 0) {
          // First unlock a badge
          const newBadges = await checkAndAwardBadges(userId)
          if (newBadges.length === 0) {
            return NextResponse.json({ 
              error: 'No badges available to claim. Try badge_unlock first.' 
            }, { status: 400 })
          }
        }

        // Get user's XP before claiming
        const userBefore = await prisma.user.findUnique({
          where: { id: userId },
          select: { xp: true, level: true }
        })

        // Claim the first available badge
        const availableBadges = await getUserBadges(userId)
        const badgeToClaim = availableBadges[0]

        // Call the badge claim API
        const claimResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/badges/claim`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Cookie': req.headers.get('cookie') || ''
          },
          body: JSON.stringify({ badgeCode: badgeToClaim })
        })

        if (!claimResponse.ok) {
          const errorData = await claimResponse.json()
          return NextResponse.json({ 
            error: 'Failed to claim badge', 
            details: errorData 
          }, { status: 400 })
        }

        const claimData = await claimResponse.json()

        // Get user's XP after claiming
        const userAfter = await prisma.user.findUnique({
          where: { id: userId },
          select: { xp: true, level: true }
        })

        result = {
          ...result,
          message: `Claimed ${badgeToClaim} badge`,
          badgeClaimed: badgeToClaim,
          xpBefore: userBefore?.xp,
          xpAfter: userAfter?.xp,
          xpReward: claimData.xpReward,
          levelBefore: userBefore?.level,
          levelAfter: userAfter?.level
        }
        break
      }

      default:
        return NextResponse.json({ error: 'Invalid test kind' }, { status: 400 })
    }

    return NextResponse.json(result)

  } catch (error) {
    console.error('[DEV TEST NOTIFICATIONS] Error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Validation failed', 
        details: error.issues 
      }, { status: 400 })
    }

    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// Only allow GET in development for testing
export async function GET() {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 })
  }

  return NextResponse.json({
    message: 'Test notifications endpoint',
    availableTests: ['xp', 'level', 'badge_unlock', 'badge_claim'],
    usage: 'POST with { "kind": "xp|level|badge_unlock|badge_claim" }',
    environment: process.env.NODE_ENV
  })
}
