import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { awardBadge } from '@/lib/badgeService'
import { addXP } from '@/lib/xpService'
import { notify } from '@/lib/notificationService'
import { badgeClaimed } from '@/lib/notifications/messages'
import { getBadgeInfo } from '@/lib/badgeService'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { badgeCode } = body

    if (!badgeCode) {
      return NextResponse.json({ error: 'Badge code is required' }, { status: 400 })
    }

    // Award the badge
    const success = await awardBadge(session.user.id, badgeCode as any)
    
    if (success) {
      // Get badge info for notification
      const badgeInfo = getBadgeInfo(badgeCode as any)
      
      // Add XP reward based on badge type
      const xpRewards: Record<string, number> = {
        'WISE_OWL': 100,
        'FIRE_DRAGON': 200,
        'CLEVER_FOX': 150,
        'GENTLE_PANDA': 120,
        'SWIFT_PUMA': 80
      }
      
      const xpReward = xpRewards[badgeCode] || 100
      await addXP(session.user.id, xpReward)
      
      // Send badge claimed notification
      try {
        await notify(session.user.id, badgeClaimed(badgeInfo.name, xpReward), 'badge_claimed')
      } catch (notificationError) {
        console.error('[BADGE CLAIM] Error sending badge claimed notification:', notificationError)
      }
      
      return NextResponse.json({ success: true, xpReward })
    } else {
      return NextResponse.json({ error: 'Badge already claimed or not available' }, { status: 400 })
    }
  } catch (error) {
    console.error('[BADGE CLAIM] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
