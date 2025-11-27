'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { CommunityFeed } from './community-feed'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

type SortFilter = 'latest' | 'trending'

type FeedState = {
  items: any[]
  nextCursor: string | null
  loading: boolean
  loadingMore: boolean
  error?: string | null
}

const EMPTY_FEED: FeedState = {
  items: [],
  nextCursor: null,
  loading: false,
  loadingMore: false,
  error: null
}

const PAGE_SIZE = 10

export function CommunityFeedContainer() {
  const [sort, setSort] = useState<SortFilter>('latest')
  const [hashtag, setHashtag] = useState<string | undefined>()
  const [searchQuery, setSearchQuery] = useState('')
  const searchParams = useSearchParams()
  const router = useRouter()

  const [feeds, setFeeds] = useState<Record<SortFilter, FeedState>>({
    latest: { ...EMPTY_FEED, loading: true },
    trending: { ...EMPTY_FEED }
  })

  const activeFeed = feeds[sort]

  const syncTagFromUrl = useCallback(() => {
    const tag = searchParams?.get('tag') || searchParams?.get('hashtag') || undefined
    setHashtag(tag || undefined)
  }, [searchParams])

  useEffect(() => {
    syncTagFromUrl()
  }, [syncTagFromUrl])

  const fetchPage = useCallback(
    async (filter: SortFilter, cursor?: string | null, reset?: boolean) => {
      setFeeds((prev) => ({
        ...prev,
        [filter]: {
          ...(reset ? EMPTY_FEED : prev[filter]),
          loading: !cursor,
          loadingMore: Boolean(cursor),
          error: null
        }
      }))

      try {
        const params = new URLSearchParams()
        params.set('filter', filter)
        params.set('limit', String(PAGE_SIZE))
        if (hashtag) params.set('hashtag', hashtag)
        if (cursor) params.set('cursor', cursor)

        const res = await fetch(`/api/community/posts?${params.toString()}`, { cache: 'no-store' })
        if (!res.ok) {
          const err = await res.json().catch(() => null)
          throw new Error(err?.error || 'Failed to load posts')
        }
        const data = await res.json()
        const incoming = Array.isArray(data.items) ? data.items : []

        setFeeds((prev) => ({
          ...prev,
          [filter]: {
            items: cursor && !reset ? [...prev[filter].items, ...incoming] : incoming,
            nextCursor: data.nextCursor || null,
            loading: false,
            loadingMore: false,
            error: null
          }
        }))
      } catch (error) {
        setFeeds((prev) => ({
          ...prev,
          [filter]: {
            ...prev[filter],
            loading: false,
            loadingMore: false,
            error: error instanceof Error ? error.message : 'Failed to load posts'
          }
        }))
      }
    },
    [hashtag]
  )

  useEffect(() => {
    fetchPage(sort, undefined, true)
  }, [sort, hashtag, fetchPage])

  useEffect(() => {
    const handler = (e: any) => {
      const created = e?.detail
      if (!created?.id) return
      setFeeds((prev) => ({
        latest: { ...prev.latest, items: [created, ...prev.latest.items] },
        trending: { ...prev.trending, items: [created, ...prev.trending.items] }
      }))
    }
    if (typeof window !== 'undefined') {
      window.addEventListener('community:post-created', handler as EventListener)
      return () => window.removeEventListener('community:post-created', handler as EventListener)
    }
  }, [])

  useEffect(() => {
    const handler = (e: any) => {
      const keyword = e?.detail
      if (keyword) handleTagClick(keyword.replace('#', ''))
    }
    if (typeof window !== 'undefined') {
      window.addEventListener('community:search-keyword', handler as EventListener)
      return () => window.removeEventListener('community:search-keyword', handler as EventListener)
    }
  }, [])

  useEffect(() => {
    const searchHandler = (e: any) => {
      const query = e?.detail
      if (query) setSearchQuery(query)
      }
    const clearHandler = () => setSearchQuery('')
    if (typeof window !== 'undefined') {
      window.addEventListener('community:simple-search', searchHandler as EventListener)
      window.addEventListener('community:simple-search-clear', clearHandler as EventListener)
      return () => {
        window.removeEventListener('community:simple-search', searchHandler as EventListener)
        window.removeEventListener('community:simple-search-clear', clearHandler as EventListener)
      }
    }
  }, [])

  const handleTagClick = (tag: string) => {
    setHashtag(tag || undefined)
    const sp = new URLSearchParams(Array.from(searchParams?.entries?.() || []))
    if (tag) {
      sp.set('tag', tag)
      sp.delete('hashtag')
    } else {
      sp.delete('tag')
      sp.delete('hashtag')
    }
    router.push(`/community?${sp.toString()}`)
  }

  const handleToggleLike = async (postId: string) => {
    try {
      await fetch('/api/community/like', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId })
      })
      fetchPage(sort, undefined, true)
    } catch (error) {
      console.error('Failed to toggle like', error)
    }
  }

  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return activeFeed.items
    const query = searchQuery.toLowerCase().trim()
    return activeFeed.items.filter((post) => {
      if (post.content?.toLowerCase().includes(query)) return true
      if (post.user?.name?.toLowerCase().includes(query)) return true
      if (post.user?.username?.toLowerCase().includes(query)) return true
      if (post.hashtags && Array.isArray(post.hashtags)) {
        return post.hashtags.some((tag: string) => {
          const lc = tag.toLowerCase()
          return lc.includes(query) || lc.includes(`#${query}`)
        })
      }
      return false
    })
  }, [activeFeed.items, searchQuery])

  const handleLoadMore = () => {
    if (!activeFeed.nextCursor || activeFeed.loadingMore) return
    fetchPage(sort, activeFeed.nextCursor)
  }

  const showLoadMore = Boolean(activeFeed.nextCursor || activeFeed.loadingMore || activeFeed.error)

  return (
    <div className="space-y-4">
      <Tabs value={sort} onValueChange={(value) => setSort(value as SortFilter)}>
          <TabsList className="bg-background/40 border border-white/10">
            <TabsTrigger value="latest">Latest</TabsTrigger>
            <TabsTrigger value="trending">Trending</TabsTrigger>
          </TabsList>
        </Tabs>

        {hashtag && (
          <div className="flex items-center justify-between">
          <Badge variant="secondary" className="bg-blue-500/20 text-blue-300 border-blue-500/30">
            Showing posts for #{hashtag}
          </Badge>
          <button className="text-sm underline text-muted-foreground hover:text-foreground" onClick={() => handleTagClick('')}>
              Clear
            </button>
          </div>
        )}

      {activeFeed.loading && !activeFeed.items.length ? (
          <div className="space-y-4">
            <Skeleton className="h-40 w-full rounded-xl" />
            <Skeleton className="h-40 w-full rounded-xl" />
          </div>
      ) : filteredItems.length > 0 ? (
        <>
          <CommunityFeed posts={filteredItems} onTagClick={handleTagClick} onToggleLike={handleToggleLike} />
          {showLoadMore && (
            <div className="flex flex-col items-center space-y-2 mt-6">
              {activeFeed.error && <p className="text-sm text-red-400">{activeFeed.error}</p>}
              <Button
                onClick={handleLoadMore}
                disabled={!activeFeed.nextCursor || activeFeed.loadingMore}
                className="w-full sm:w-auto"
                variant="secondary"
              >
                {activeFeed.loadingMore ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : activeFeed.nextCursor ? (
                  'Show more posts'
                ) : (
                  'No more posts'
                )}
              </Button>
          </div>
        )}
      </>
      ) : searchQuery.trim() ? (
        <div className="text-center text-muted-foreground py-8">No results found.</div>
      ) : (
        <div className="text-center text-muted-foreground py-8">No posts yet.</div>
      )}
    </div>
  )
}
