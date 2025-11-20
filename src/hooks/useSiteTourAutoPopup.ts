"use client"

import { useEffect, useState, useCallback } from 'react'

// Configuration - Monthly interval (30 days)
const POPUP_INTERVAL_DAYS = 30
const POPUP_INTERVAL_MS = POPUP_INTERVAL_DAYS * 24 * 60 * 60 * 1000
const MIN_DELAY_MS = 20000 // 20 seconds
const RANDOM_DELAY_MS = 10000 // ±5 seconds
const SCROLL_THRESHOLD = 0.3 // 30% of page

// LocalStorage keys
const STORAGE_KEYS = {
  LAST_SHOWN: 'mgh_site_tour_last_shown',
  DISMISSED: 'mgh_site_tour_dismissed',
}

interface UseSiteTourAutoPopupOptions {
  onOpen: () => void
  enabled?: boolean
}

interface SiteTourAutoPopupState {
  shouldShowPopup: boolean
  markAsShown: () => void
  markAsDismissed: () => void
}

export function useSiteTourAutoPopup({
  onOpen,
  enabled = true,
}: UseSiteTourAutoPopupOptions): SiteTourAutoPopupState {
  const [shouldShowPopup, setShouldShowPopup] = useState(false)
  const [hasShownThisSession, setHasShownThisSession] = useState(false)
  const [scrollDepthReached, setScrollDepthReached] = useState(false)
  const [timePassed, setTimePassed] = useState(false)

  // Check if popup should be shown based on timing
  const shouldShow = useCallback((): boolean => {
    if (typeof window === 'undefined') return false

    const now = Date.now()
    const lastShown = localStorage.getItem(STORAGE_KEYS.LAST_SHOWN)
    const dismissed = localStorage.getItem(STORAGE_KEYS.DISMISSED)

    // Check if enough time has passed since last shown
    if (lastShown) {
      const timeSinceLastShown = now - Number(lastShown)
      if (timeSinceLastShown < POPUP_INTERVAL_MS) {
        return false
      }
    }

    // Check if enough time has passed since dismissed
    if (dismissed) {
      const timeSinceDismissed = now - Number(dismissed)
      if (timeSinceDismissed < POPUP_INTERVAL_MS) {
        return false
      }
    }

    return true
  }, [])

  // Check if user is actively interacting with forms
  const isUserInteracting = useCallback((): boolean => {
    if (typeof window === 'undefined') return false
    const activeElement = document.activeElement
    if (!activeElement) return false

    const tagName = activeElement.tagName.toLowerCase()
    return (
      tagName === 'input' ||
      tagName === 'textarea' ||
      tagName === 'select' ||
      activeElement.getAttribute('contenteditable') === 'true'
    )
  }, [])

  // Mark as shown
  const markAsShown = useCallback(() => {
    if (typeof window === 'undefined') return
    localStorage.setItem(STORAGE_KEYS.LAST_SHOWN, Date.now().toString())
    setHasShownThisSession(true)
  }, [])

  // Mark as dismissed
  const markAsDismissed = useCallback(() => {
    if (typeof window === 'undefined') return
    localStorage.setItem(STORAGE_KEYS.DISMISSED, Date.now().toString())
  }, [])

  // Setup scroll depth tracking
  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return

    const handleScroll = () => {
      const scrollTop = window.scrollY
      const documentHeight = document.documentElement.scrollHeight
      const windowHeight = window.innerHeight
      const scrollPercentage = scrollTop / (documentHeight - windowHeight)

      if (scrollPercentage >= SCROLL_THRESHOLD) {
        setScrollDepthReached(true)
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [enabled])

  // Setup timing trigger
  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return

    const delay = MIN_DELAY_MS + Math.random() * RANDOM_DELAY_MS
    const timeoutId = setTimeout(() => {
      setTimePassed(true)
    }, delay)

    return () => clearTimeout(timeoutId)
  }, [enabled])

  // Trigger popup when conditions are met
  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return
    if (hasShownThisSession) return
    if (!shouldShow()) return

    // Wait for either scroll depth or time to pass
    if (!scrollDepthReached && !timePassed) return

    // Don't show if user is interacting with forms
    if (isUserInteracting()) {
      // Try again after a delay
      const retryTimeout = setTimeout(() => {
        if (!isUserInteracting() && shouldShow() && !hasShownThisSession) {
          setShouldShowPopup(true)
          markAsShown()
          
          // Use requestIdleCallback if available, otherwise setTimeout
          if ('requestIdleCallback' in window) {
            requestIdleCallback(() => {
              onOpen()
            })
          } else {
            setTimeout(() => {
              onOpen()
            }, 100)
          }
        }
      }, 5000)

      return () => clearTimeout(retryTimeout)
    }

    // Show the popup
    setShouldShowPopup(true)
    markAsShown()
    
    // Use requestIdleCallback if available
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        onOpen()
      })
    } else {
      setTimeout(() => {
        onOpen()
      }, 100)
    }
  }, [
    enabled,
    hasShownThisSession,
    scrollDepthReached,
    timePassed,
    shouldShow,
    isUserInteracting,
    markAsShown,
    onOpen,
  ])

  return {
    shouldShowPopup,
    markAsShown,
    markAsDismissed,
  }
}

// Utility function to reset all site tour popup data (for testing)
export function resetSiteTourPopupData() {
  if (typeof window === 'undefined') return
  localStorage.removeItem(STORAGE_KEYS.LAST_SHOWN)
  localStorage.removeItem(STORAGE_KEYS.DISMISSED)
}

// Utility function to check current status (for debugging)
export function getSiteTourPopupStatus() {
  if (typeof window === 'undefined') return null
  
  const now = Date.now()
  const lastShown = localStorage.getItem(STORAGE_KEYS.LAST_SHOWN)
  const dismissed = localStorage.getItem(STORAGE_KEYS.DISMISSED)

  return {
    lastShown: lastShown ? new Date(Number(lastShown)).toISOString() : null,
    dismissed: dismissed ? new Date(Number(dismissed)).toISOString() : null,
    timeSinceLastShown: lastShown ? Math.floor((now - Number(lastShown)) / 1000 / 60 / 60 / 24) : null, // days
    timeSinceDismissed: dismissed ? Math.floor((now - Number(dismissed)) / 1000 / 60 / 60 / 24) : null, // days
    nextEligibleTime: lastShown 
      ? new Date(Number(lastShown) + POPUP_INTERVAL_MS).toISOString()
      : null,
  }
}



