"use client"

import { useState, useEffect } from 'react'
import { SiteTourModal } from '@/components/modals/site-tour-modal'
import { useSiteTourAutoPopup } from '@/hooks/useSiteTourAutoPopup'

export function SiteTourProvider() {
  const [isSiteTourModalOpen, setIsSiteTourModalOpen] = useState(false)

  // Auto-popup functionality
  const { markAsDismissed } = useSiteTourAutoPopup({
    onOpen: () => setIsSiteTourModalOpen(true),
    enabled: true,
  })

  // Allow external open via custom event (for testing)
  useEffect(() => {
    const handler = () => {
      // Clear localStorage to allow popup to show
      if (typeof window !== 'undefined') {
        localStorage.removeItem('mgh_site_tour_last_shown')
        localStorage.removeItem('mgh_site_tour_dismissed')
      }
      setIsSiteTourModalOpen(true)
    }
    
    window.addEventListener('site-tour:open', handler as any)
    return () => window.removeEventListener('site-tour:open', handler as any)
  }, [])

  return (
    <SiteTourModal 
      isOpen={isSiteTourModalOpen} 
      onClose={() => setIsSiteTourModalOpen(false)}
      onDismissed={markAsDismissed}
    />
  )
}

