import { useEffect, useState } from 'react'
import { DevicePlatform, detectDevicePlatform } from '@/lib/device-platform'

export function useDevicePlatform() {
  const [platform, setPlatform] = useState<DevicePlatform>('other')

  useEffect(() => {
    if (typeof window === 'undefined') return

    const ua = window.navigator?.userAgent || ''
    const maxTouchPoints = window.navigator?.maxTouchPoints || 0
    setPlatform(detectDevicePlatform(ua, maxTouchPoints))
  }, [])

  return platform
}


