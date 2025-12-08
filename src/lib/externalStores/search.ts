/**
 * External Game Store Search Service
 * Searches Apple App Store and Google Play Store via SearchAPI
 */

import { buildSearchApiUrl, SEARCHAPI_CONFIG, SEARCH_ENGINES, isSearchApiConfigured } from './config'
import { QuestGameResult, QuestGameStore } from '../quest/types'
import { CacheService } from '@/lib/redis'
import crypto from 'crypto'

const cacheService = CacheService.getInstance()
const CACHE_TTL = 24 * 60 * 60 // 24 hours in seconds

export type ExternalStoreSearchParams = {
  query: string // search text derived from Quest preferences
  limit?: number // max items
}

// Normalize external game results to unified format
function normalizeExternalResult(
  item: any,
  store: QuestGameStore,
  position: number
): QuestGameResult {
  // SearchAPI response format may vary - handle multiple possible fields
  const title = item.title || item.name || item.app_name || 'Unknown Game'
  const description = item.description || item.snippet || item.long_description || item.summary || item.about || ''
  
  // Try multiple possible thumbnail fields (including nested structures)
  let thumbnailUrl = ''
  
  // Apple App Store: logos array contains thumbnail
  if (item.logos && Array.isArray(item.logos) && item.logos.length > 0) {
    // Prefer larger logo (512x512 or 100x100)
    const largeLogo = item.logos.find((logo: any) => logo.width >= 100) || item.logos[0]
    thumbnailUrl = largeLogo.link || ''
  }
  // Google Play Store and others: direct thumbnail field
  else if (item.thumbnail) {
    thumbnailUrl = typeof item.thumbnail === 'string' ? item.thumbnail : (item.thumbnail.url || item.thumbnail[0] || '')
  }
  // Fallback options
  else if (item.icon) {
    thumbnailUrl = typeof item.icon === 'string' ? item.icon : (item.icon.url || item.icon[0] || '')
  } else if (item.image) {
    thumbnailUrl = typeof item.image === 'string' ? item.image : (item.image.url || item.image[0] || '')
  } else if (item.logo) {
    thumbnailUrl = typeof item.logo === 'string' ? item.logo : (item.logo.url || item.logo[0] || '')
  } else if (item.screenshot) {
    thumbnailUrl = typeof item.screenshot === 'string' ? item.screenshot : (item.screenshot[0] || (Array.isArray(item.screenshot) ? item.screenshot[0] : ''))
  } else if (item.images && Array.isArray(item.images) && item.images.length > 0) {
    thumbnailUrl = typeof item.images[0] === 'string' ? item.images[0] : (item.images[0].url || item.images[0])
  } else if (item.thumbnails && Array.isArray(item.thumbnails) && item.thumbnails.length > 0) {
    thumbnailUrl = typeof item.thumbnails[0] === 'string' ? item.thumbnails[0] : (item.thumbnails[0].url || item.thumbnails[0])
  }
  
  let link = item.link || item.url || item.store_url || item.app_url || ''
  
  // Clean and validate link
  link = String(link).trim()
  
  // For Google Play Store, ensure link is properly formatted
  if (store === 'google_play_store') {
    // Always prefer product_id to construct URL (most reliable)
    if (item.product_id && typeof item.product_id === 'string') {
      link = `https://play.google.com/store/apps/details?id=${item.product_id}`
    } else if (link && link.startsWith('http')) {
      // Use existing link if it's valid
      link = link.trim()
      // Ensure it's a valid Play Store URL format
      if (!link.includes('play.google.com')) {
        link = ''
      }
    } else {
      // No valid link or product_id
      link = ''
    }
  }
  
  // For Apple App Store, ensure link is properly formatted
  if (store === 'apple_app_store' && link && !link.startsWith('http')) {
    // If we have an id, construct App Store URL
    if (item.id) {
      link = `https://apps.apple.com/app/id${item.id}`
    } else if (item.bundle_id) {
      // Try bundle_id as fallback
      link = `https://apps.apple.com/app/bundle/${item.bundle_id}`
    }
  }
  
  const category = item.category || item.genre || item.category_name || item.primary_category || 'Game'
  
  // Simple scoring based on position (higher = better)
  const score = 100 - position
  
  // Ensure thumbnailUrl is a valid URL string and absolute
  let validThumbnail = thumbnailUrl && typeof thumbnailUrl === 'string' ? thumbnailUrl.trim() : ''
  
  // If thumbnail is a relative URL, try to make it absolute
  if (validThumbnail && !validThumbnail.startsWith('http')) {
    // Skip relative URLs - we need absolute URLs for external images
    validThumbnail = ''
  }
  
  // Log link for debugging
  if (link && process.env.NODE_ENV === 'development') {
    console.log(`[EXTERNAL_SEARCH] Normalized link for ${store}:`, link)
  }
  
  return {
    id: null,
    slug: null,
    source: 'external',
    verified: false,
    store,
    title: String(title).trim(),
    shortPitch: String(description).slice(0, 160).trim() || 'A mobile game from the store',
    thumbnailUrl: validThumbnail,
    categories: [String(category).trim()],
    matchRank: 0, // will be set later by parent
    score,
    metrics: {},
    links: {
      externalStoreUrl: link,
    },
  }
}

