"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'

export default function TestNotificationsPage() {
  const [loading, setLoading] = useState<string | null>(null)
  const [results, setResults] = useState<any>(null)

  const runTest = async (kind: 'xp' | 'level' | 'badge_unlock' | 'badge_claim') => {
    if (process.env.NODE_ENV !== 'development') {
      toast.error('Test page only available in development')
      return
    }

    setLoading(kind)
    setResults(null)

    try {
      const response = await fetch('/api/dev/test-notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kind })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Test failed')
      }

      setResults(data)
      toast.success(`Test ${kind} completed successfully!`)
    } catch (error) {
      console.error('Test error:', error)
      toast.error(`Test ${kind} failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(null)
    }
  }

  if (process.env.NODE_ENV !== 'development') {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-bold text-white mb-2">Not Available</h2>
            <p className="text-gray-400">This test page is only available in development mode.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-white">
              🧪 Notification Test Suite
            </CardTitle>
            <p className="text-gray-400">
              Test XP, Level, and Badge notifications in development mode
            </p>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-white">⚡ XP Test</CardTitle>
              <p className="text-gray-400 text-sm">
                Add 25 XP to trigger XP notification
              </p>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => runTest('xp')}
                disabled={loading === 'xp'}
                className="w-full"
                variant="outline"
              >
                {loading === 'xp' ? 'Testing...' : 'Test XP Notification'}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-white">🏆 Level Test</CardTitle>
              <p className="text-gray-400 text-sm">
                Add XP to cross level boundary
              </p>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => runTest('level')}
                disabled={loading === 'level'}
                className="w-full"
                variant="outline"
              >
                {loading === 'level' ? 'Testing...' : 'Test Level Up Notification'}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-white">🎖️ Badge Unlock Test</CardTitle>
              <p className="text-gray-400 text-sm">
                Unlock Wise Owl badge (50 comments)
              </p>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => runTest('badge_unlock')}
                disabled={loading === 'badge_unlock'}
                className="w-full"
                variant="outline"
              >
                {loading === 'badge_unlock' ? 'Testing...' : 'Test Badge Unlock'}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-white">🎉 Badge Claim Test</CardTitle>
              <p className="text-gray-400 text-sm">
                Claim an unlocked badge
              </p>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => runTest('badge_claim')}
                disabled={loading === 'badge_claim'}
                className="w-full"
                variant="outline"
              >
                {loading === 'badge_claim' ? 'Testing...' : 'Test Badge Claim'}
              </Button>
            </CardContent>
          </Card>
        </div>

        {results && (
          <Card>
            <CardHeader>
              <CardTitle className="text-white">📊 Test Results</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-gray-800 p-4 rounded-lg text-sm text-gray-300 overflow-auto">
                {JSON.stringify(results, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}

        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-white">📋 Manual Test Flow</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-gray-300">
              <h3 className="font-semibold text-white mb-2">1. XP Notifications:</h3>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Submit a comment → Should trigger XP notification</li>
                <li>Vote on a game → Should trigger XP notification</li>
                <li>Like a post → Should trigger XP notification</li>
              </ul>
            </div>

            <div className="text-gray-300">
              <h3 className="font-semibold text-white mb-2">2. Level Up Notifications:</h3>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Accumulate enough XP to cross level boundary</li>
                <li>Should trigger level_up notification</li>
              </ul>
            </div>

            <div className="text-gray-300">
              <h3 className="font-semibold text-white mb-2">3. Badge Notifications:</h3>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Complete badge threshold (e.g., 50 comments) → badge_unlocked</li>
                <li>Claim badge → badge_claimed + XP increase</li>
              </ul>
            </div>

            <div className="text-gray-300">
              <h3 className="font-semibold text-white mb-2">4. Check Notification Bell:</h3>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Look for unread count badge</li>
                <li>Click bell to see notifications</li>
                <li>Verify correct icons and messages</li>
                <li>Test "Mark all as read" functionality</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
