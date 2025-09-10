'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CommunityFeed } from './community-feed'
import { Skeleton } from '@/components/ui/skeleton'

type SortFilter = 'latest' | 'trending'

export function CommunityFeedContainer() {
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [sort, setSort] = useState<SortFilter>('latest')
  const [hashtag, setHashtag] = useState<string | undefined>(undefined)

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


