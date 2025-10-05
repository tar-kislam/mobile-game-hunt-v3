'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { pageview } from '@/lib/analytics'

export function PageTracking() {
  const pathname = usePathname()

  useEffect(() => {
    // Track page views in Google Analytics
    pageview(pathname)
  }, [pathname])

  return null
}