// Search Apple App Store
async function searchAppleAppStore(query: string, limit: number): Promise<QuestGameResult[]> {
  try {
    const url = buildSearchApiUrl({
      engine: SEARCH_ENGINES.apple,
      device: 'mobile',
      term: query,
    })
    
    // Add API key as query parameter (SearchAPI format)
    const urlWithKey = new URL(url)
    urlWithKey.searchParams.set('api_key', SEARCHAPI_CONFIG.apiKey)
    
    console.log('[EXTERNAL_SEARCH] Apple App Store search URL:', urlWithKey.toString().replace(SEARCHAPI_CONFIG.apiKey, '***'))
    
    const response = await fetch(urlWithKey.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      next: { revalidate: 0 }, // Don't cache fetch
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error(`[EXTERNAL_SEARCH] Apple App Store search failed: ${response.status} ${response.statusText}`, errorText)
      return []
    }
    
    const data = await response.json()
    
    // Try multiple possible result field names
    const results = data.organic_results || data.results || data.apps || []
    
    console.log(`[EXTERNAL_SEARCH] Apple App Store found ${results.length} results`)
    
    // Debug: Log first result structure
    if (results.length > 0) {
      console.log('[EXTERNAL_SEARCH] Apple App Store first result structure:', JSON.stringify(results[0], null, 2))
    } else {
      console.warn('[EXTERNAL_SEARCH] Apple App Store returned no results for query:', query)
    }
    
    const normalized = results.slice(0, limit).map((item: any, index: number) =>
      normalizeExternalResult(item, 'apple_app_store', index)
    )
    
    console.log(`[EXTERNAL_SEARCH] Apple App Store normalized ${normalized.length} results with thumbnails:`, normalized.filter(g => g.thumbnailUrl).length)
    
    return normalized
  } catch (error) {
    console.error('[EXTERNAL_SEARCH] Apple App Store search error:', error)
    if (error instanceof Error) {
      console.error('[EXTERNAL_SEARCH] Error details:', error.message, error.stack)
    }
    return []
  }
}

// Search Google Play Store
async function searchGooglePlayStore(query: string, limit: number): Promise<QuestGameResult[]> {
  try {
    const url = buildSearchApiUrl({
      engine: SEARCH_ENGINES.googlePlay,
      store: 'games',
      term: query,
    })
    
    // Add API key as query parameter (SearchAPI format)
    const urlWithKey = new URL(url)
    urlWithKey.searchParams.set('api_key', SEARCHAPI_CONFIG.apiKey)
    
    console.log('[EXTERNAL_SEARCH] Google Play Store search URL:', urlWithKey.toString().replace(SEARCHAPI_CONFIG.apiKey, '***'))
    
    const response = await fetch(urlWithKey.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      next: { revalidate: 0 }, // Don't cache fetch
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error(`[EXTERNAL_SEARCH] Google Play Store search failed: ${response.status} ${response.statusText}`, errorText)
      return []
    }
    
    const data = await response.json()
    
    // Log full response structure for debugging
    console.log('[EXTERNAL_SEARCH] Google Play Store response keys:', Object.keys(data))
    
    // Google Play Store has nested structure: organic_results is array of objects with "items" array
    const rawResults = data.organic_results || data.results || data.apps || data.games || []
    
    // Flatten nested structure: extract items from each result object
    const flatResults: any[] = []
    for (const resultGroup of rawResults) {
      if (resultGroup.items && Array.isArray(resultGroup.items)) {
        // This is a nested structure with items array - filter out category headers
        const realGames = resultGroup.items.filter((item: any) => {
          // Filter out category headers and invalid items
          // Real games should have: link, product_id, and title
          const hasLink = item.link && typeof item.link === 'string' && item.link.includes('play.google.com')
          const hasProductId = item.product_id && typeof item.product_id === 'string'
          const hasTitle = item.title && typeof item.title === 'string' && item.title.length > 0
          const isNotCategoryHeader = !item.title?.toLowerCase().includes('browse') && 
                                      !item.title?.toLowerCase().includes('popular') &&
                                      !item.subtitle?.toLowerCase().includes('great place')
          
          return hasLink && hasProductId && hasTitle && isNotCategoryHeader
        })
        flatResults.push(...realGames)
      } else if (resultGroup.title && resultGroup.link && resultGroup.product_id) {
        // This is already a flat item - but check if it's a real game
        const isNotCategoryHeader = !resultGroup.title?.toLowerCase().includes('browse') && 
                                    !resultGroup.title?.toLowerCase().includes('popular')
        if (isNotCategoryHeader && resultGroup.link.includes('play.google.com')) {
          flatResults.push(resultGroup)
        }
      }
    }
    
    console.log(`[EXTERNAL_SEARCH] Google Play Store found ${rawResults.length} result groups, ${flatResults.length} real games after filtering`)
    
    // Debug: Log first result structure
    if (flatResults.length > 0) {
      console.log('[EXTERNAL_SEARCH] Google Play Store first real game:', JSON.stringify(flatResults[0], null, 2))
    } else {
      console.warn('[EXTERNAL_SEARCH] Google Play Store returned no real games for query:', query)
      if (rawResults.length > 0) {
        console.warn('[EXTERNAL_SEARCH] First result group structure:', JSON.stringify(rawResults[0], null, 2))
      }
    }
    
    const normalized = flatResults.slice(0, limit).map((item: any, index: number) =>
      normalizeExternalResult(item, 'google_play_store', index)
    )
    
    console.log(`[EXTERNAL_SEARCH] Google Play Store normalized ${normalized.length} results with thumbnails:`, normalized.filter(g => g.thumbnailUrl).length)
    
    return normalized
  } catch (error) {
    console.error('[EXTERNAL_SEARCH] Google Play Store search error:', error)
    if (error instanceof Error) {
      console.error('[EXTERNAL_SEARCH] Error details:', error.message, error.stack)
    }
    return []
  }
}

