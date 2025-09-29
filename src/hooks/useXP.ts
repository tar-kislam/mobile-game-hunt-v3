"use client"

import useSWR from 'swr'
import { useEffect } from 'react'
import { calculateLevelProgress } from '@/lib/xpCalculator'
import { useSession } from 'next-auth/react'

interface XPData {
  id: string
  xp: number
  level: number
  xpToNextLevel: number
  xpProgress: number
  currentXP: number
  remainingXP: number
}

interface UseXPResult {
  xpData: XPData | undefined
  isLoading: boolean
  error: any
  mutate: () => void
  levelProgress: ReturnType<typeof calculateLevelProgress> | null
}

const fetcher = (url: string) => fetch(url).then(r => r.json())

/**
 * Centralized hook for managing user XP data
 * Provides synchronized XP data across all components
 */
export function useXP(userId: string): UseXPResult {
  const { data: xpData, error, isLoading, mutate } = useSWR<XPData>(
    userId ? `/api/user/${userId}/xp` : null,
    fetcher,
    {
      refreshInterval: 5000, // Refresh every 5 seconds
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      dedupingInterval: 2000, // Dedupe requests within 2 seconds
    }
  )

  // Listen for XP updates from other components
  useEffect(() => {
    const handleXPUpdate = (event: CustomEvent) => {
      // Only update if this is the current user's XP update
      if (event.detail?.userId === userId) {
        mutate()
      }
    }

    window.addEventListener('xp-updated', handleXPUpdate as EventListener)
    return () => window.removeEventListener('xp-updated', handleXPUpdate as EventListener)
  }, [userId, mutate])

  // Calculate level progress from XP data
  const levelProgress = xpData ? calculateLevelProgress(xpData.xp) : null

  return {
    xpData,
    isLoading,
    error,
    mutate,
    levelProgress
  }
}

/**
 * Hook for current user's XP (uses session)
 */
export function useCurrentUserXP(): UseXPResult {
  const { data: session } = useSession()
  return useXP(session?.user?.id || '')
}
