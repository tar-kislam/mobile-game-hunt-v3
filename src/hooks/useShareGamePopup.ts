"use client"

import { useState, useEffect } from 'react'

const STORAGE_KEYS = {
  DONT_SHOW_FOR_GAME: (gameId: string) => `mgh_share_dont_show_${gameId}`,
} as const

interface UseShareGamePopupOptions {
  gameId?: string
  isOwner: boolean
  enabled?: boolean
  delayMs?: number // Delay before showing popup (in milliseconds)
}

/**
 * Hook to manage share game popup visibility
 * 
 * Rules:
 * - Show every time user visits the page (with delay)
 * - Respect "don't show again" preference
 */
export function useShareGamePopup({
  gameId,
  isOwner,
  enabled = true,
  delayMs = 2000, // Default 2 seconds delay
}: UseShareGamePopupOptions) {
  const [shouldShow, setShouldShow] = useState(false)

  useEffect(() => {
    if (!enabled || !isOwner || !gameId || typeof window === 'undefined') {
      setShouldShow(false)
      return
    }

    // Check if user opted out for this game
    const dontShowKey = STORAGE_KEYS.DONT_SHOW_FOR_GAME(gameId)
    const dontShow = localStorage.getItem(dontShowKey) === 'true'
    if (dontShow) {
      setShouldShow(false)
      return
    }

    // Show popup after delay
    const timer = setTimeout(() => {
      setShouldShow(true)
    }, delayMs)

    // Cleanup timer on unmount
    return () => {
      clearTimeout(timer)
    }
  }, [gameId, isOwner, enabled, delayMs])

  const markAsShown = () => {
    // No longer needed - we show every time
    // Keeping for backward compatibility
  }

  const markDontShowAgain = (gameId: string) => {
    if (typeof window === 'undefined') return

    const dontShowKey = STORAGE_KEYS.DONT_SHOW_FOR_GAME(gameId)
    localStorage.setItem(dontShowKey, 'true')
  }

  return {
    shouldShow,
    markAsShown,
    markDontShowAgain,
  }
}


