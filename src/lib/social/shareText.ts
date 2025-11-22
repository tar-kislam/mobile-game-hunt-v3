/**
 * Social sharing text template generator
 * Single source of truth for share messages across platforms
 */

export interface ShareTextOptions {
  gameTitle: string
  gameUrl: string
  shortPitch?: string | null
  thumbnail?: string | null
  siteUrl?: string
  platform?: string
}

const DEFAULT_SITE_URL = 'https://mobilegamehunt.com'

/**
 * Normalize URL to always use the live site URL
 */
function normalizeUrl(url: string): string {
  if (!url) return DEFAULT_SITE_URL
  
  // Replace localhost with production URL
  const normalized = url.replace(/https?:\/\/localhost(:\d+)?/g, DEFAULT_SITE_URL)
  
  // If it's a relative path, make it absolute
  if (normalized.startsWith('/')) {
    return `${DEFAULT_SITE_URL}${normalized}`
  }
  
  // If it doesn't start with http, assume it's a path
  if (!normalized.startsWith('http')) {
    return `${DEFAULT_SITE_URL}${normalized.startsWith('/') ? '' : '/'}${normalized}`
  }
  
  return normalized
}

/**
 * Generate base share text template
 */
export function generateShareText({
  gameTitle,
  gameUrl,
  shortPitch,
  siteUrl = DEFAULT_SITE_URL,
  platform,
}: ShareTextOptions): string {
  // Normalize URLs to always use production
  const normalizedUrl = normalizeUrl(gameUrl)
  
  // Build the message
  let message = `I just shared my mobile game "${gameTitle}" on @mobilegamehunt!\n\n`
  
  // Add short pitch if available
  if (shortPitch && shortPitch.trim()) {
    message += `${shortPitch.trim()}\n\n`
  }
  
  // Add link
  message += `🔗 Check it out: ${normalizedUrl}\n\n`
  
  // Add closing
  message += `Always happy to hear feedback from fellow devs & players.`
  
  return message
}

/**
 * Generate share text for specific platform with platform-specific formatting
 */
export function generatePlatformShareText(
  platform: string,
  options: ShareTextOptions
): string {
  const baseText = generateShareText(options)
  const normalizedUrl = normalizeUrl(options.gameUrl)
  
  // Platform-specific adaptations
  switch (platform.toLowerCase()) {
    case 'twitter':
    case 'x': {
      // Twitter/X has 280 character limit, may need to truncate
      // Try to keep the essential parts: title, short pitch (truncated if needed), URL, closing
      let twitterText = `I just shared my mobile game "${options.gameTitle}" on @mobilegamehunt!\n\n`
      
      if (options.shortPitch && options.shortPitch.trim()) {
        const pitch = options.shortPitch.trim()
        // Reserve space for URL and closing (~80 chars)
        const maxPitchLength = 280 - twitterText.length - 80
        if (pitch.length > maxPitchLength) {
          twitterText += `${pitch.substring(0, maxPitchLength - 3)}...\n\n`
        } else {
          twitterText += `${pitch}\n\n`
        }
      }
      
      twitterText += `🔗 ${normalizedUrl}\n\n`
      twitterText += `Always happy to hear feedback from fellow devs & players.`
      
      // Final check - if still too long, truncate the pitch more aggressively
      if (twitterText.length > 280) {
        const essentialParts = `I just shared my mobile game "${options.gameTitle}" on @mobilegamehunt!\n\n🔗 ${normalizedUrl}\n\nAlways happy to hear feedback from fellow devs & players.`
        const remainingSpace = 280 - essentialParts.length - 10 // buffer
        if (remainingSpace > 20 && options.shortPitch) {
          const truncatedPitch = options.shortPitch.trim().substring(0, remainingSpace - 3) + '...'
          return `I just shared my mobile game "${options.gameTitle}" on @mobilegamehunt!\n\n${truncatedPitch}\n\n🔗 ${normalizedUrl}\n\nAlways happy to hear feedback from fellow devs & players.`
        }
        return essentialParts
      }
      
      return twitterText
    }
    
    case 'tiktok':
    case 'instagram':
    case 'discord':
    case 'facebook':
    case 'linkedin':
    case 'reddit':
      // These platforms support longer text, use full message
      return baseText
      
    default:
      return baseText
  }
}


