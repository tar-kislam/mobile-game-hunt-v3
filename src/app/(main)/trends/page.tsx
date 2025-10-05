"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Share2 } from 'lucide-react'

interface TrendItem {
  id: string
  title: string
  url?: string
  tags?: string[]
  createdAt: number
}

export default function TrendsPage() {
  const [items, setItems] = useState<TrendItem[]>([])
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [tags, setTags] = useState('')

  const load = async () => {
    const res = await fetch('/api/trends')
    if (!res.ok) return
    const data = await res.json()
    setItems(data.items || [])
  }

  useEffect(() => { load() }, [])

  const submit = async () => {
    const res = await fetch('/api/trends', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, url, tags: tags.split(',').map(t => t.trim()).filter(Boolean) })
    })
    if (res.ok) {
      setTitle(''); setUrl(''); setTags('');
      load()
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 space-y-6">
        <div className="text-center">
          <h1 className="text-3xl md:text-4xl font-bold">Trends</h1>
          <p className="text-muted-foreground mt-2">Share and discover trending topics</p>
        </div>

        <Card className="rounded-2xl shadow-lg border-white/10">
          <CardHeader>
            <CardTitle>Add a Trend</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Title" className="w-full px-3 py-2 rounded-md border bg-background" />
            <input value={url} onChange={e => setUrl(e.target.value)} placeholder="URL (optional)" className="w-full px-3 py-2 rounded-md border bg-background" />
            <input value={tags} onChange={e => setTags(e.target.value)} placeholder="Tags (comma separated)" className="w-full px-3 py-2 rounded-md border bg-background" />
            <Button onClick={submit} className="rounded-2xl">Post</Button>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map(item => (
            <Card key={item.id} className="rounded-2xl shadow-lg border-white/10">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg truncate">{item.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {item.url && (
                  <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline truncate">
                    {item.url}
                  </a>
                )}
                <div className="flex flex-wrap gap-2">
                  {item.tags?.map(tag => (
                    <Badge key={tag} variant="outline" className="text-xs">#{tag}</Badge>
                  ))}
                </div>
                <div className="flex justify-end">
                  <Button variant="ghost" size="sm" className="h-auto px-2 py-1">
                    <Share2 className="w-4 h-4 mr-1" /> Share
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}


