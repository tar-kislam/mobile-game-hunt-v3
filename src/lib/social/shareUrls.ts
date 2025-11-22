/**
 * Generate share URLs for different social platforms
 */

import { generatePlatformShareText, ShareTextOptions } from './shareText'

export interface ShareAction {
  type: 'url' | 'copy'
  url?: string
  text?: string
  platform: string
  redirectUrl?: string // Optional redirect URL for copy-to-clipboard actions
}

/**
 * Normalize URL to always use the live site URL
 */
function normalizeUrl(url: string): string {
  const DEFAULT_SITE_URL = 'https://mobilegamehunt.com'
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
 * Normalize thumbnail URL
 */
function normalizeThumbnailUrl(thumbnail: string | null | undefined): string | null {
  if (!thumbnail) return null
  return normalizeUrl(thumbnail)
}

/**
 * Generate share action for a platform
 */
export function getShareAction(
  platform: string,
  options: ShareTextOptions
): ShareAction {
  const shareText = generatePlatformShareText(platform, options)
  const normalizedUrl = normalizeUrl(options.gameUrl)
  const encodedText = encodeURIComponent(shareText)
  const encodedUrl = encodeURIComponent(normalizedUrl)
  
  switch (platform.toLowerCase()) {
    case 'twitter':
    case 'x': {
      // Twitter/X share URL - uses the new template
      // Note: Twitter doesn't support image URL in intent URLs, but the OG image will be picked up
      return {
        type: 'url',
        url: `https://twitter.com/intent/tweet?text=${encodedText}`,
        platform: 'x',
      }
    }
    
    case 'facebook': {
      // Facebook will pick up OG image from the URL
      return {
        type: 'url',
        url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
        platform: 'facebook',
      }
    }
    
    case 'linkedin': {
      // LinkedIn will pick up OG image from the URL
      const summary = options.shortPitch 
        ? `${options.gameTitle} - ${options.shortPitch}`
        : options.gameTitle
      return {
        type: 'url',
        url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}&summary=${encodeURIComponent(summary)}`,
        platform: 'linkedin',
      }
    }
    
    case 'reddit': {
      // Reddit title - use game title and short pitch if available
      const title = options.shortPitch
        ? `${options.gameTitle} - ${options.shortPitch}`
        : `I just shared my mobile game "${options.gameTitle}" on @mobilegamehunt!`
      return {
        type: 'url',
        url: `https://reddit.com/submit?url=${encodedUrl}&title=${encodeURIComponent(title)}`,
        platform: 'reddit',
      }
    }
    
    case 'tiktok': {
      // TikTok doesn't have official web share URL, but we can redirect to TikTok web
      // User can paste the copied text manually
      return {
        type: 'copy',
        text: shareText,
        platform: 'tiktok',
        redirectUrl: 'https://www.tiktok.com/upload', // TikTok upload page
      }
    }
    
    case 'instagram': {
      // Instagram doesn't have official web share URL, but we can redirect to Instagram web
      // User can paste the copied text manually
      return {
        type: 'copy',
        text: shareText,
        platform: 'instagram',
        redirectUrl: 'https://www.instagram.com/', // Instagram home page
      }
    }
    
    case 'discord': {
      // Discord doesn't have easy web share URLs, use copy to clipboard
      return {
        type: 'copy',
        text: shareText,
        platform: 'discord',
      }
    }
    
    default:
      return {
        type: 'copy',
        text: shareText,
        platform: platform.toLowerCase(),
      }
  }
}

/**
 * Get all supported platforms
 */
export const SUPPORTED_PLATFORMS = [
  { id: 'tiktok', name: 'TikTok', icon: '🎵' },
  { id: 'x', name: 'X (Twitter)', icon: '🐦' },
  { id: 'instagram', name: 'Instagram', icon: '📷' },
  { id: 'facebook', name: 'Facebook', icon: '👥' },
  { id: 'discord', name: 'Discord', icon: '💬' },
  { id: 'reddit', name: 'Reddit', icon: '🤖' },
  { id: 'linkedin', name: 'LinkedIn', icon: '💼' },
] as const


