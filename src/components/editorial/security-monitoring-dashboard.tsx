'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Shield, AlertTriangle, RefreshCw, Filter } from 'lucide-react'
import { toast } from 'sonner'

interface SecurityEvent {
  type: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  message: string
  details?: Record<string, any>
  ip?: string
  userId?: string
  userAgent?: string
  path?: string
  timestamp: string
}

interface SecurityEventsResponse {
  events: SecurityEvent[]
  total: number
}

const severityColors = {
  critical: 'bg-red-500/20 text-red-400 border-red-500/30',
  high: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  low: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
}

const severityIcons = {
  critical: '🔴',
  high: '🟠',
  medium: '🟡',
  low: '🔵',
}

export function SecurityMonitoringDashboard() {
  const [events, setEvents] = useState<SecurityEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'critical' | 'high' | 'medium' | 'low'>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')

  const fetchEvents = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (filter !== 'all') {
        params.append('severity', filter)
      }
      if (typeFilter !== 'all') {
        params.append('type', typeFilter)
      }
      params.append('limit', '100')

      const response = await fetch(`/api/admin/security-events?${params.toString()}`)
      if (!response.ok) {
        throw new Error('Failed to fetch security events')
      }

      const data: SecurityEventsResponse = await response.json()
      setEvents(data.events || [])
    } catch (error) {
      console.error('Error fetching security events:', error)
      toast.error('Failed to load security events')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEvents()
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchEvents, 30000)
    return () => clearInterval(interval)
  }, [filter, typeFilter])

  // Get unique event types for filter
  const eventTypes = Array.from(new Set(events.map(e => e.type)))

  // Statistics
  const stats = {
    total: events.length,
    critical: events.filter(e => e.severity === 'critical').length,
    high: events.filter(e => e.severity === 'high').length,
    medium: events.filter(e => e.severity === 'medium').length,
    low: events.filter(e => e.severity === 'low').length,
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Shield className="w-6 h-6" />
            Security Monitoring
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            Monitor security events and potential threats in real-time
          </p>
        </div>
        <Button
          onClick={fetchEvents}
          disabled={loading}
          variant="outline"
          className="border-cyan-500/40 text-cyan-200 hover:bg-cyan-500/10"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="bg-zinc-800/40 border border-white/10">
          <CardContent className="p-4">
            <div className="text-sm text-gray-400 mb-1">Total Events</div>
            <div className="text-2xl font-bold text-white">{stats.total}</div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-800/40 border border-red-500/30">
          <CardContent className="p-4">
            <div className="text-sm text-gray-400 mb-1">Critical</div>
            <div className="text-2xl font-bold text-red-400">{stats.critical}</div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-800/40 border border-orange-500/30">
          <CardContent className="p-4">
            <div className="text-sm text-gray-400 mb-1">High</div>
            <div className="text-2xl font-bold text-orange-400">{stats.high}</div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-800/40 border border-yellow-500/30">
          <CardContent className="p-4">
            <div className="text-sm text-gray-400 mb-1">Medium</div>
            <div className="text-2xl font-bold text-yellow-400">{stats.medium}</div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-800/40 border border-blue-500/30">
          <CardContent className="p-4">
            <div className="text-sm text-gray-400 mb-1">Low</div>
            <div className="text-2xl font-bold text-blue-400">{stats.low}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-zinc-800/40 border border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2 text-lg">
            <Filter className="w-5 h-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">Severity:</span>
              <div className="flex gap-2">
                {(['all', 'critical', 'high', 'medium', 'low'] as const).map((sev) => (
                  <Button
                    key={sev}
                    variant={filter === sev ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilter(sev)}
                    className={
                      filter === sev
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600'
                        : 'border-white/20 text-gray-300 hover:bg-white/10'
                    }
                  >
                    {sev === 'all' ? 'All' : sev.charAt(0).toUpperCase() + sev.slice(1)}
                  </Button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">Type:</span>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="bg-zinc-900 border border-white/20 text-white rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              >
                <option value="all">All Types</option>
                {eventTypes.map((type) => (
                  <option key={type} value={type}>
                    {type.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Events Table */}
      <Card className="bg-zinc-800/40 border border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Recent Security Events
            <span className="text-xs text-gray-400">({events.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12 text-gray-400">Loading security events...</div>
          ) : events.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Shield className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No security events found</p>
              <p className="text-sm mt-2">Events will appear here when detected</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-700">
                    <TableHead className="text-gray-300">Severity</TableHead>
                    <TableHead className="text-gray-300">Type</TableHead>
                    <TableHead className="text-gray-300">Message</TableHead>
                    <TableHead className="text-gray-300">IP Address</TableHead>
                    <TableHead className="text-gray-300">Path</TableHead>
                    <TableHead className="text-gray-300">Timestamp</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {events.map((event, index) => (
                    <TableRow key={index} className="border-gray-700 hover:bg-zinc-700/30">
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={severityColors[event.severity]}
                        >
                          {severityIcons[event.severity]} {event.severity.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-white font-mono text-sm">
                        {event.type.replace(/_/g, ' ')}
                      </TableCell>
                      <TableCell className="text-gray-300 max-w-md">
                        <div className="truncate" title={event.message}>
                          {event.message}
                        </div>
                        {event.details && Object.keys(event.details).length > 0 && (
                          <details className="mt-1">
                            <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-400">
                              View details
                            </summary>
                            <pre className="mt-2 text-xs bg-zinc-900/50 p-2 rounded border border-white/10 overflow-x-auto">
                              {JSON.stringify(event.details, null, 2)}
                            </pre>
                          </details>
                        )}
                      </TableCell>
                      <TableCell className="text-gray-300 font-mono text-sm">
                        {event.ip || '—'}
                      </TableCell>
                      <TableCell className="text-gray-300 font-mono text-sm">
                        {event.path || '—'}
                      </TableCell>
                      <TableCell className="text-gray-400 text-sm">
                        {formatTimestamp(event.timestamp)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

