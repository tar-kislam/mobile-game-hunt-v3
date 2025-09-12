"use client"

import { useEffect } from 'react'
import { toast } from 'sonner'
import { checkAndAwardBadges, getBadgeInfo } from '@/lib/badgeService'

interface UseXPNotificationsProps {
  userId?: string
  enabled?: boolean
}

/**
 * Hook to handle XP and badge notifications
 * This hook should be used in components where XP might be gained
 */
export function useXPNotifications({ userId, enabled = true }: UseXPNotificationsProps) {
  useEffect(() => {
    if (!enabled || !userId) return

    // Check for new badges when component mounts
    const checkBadges = async () => {
      try {
        const newlyAwardedBadges = await checkAndAwardBadges(userId)
        
        // Show toast for each newly awarded badge
        newlyAwardedBadges.forEach(badgeType => {
          const badgeInfo = getBadgeInfo(badgeType)
          toast.success(`🎉 Congrats! You earned the ${badgeInfo.emoji} ${badgeInfo.name} badge!`, {
            description: badgeInfo.description,
            duration: 6000,
          })
        })
      } catch (error) {
        console.error('[XP NOTIFICATIONS] Error checking badges:', error)
      }
    }

    checkBadges()
  }, [userId, enabled])
}

/**
 * Show a custom XP gain notification
 */
export function showXPGainNotification(amount: number, reason?: string) {
  const message = reason 
    ? `+${amount} XP for ${reason}` 
    : `+${amount} XP gained!`
    
  toast.success(message, {
    description: 'Keep up the great work!',
    duration: 3000,
  })
}

/**
 * Show a custom badge notification
 */
export function showBadgeNotification(badgeType: string, badgeName: string, emoji: string) {
  toast.success(`🎉 Congrats! You earned the ${emoji} ${badgeName} badge!`, {
    description: 'You\'re making great progress!',
    duration: 6000,
  })
}
