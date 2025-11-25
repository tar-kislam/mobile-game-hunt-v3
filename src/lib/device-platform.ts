export type DevicePlatform = 'ios' | 'android' | 'other'

const IOS_REGEX = /(iphone|ipad|ipod)/i

export function detectDevicePlatform(userAgent?: string, maxTouchPoints?: number): DevicePlatform {
  if (typeof userAgent !== 'string') {
    return 'other'
  }

  const ua = userAgent.toLowerCase()

  if (ua.includes('android')) {
    return 'android'
  }

  if (IOS_REGEX.test(userAgent)) {
    return 'ios'
  }

  // Detect iPadOS devices that report as Mac
  if (userAgent.includes('Mac') && (maxTouchPoints ?? 0) > 1) {
    return 'ios'
  }

  return 'other'
}


