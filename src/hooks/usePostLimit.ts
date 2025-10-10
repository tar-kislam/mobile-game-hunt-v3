import { useState, useEffect } from 'react'
import useSWR from 'swr'

interface PostLimitData {
  canPost: boolean
  limit: number
  used: number
  remaining: number
  resetTime: string
  resetTimeFormatted: string
}

interface PostLimitResponse {
  canPost: boolean
  limit: number
  used: number
  remaining: number
  resetTime: string
  resetTimeFormatted: string
  error?: string
}

const fetcher = (url: string) => fetch(url).then(r => r.json())

export function usePostLimit() {
  const { data, error, mutate, isLoading } = useSWR<PostLimitResponse>(
    '/api/community/posts/limit',
    fetcher,
    {
      refreshInterval: 60000, // Refresh every minute
      revalidateOnFocus: true,
      revalidateOnReconnect: true
    }
  )

  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)

  const refreshLimit = async () => {
    try {
      await mutate()
      setLastRefresh(new Date())
    } catch (error) {
      console.error('Failed to refresh post limit:', error)
    }
  }

  // Auto-refresh when limit is reached to check for reset
  useEffect(() => {
    if (data && !data.canPost) {
      const resetTime = new Date(data.resetTime)
      const now = new Date()
      const timeUntilReset = resetTime.getTime() - now.getTime()

      if (timeUntilReset > 0) {
        const timer = setTimeout(() => {
          refreshLimit()
        }, timeUntilReset + 1000) // Add 1 second buffer

        return () => clearTimeout(timer)
      }
    }
  }, [data])

  const getStatusMessage = () => {
    if (isLoading) return 'Checking post limit...'
    if (error) return 'Unable to check post limit'
    if (!data) return 'Loading...'

    if (data.canPost) {
      if (data.remaining === data.limit) {
        return `You can post ${data.limit} times today`
      } else {
        return `${data.remaining} posts remaining today`
      }
    } else {
      return `Daily limit reached. Resets at ${data.resetTimeFormatted}`
    }
  }

  const getProgressPercentage = () => {
    if (!data) return 0
    return Math.round((data.used / data.limit) * 100)
  }

  return {
    data: data as PostLimitData | undefined,
    error,
    isLoading,
    refreshLimit,
    lastRefresh,
    getStatusMessage,
    getProgressPercentage,
    canPost: data?.canPost ?? false,
    remaining: data?.remaining ?? 0,
    used: data?.used ?? 0,
    limit: data?.limit ?? 3
  }
}
