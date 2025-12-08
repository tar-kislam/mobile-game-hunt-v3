import { NextResponse } from 'next/server'
import { isSearchApiConfigured, SEARCHAPI_CONFIG } from '@/lib/externalStores/config'
import { searchExternalGames } from '@/lib/externalStores/search'

/**
 * Test endpoint for external game search
 * GET /api/quest/test-external?query=action+game
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('query') || 'action game free'
    
    // Check configuration
    const configStatus = {
      isConfigured: isSearchApiConfigured(),
      hasApiKey: !!SEARCHAPI_CONFIG.apiKey,
      apiKeyLength: SEARCHAPI_CONFIG.apiKey?.length || 0,
      baseUrl: SEARCHAPI_CONFIG.baseUrl,
      // Don't expose full API key, just first/last chars
      apiKeyPreview: SEARCHAPI_CONFIG.apiKey 
        ? `${SEARCHAPI_CONFIG.apiKey.substring(0, 4)}...${SEARCHAPI_CONFIG.apiKey.substring(SEARCHAPI_CONFIG.apiKey.length - 4)}`
        : 'not set'
    }
    
    if (!isSearchApiConfigured()) {
      return NextResponse.json({
        ok: false,
        error: 'SearchAPI not configured',
        config: configStatus,
        message: 'Please set SEARCHAPI_API_KEY environment variable'
      }, { status: 500 })
    }
    
    // Test search
    const results = await searchExternalGames({
      query,
      limit: 3
    })
    
    return NextResponse.json({
      ok: true,
      config: configStatus,
      query,
      resultsCount: results.length,
      results: results.map(r => ({
        title: r.title,
        store: r.store,
        hasThumbnail: !!r.thumbnailUrl,
        hasLink: !!r.links.externalStoreUrl,
        thumbnailUrl: r.thumbnailUrl ? 'present' : 'missing',
        link: r.links.externalStoreUrl
      }))
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const errorStack = error instanceof Error ? error.stack : undefined
    
    return NextResponse.json({
      ok: false,
      error: errorMessage,
      stack: process.env.NODE_ENV === 'development' ? errorStack : undefined
    }, { status: 500 })
  }
}

