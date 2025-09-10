'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { CommunityFeed } from './community-feed'
import { Skeleton } from '@/components/ui/skeleton'

type SortFilter = 'latest' | 'trending'

export function CommunityFeedContainer() {
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [sort, setSort] = useState<SortFilter>('latest')
  const [hashtag, setHashtag] = useState<string | undefined>(undefined)
  const searchParams = useSearchParams()
  const router = useRouter()

  const fetchPosts = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('filter', sort)
      if (hashtag) params.set('hashtag', hashtag)
      const res = await fetch(`/api/community/posts?${params.toString()}`, { cache: 'no-store' })
      const data = await res.json()
      const list = Array.isArray(data) ? data : (data.posts || [])
      setPosts(list)
    } catch (e) {
      console.error('Failed to load posts', e)
      setPosts([])
    } finally {
      setLoading(false)
    }
  }, [sort, hashtag])

  useEffect(() => {
    fetchPosts()
  }, [fetchPosts])

  // Sync hashtag with URL (?hashtag=...)
  useEffect(() => {
    const tag = searchParams?.get('tag') || searchParams?.get('hashtag') || undefined
    setHashtag(tag || undefined)
  }, [searchParams])

  // Listen for create events and prepend optimistically
  useEffect(() => {
    const handler = (e: any) => {
      const created = e?.detail
      if (created?.id) {
        setPosts(prev => [created, ...prev])
      }
    }
    if (typeof window !== 'undefined') {
      window.addEventListener('community:post-created', handler as EventListener)
      return () => window.removeEventListener('community:post-created', handler as EventListener)
    }
  }, [])

  const handleTagClick = (tag: string) => {
    setHashtag(tag)
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
      fetchPosts()
    } catch (e) {
      console.error('Failed to toggle like', e)
    }
  }

  return (
    <div className="space-y-4">
      <Tabs value={sort} onValueChange={(v) => setSort(v as SortFilter)}>
        <TabsList className="bg-background/40 border border-white/10">
          <TabsTrigger value="latest">Latest</TabsTrigger>
          <TabsTrigger value="trending">Trending</TabsTrigger>
        </TabsList>
      </Tabs>

      {hashtag && (
        <div className="flex items-center justify-between">
          <Badge variant="secondary" className="bg-blue-500/20 text-blue-300 border-blue-500/30">Showing posts for #{hashtag}</Badge>
          <button
            className="text-sm text-muted-foreground hover:text-foreground underline"
            onClick={() => handleTagClick('')}
          >
            Clear
          </button>
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-40 w-full rounded-xl" />
          <Skeleton className="h-40 w-full rounded-xl" />
        </div>
      ) : (
        <CommunityFeed posts={posts} onTagClick={handleTagClick} onToggleLike={handleToggleLike} />
      )}
    </div>
  )
}


