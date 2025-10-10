import useSWR from 'swr'

interface HashtagStats {
  tag: string
  score: number
  likes: number
  mentions: number
}

interface TrendingPost {
  id: string
  content: string
  authorId: string
  author: {
    name: string | null
    username: string | null
    image: string | null
  }
  likeCount: number
  createdAt: string
  hashtags: string[]
  score: number
}

interface TrendingData {
  hashtags: HashtagStats[]
  posts: TrendingPost[]
  lastUpdated: string
}

interface TrendingResponse {
  hashtags?: HashtagStats[]
  posts?: TrendingPost[]
  lastUpdated?: string
  success: boolean
  error?: string
}

const fetcher = (url: string) => fetch(url).then(r => r.json())

export function useTrendingData() {
  const { data, error, mutate, isLoading } = useSWR<TrendingResponse>(
    '/api/community/trending?type=all',
    fetcher,
    {
      refreshInterval: 60 * 60 * 1000, // Refresh every hour
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      dedupingInterval: 5 * 60 * 1000, // Dedupe for 5 minutes
    }
  )

  const refreshTrending = async () => {
    try {
      await mutate()
    } catch (error) {
      console.error('Failed to refresh trending data:', error)
    }
  }

  const manualRefresh = async () => {
    try {
      const response = await fetch('/api/community/trending', {
        method: 'POST'
      })
      if (response.ok) {
        await mutate()
      }
    } catch (error) {
      console.error('Failed to manually refresh trending data:', error)
    }
  }

  return {
    data: data?.success ? {
      hashtags: data.hashtags || [],
      posts: data.posts || [],
      lastUpdated: data.lastUpdated || new Date().toISOString()
    } as TrendingData : undefined,
    error,
    isLoading,
    refreshTrending,
    manualRefresh,
    lastUpdated: data?.lastUpdated ? new Date(data.lastUpdated) : null
  }
}

export function useTrendingHashtags() {
  const { data, error, mutate, isLoading } = useSWR<{ hashtags: HashtagStats[]; success: boolean }>(
    '/api/community/trending?type=hashtags',
    fetcher,
    {
      refreshInterval: 60 * 60 * 1000,
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
    }
  )

  return {
    hashtags: data?.success ? data.hashtags || [] : [],
    error,
    isLoading,
    refresh: mutate
  }
}

export function useTrendingPosts() {
  const { data, error, mutate, isLoading } = useSWR<{ posts: TrendingPost[]; success: boolean }>(
    '/api/community/trending?type=posts',
    fetcher,
    {
      refreshInterval: 60 * 60 * 1000,
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
    }
  )

  return {
    posts: data?.success ? data.posts || [] : [],
    error,
    isLoading,
    refresh: mutate
  }
}
