'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

interface BlogListItem {
  id: string
  title: string
  slug: string
  excerpt: string
  thumbnail?: string | null
  tags: string[]
  createdAt: string
}

export default function BlogListPage() {
  const [q, setQ] = useState('')
  const [items, setItems] = useState<BlogListItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const controller = new AbortController()
    const fetchData = async () => {
      try {
        setLoading(true)
        const res = await fetch(`/api/blog${q ? `?q=${encodeURIComponent(q)}` : ''}`, { signal: controller.signal })
        const json = await res.json()
        setItems(json?.data || [])
      } catch {
        setItems([])
      } finally {
        setLoading(false)
      }
    }
    const t = setTimeout(fetchData, 250)
    return () => { controller.abort(); clearTimeout(t) }
  }, [q])

  return (
    <div className="min-h-screen w-full relative">
      <div className="absolute inset-0 bg-gradient-to-br from-black via-[#121225] to-[#050509]" />
      <div className="relative max-w-6xl mx-auto px-4 py-16">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">Blog</h1>
          <p className="text-gray-300">Insights, guides and updates for indie mobile game creators.</p>
        </div>
        <div className="mb-6">
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search posts by title or tag..."
            className="w-full bg-white/10 border-white/20 text-white placeholder-gray-400"
          />
        </div>
        {loading ? (
          <div className="text-gray-300">Loading…</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map(post => (
              <Link key={post.id} href={`/blog/${post.slug}`} className="group">
                <Card className="bg-white/10 backdrop-blur-lg border border-white/20 shadow-[0_0_25px_rgba(139,92,246,0.25)] hover:shadow-[0_0_35px_rgba(59,130,246,0.35)] transition-all">
                  <CardContent className="p-0">
                    {post.thumbnail ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={post.thumbnail} alt={post.title} className="w-full h-40 object-cover rounded-t-xl" />
                    ) : (
                      <div className="w-full h-40 bg-gradient-to-r from-purple-700/30 to-blue-700/30 rounded-t-xl" />
                    )}
                    <div className="p-4">
                      <div className="text-sm text-gray-400 mb-1">{new Date(post.createdAt).toLocaleDateString()}</div>
                      <h2 className="text-white font-semibold text-lg line-clamp-2 group-hover:text-purple-300 transition-colors">{post.title}</h2>
                      <p className="text-gray-300 text-sm mt-2 line-clamp-3">{post.excerpt}</p>
                      {post.tags?.length ? (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {post.tags.slice(0,3).map(tag => (
                            <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-purple-600/20 border border-purple-500/30 text-purple-200">#{tag}</span>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
            {items.length === 0 && (
              <div className="col-span-full text-gray-400">No posts found.</div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
