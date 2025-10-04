/**
 * Maps badge codes to their corresponding image filenames in /public/badges/
 * This ensures consistent badge icon loading across the application
 */

export function getBadgeIconFilename(badgeCode: string): string {
  const badgeIconMap: Record<string, string> = {
    'PIONEER': 'badge-pioneer.webp',
    'WISE_OWL': 'badge-owl.webp', 
    'FIRE_DRAGON': 'badge-dragon.webp',
    'CLEVER_FOX': 'badge-fox.webp',
    'GENTLE_PANDA': 'badge-panda.webp',
    'SWIFT_PUMA': 'badge-puma.webp',
    'EXPLORER': 'badge-explorer.webp',
    'RISING_STAR': 'badge-star.webp',
    'FIRST_LAUNCH': 'default.svg', // Fallback since we don't have this file yet
  }

  return badgeIconMap[badgeCode] || 'default.svg'
}

export function getBadgeIconPath(badgeCode: string): string {
  const filename = getBadgeIconFilename(badgeCode)
  return `/badges/${filename}`
}
