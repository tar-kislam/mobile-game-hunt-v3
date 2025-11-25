import { DevicePlatform } from './device-platform'

type TrackingType = 'IOS' | 'ANDROID' | 'STORE' | 'WEBSITE'

interface ProductPlayLinks {
  url?: string | null
  demoUrl?: string | null
  iosUrl?: string | null
  androidUrl?: string | null
  socialLinks?: {
    website?: string | null
  } | null
}

export interface PlayTarget {
  url: string
  trackingType: TrackingType
}

const sanitizeUrl = (value?: string | null): string | null => {
  if (!value) return null
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

const buildTarget = (url: string | null, trackingType: TrackingType): PlayTarget | null => {
  const safeUrl = sanitizeUrl(url)
  return safeUrl ? { url: safeUrl, trackingType } : null
}

const collectFallbackTargets = (product: ProductPlayLinks): PlayTarget[] => {
  const targets: PlayTarget[] = []

  const primary = buildTarget(product.url ?? product.socialLinks?.website ?? null, 'STORE')
  if (primary) targets.push(primary)

  const demo = buildTarget(product.demoUrl ?? null, 'STORE')
  if (demo) targets.push(demo)

  return targets
}

export const resolvePlayTarget = (product: ProductPlayLinks, platform: DevicePlatform): PlayTarget | null => {
  const iosTarget = buildTarget(product.iosUrl ?? null, 'IOS')
  const androidTarget = buildTarget(product.androidUrl ?? null, 'ANDROID')
  const fallbackTargets = collectFallbackTargets(product)

  const firstValid = (...targets: Array<PlayTarget | null | undefined>) => {
    return targets.find((target): target is PlayTarget => !!target)
  }

  if (platform === 'android') {
    return (
      firstValid(androidTarget, iosTarget, ...fallbackTargets) ?? null
    )
  }

  if (platform === 'ios') {
    return (
      firstValid(iosTarget, androidTarget, ...fallbackTargets) ?? null
    )
  }

  // Desktop / other
  return (
    firstValid(...fallbackTargets, androidTarget, iosTarget) ?? null
  )
}


