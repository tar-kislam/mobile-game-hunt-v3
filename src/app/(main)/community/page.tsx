"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Trophy } from 'lucide-react'

type BadgeType = 'EARLY_HUNTER' | 'TOP_VOTER' | 'EXPLORER' | 'BUILDER'

interface UserBadges {
  userId: string
  badges: BadgeType[]
}

export default function CommunityPage() {
  const [users, setUsers] = useState<UserBadges[]>([])
  const [leaders, setLeaders] = useState<{ userId: string; votes: number }[]>([])

  useEffect(() => {
    const load = async () => {
      const [b, l] = await Promise.all([
        fetch('/api/badges').then(r => r.ok ? r.json() : { users: [] }),
        fetch('/api/leaderboard?window=all&take=100').then(r => r.ok ? r.json() : { products: [] })
      ])
      setUsers(b.users || [])
      // Build a simple top hunters list by summing product votes by user
      const map: Record<string, number> = {}
      for (const p of (l.products || [])) {
        const uid = p.user?.id
        if (!uid) continue
        map[uid] = (map[uid] || 0) + (p.votes || 0)
      }
      const arr = Object.entries(map).map(([userId, votes]) => ({ userId, votes }))
        .sort((a, b) => b.votes - a.votes)
        .slice(0, 20)
      setLeaders(arr)
    }
    load()
  }, [])

  const colorFor = (badge: BadgeType) => {
    switch (badge) {
      case 'EARLY_HUNTER': return 'bg-green-600 text-white'
      case 'TOP_VOTER': return 'bg-blue-600 text-white'
      case 'EXPLORER': return 'bg-orange-500 text-white'
      case 'BUILDER': return 'bg-purple-600 text-white'
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 space-y-6">
        <div className="text-center">
          <h1 className="text-3xl md:text-4xl font-bold">Community</h1>
          <p className="text-muted-foreground mt-2">Top Hunters and badges</p>
        </div>

        <Card className="rounded-2xl shadow-lg border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Trophy className="w-5 h-5" /> Top Hunters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {leaders.length === 0 && (
                <div className="text-muted-foreground">No data</div>
              )}
              {leaders.map((l, idx) => (
                <div key={l.userId} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-muted text-muted-foreground flex items-center justify-center text-xs font-semibold">{idx + 1}</div>
                    <div className="font-medium text-sm">{l.userId}</div>
                  </div>
                  <div className="text-sm text-muted-foreground">{l.votes} votes</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-lg border-white/10">
          <CardHeader>
            <CardTitle>Badges</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {users.length === 0 && (
                <div className="text-muted-foreground">No badges yet</div>
              )}
              {users.map(u => (
                <div key={u.userId} className="p-3 rounded-xl border">
                  <div className="font-medium text-sm mb-2">{u.userId}</div>
                  <div className="flex flex-wrap gap-2">
                    {u.badges.map(b => (
                      <Badge key={b} className={`${colorFor(b)} text-xs`}>{b.replace('_', ' ')}</Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


