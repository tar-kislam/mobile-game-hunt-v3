"use client"

import useSWR from 'swr'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { getNotificationIcon } from '@/lib/notificationService'
import { formatDistanceToNow } from 'date-fns'
import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
// DotGrid removed per request; using gradient background instead

interface Notification {
  id: string
  message: string
  type: string
  read: boolean
  createdAt: string
}

interface NotificationData {
  notifications: Notification[]
  nextCursor?: string | null
}

const fetcher = (url: string) => fetch(url).then(r => r.json())

export default function NotificationsPage() {
  const [cursor, setCursor] = useState<string | null>(null)
  const { data, isLoading, error, mutate } = useSWR<NotificationData>(
    `/api/notifications?limit=20${cursor ? `&cursor=${cursor}` : ''}`,
    fetcher,
    { revalidateOnFocus: true }
  )

  const notifications = data?.notifications ?? []

  const handleMarkAllAsRead = async () => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'markAllAsRead' })
      })
      if (!response.ok) throw new Error('Failed to mark as read')
      mutate()
    } catch (e) {
      // silent fail
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-[#121225] to-[#050509] bg-[radial-gradient(80%_80%_at_0%_0%,rgba(124,58,237,0.22),transparent_60%),radial-gradient(80%_80%_at_100%_100%,rgba(6,182,212,0.18),transparent_60%)]">

      <div className="container mx-auto px-4 py-8">
      {/* Back to Home above the card, left-aligned */}
      <div className="mb-3">
        <Link href="/">
          <Button variant="outline" size="sm" className="rounded-xl h-8 px-3">
            Back to Home
          </Button>
        </Link>
      </div>

      <div className="max-w-5xl mx-auto">
      <Card className="border-white/10 bg-gray-900/60 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <CardTitle className="text-xl">Notifications</CardTitle>
            </div>
            <div>
              <Button variant="ghost" size="sm" onClick={handleMarkAllAsRead} className="text-xs px-3 py-1">
                Mark all as read
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading && (
            <div className="p-6 text-sm text-muted-foreground">Loading...</div>
          )}
          {error && (
            <div className="p-6 text-sm text-red-400">Failed to load notifications.</div>
          )}
          {!isLoading && !error && notifications.length === 0 && (
            <div className="p-10 text-center text-muted-foreground">No notifications yet.</div>
          )}
          {notifications.length > 0 && (
            <div className="divide-y divide-gray-800">
              {notifications.map((n, idx) => (
                <div key={n.id} className={`p-4 ${!n.read ? 'bg-purple-500/5' : ''}`}>
                  <div className="flex items-start gap-3">
                    <div className="text-xl flex-shrink-0 mt-0.5">
                      {getNotificationIcon(n.type as any)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${!n.read ? 'text-white' : 'text-gray-300'}`}>{n.message}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                    {!n.read && <div className="w-2 h-2 bg-purple-500 rounded-full flex-shrink-0 mt-2" />}
                  </div>
                </div>
              ))}
            </div>
          )}

          {data?.nextCursor && (
            <div className="p-4">
              <button
                className="w-full text-sm rounded-xl border border-white/10 px-3 py-2 hover:bg-white/5"
                onClick={() => setCursor(data.nextCursor as string)}
              >
                Load more
              </button>
            </div>
          )}
        </CardContent>
      </Card>
      </div>
      </div>
    </div>
  )}