// Generate cache key for query
function getCacheKey(query: string): string {
  const hash = crypto.createHash('md5').update(query.toLowerCase().trim()).digest('hex')
  return `quest:external:${hash}`
}

// Search external games from both stores
export async function searchExternalGames(
  params: ExternalStoreSearchParams
): Promise<QuestGameResult[]> {
  // Check if SearchAPI is configured
  if (!isSearchApiConfigured()) {
    console.warn('[EXTERNAL_SEARCH] SearchAPI not configured, skipping external search')
    console.warn('[EXTERNAL_SEARCH] Config check:', {
      hasApiKey: !!SEARCHAPI_CONFIG.apiKey,
      apiKeyLength: SEARCHAPI_CONFIG.apiKey?.length || 0,
      baseUrl: SEARCHAPI_CONFIG.baseUrl
    })
    return []
  }
  
  console.log('[EXTERNAL_SEARCH] Starting external search...')
  
  const { query, limit = 10 } = params
  
  // Check cache first (temporarily disabled for debugging)
  // const cacheKey = getCacheKey(query)
  // try {
  //   const cached = await cacheService.get<QuestGameResult[]>(cacheKey)
  //   if (cached) {
  //     console.log('[EXTERNAL_SEARCH] Using cached results for query:', query)
  //     console.log(`[EXTERNAL_SEARCH] Cached results: ${cached.length} items (${cached.filter(g => g.store === 'apple_app_store').length} Apple, ${cached.filter(g => g.store === 'google_play_store').length} Google Play)`)
  //     return cached.slice(0, limit)
  //   }
  // } catch (error) {
  //   console.warn('[EXTERNAL_SEARCH] Cache read error:', error)
  // }
  
  console.log(`[EXTERNAL_SEARCH] Searching external stores for query: "${query}" (limit: ${limit})`)
  
  // Search both stores in parallel
  const [appleResults, googleResults] = await Promise.all([
    searchAppleAppStore(query, limit),
    searchGooglePlayStore(query, limit),
  ])
  
  console.log(`[EXTERNAL_SEARCH] Search completed: ${appleResults.length} Apple results, ${googleResults.length} Google Play results`)
  
  // Combine and dedupe by title + store
  const seen = new Set<string>()
  const combined: QuestGameResult[] = []
  
  for (const game of [...appleResults, ...googleResults]) {
    const key = `${game.title.toLowerCase()}-${game.store}`
    if (!seen.has(key)) {
      seen.add(key)
      combined.push(game)
    }
  }
  
  // Sort by score descending and limit
  const results = combined
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
  
  // Cache the results
  try {
    await cacheService.set(cacheKey, results, CACHE_TTL)
    console.log('[EXTERNAL_SEARCH] Cached results for query:', query)
  } catch (error) {
    console.warn('[EXTERNAL_SEARCH] Cache write error:', error)
  }
  
  return results
}

// Build search query from Quest preferences
export function buildSearchQueryFromPreferences(answers: Array<{ questionId: string; optionId: string }>): string {
  const queryParts: string[] = []
  
  // Extract genre preference
  const genreAnswer = answers.find(a => a.questionId === 'genre')
  if (genreAnswer) {
    const genreMap: Record<string, string> = {
      'action': 'action game',
      'rpg': 'RPG game',
      'strategy': 'strategy puzzle game',
      'casual': 'casual game',
      'sports': 'sports racing game',
      'card': 'card roguelike game',
    }
    const genreTerm = genreMap[genreAnswer.optionId] || genreAnswer.optionId
    queryParts.push(genreTerm)
  }
  
  // Extract monetization preference
  const monetizationAnswer = answers.find(a => a.questionId === 'monetization')
  if (monetizationAnswer?.optionId === 'free') {
    queryParts.push('free')
  }
  
  // Join with spaces
  return queryParts.join(' ').trim() || 'mobile game'
}

