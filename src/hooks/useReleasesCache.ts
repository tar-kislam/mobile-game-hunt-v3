'use client'

import { useState, useEffect, useCallback } from 'react'

interface GameRelease {
  id: string
  title: string
  tagline?: string
  description: string
  thumbnail?: string
  platforms: string[]
  countries: string[]
  releaseAt: string
  url?: string
  slug: string
  categories: Array<{
    id: string
    name: string
  }>
  developer: {
    name?: string
    username?: string
  }
  stats: {
    votes: number
    comments: number
    followers: number
  }
}

interface ReleasesResponse {
  date: string
  releases: GameRelease[]
  count: number
}

// Cache for storing release data
const releasesCache = new Map<string, ReleasesResponse>()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

interface CacheEntry {
  data: ReleasesResponse
  timestamp: number
}

export function useReleasesCache() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchReleases = useCallback(async (date: string): Promise<ReleasesResponse | null> => {
    // Check cache first
    const cacheKey = date
    const cached = releasesCache.get(cacheKey) as CacheEntry | undefined
    
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data
    }

    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`/api/releases?date=${date}`)
      if (!response.ok) {
        throw new Error('Failed to fetch releases')
      }
      
      const data: ReleasesResponse = await response.json()
      
      // Cache the result
      releasesCache.set(cacheKey, {
        data,
        timestamp: Date.now()
      })
      
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const preloadMonthReleases = useCallback(async (year: number, month: number) => {
    const startDate = new Date(year, month, 1)
    const endDate = new Date(year, month + 1, 0)
    
    const promises: Promise<void>[] = []
    
    // Preload releases for the first 7 days of the month
    for (let day = 1; day <= Math.min(7, endDate.getDate()); day++) {
      const date = new Date(year, month, day)
      const dateString = date.toISOString().split('T')[0]
      
      // Only fetch if not already cached
      if (!releasesCache.has(dateString)) {
        promises.push(
          fetchReleases(dateString).then(() => {
            // Add a small delay to avoid overwhelming the server
            return new Promise(resolve => setTimeout(resolve, 100))
          })
        )
      }
    }
    
    // Execute preloading in background
    Promise.all(promises).catch(console.error)
  }, [fetchReleases])

  const clearCache = useCallback(() => {
    releasesCache.clear()
  }, [])

  const getCacheStats = useCallback(() => {
    return {
      size: releasesCache.size,
      keys: Array.from(releasesCache.keys())
    }
  }, [])

  return {
    fetchReleases,
    preloadMonthReleases,
    clearCache,
    getCacheStats,
    loading,
    error
  }
}
