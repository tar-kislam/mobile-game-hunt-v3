import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserBadges, getAllBadgeConfigs } from '@/lib/badgeService'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    if (!id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Get user's earned badges
    const earnedBadges = await getUserBadges(id)
    
    // Get all badge configurations
    const allBadgeConfigs = getAllBadgeConfigs()
    
    // Get user stats for progress calculation
    const userStats = await prisma.user.findUnique({
      where: { id },
      select: {
        createdAt: true,
        _count: {
          select: {
            products: true,
            votes: true,
            comments: true,
            follows: true
          }
        }
      }
    })

    if (!userStats) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get likes received on user's products
    const likesReceived = await prisma.vote.count({
      where: {
        product: {
          userId: id
        }
      }
    })

    // Calculate progress for each badge
    const badgeProgress = Object.values(allBadgeConfigs).map(badgeConfig => {
      const isEarned = earnedBadges.includes(badgeConfig.type)
      let progress = 0
      let current = 0
      let target = badgeConfig.requirementValue
      let progressText = ''

      switch (badgeConfig.type) {
        case 'WISE_OWL':
          current = userStats._count.comments
          progress = isEarned ? 100 : Math.min((current / target) * 100, 100)
          progressText = isEarned ? 'Unlocked!' : `${current}/${target} comments`
          break
          
        case 'FIRE_DRAGON':
          current = userStats._count.products
          progress = isEarned ? 100 : Math.min((current / target) * 100, 100)
          progressText = isEarned ? 'Unlocked!' : `${current}/${target} games`
          break
          
        case 'CLEVER_FOX':
          current = userStats._count.votes
          progress = isEarned ? 100 : Math.min((current / target) * 100, 100)
          progressText = isEarned ? 'Unlocked!' : `${current}/${target} votes`
          break
          
        case 'GENTLE_PANDA':
          current = likesReceived
          progress = isEarned ? 100 : Math.min((current / target) * 100, 100)
          progressText = isEarned ? 'Unlocked!' : `${current}/${target} likes`
          break
          
        case 'SWIFT_PUMA':
          current = userStats._count.follows
          progress = isEarned ? 100 : Math.min((current / target) * 100, 100)
          progressText = isEarned ? 'Unlocked!' : `${current}/${target} follows`
          break
      }

      return {
        ...badgeConfig,
        isEarned,
        progress: Math.round(progress),
        current,
        target,
        progressText
      }
    })

    return NextResponse.json({ badges: badgeProgress })
  } catch (error) {
    console.error('[BADGE PROGRESS] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
