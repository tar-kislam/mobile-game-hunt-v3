/**
 * SearchAPI Configuration
 * External game store integration settings
 */

export const SEARCHAPI_CONFIG = {
  baseUrl: process.env.SEARCHAPI_BASE_URL || 'https://www.searchapi.io/api/v1/search',
  apiKey: process.env.SEARCHAPI_API_KEY || '3Hqc818mfsZd2uYcegyUKpns', // Default API key provided by user
}

// Engine names for different stores
export const SEARCH_ENGINES = {
  apple: 'apple_app_store',
  googlePlay: 'google_play_store',
} as const

// Build SearchAPI URL with query parameters
export function buildSearchApiUrl(params: {
  engine: string
  device?: string
  store?: string
  term: string
}): string {
  const { baseUrl } = SEARCHAPI_CONFIG
  const url = new URL(baseUrl)
  
  url.searchParams.set('engine', params.engine)
  
  // For Google Play Store, try 'q' parameter instead of 'term'
  if (params.engine === SEARCH_ENGINES.googlePlay) {
    url.searchParams.set('q', params.term)
  } else {
    url.searchParams.set('term', params.term)
  }
  
  if (params.device) {
    url.searchParams.set('device', params.device)
  }
  
  if (params.store) {
    url.searchParams.set('store', params.store)
  }
  
  return url.toString()
}

// Check if SearchAPI is configured
export function isSearchApiConfigured(): boolean {
  return !!SEARCHAPI_CONFIG.apiKey && SEARCHAPI_CONFIG.apiKey.length > 0
}

