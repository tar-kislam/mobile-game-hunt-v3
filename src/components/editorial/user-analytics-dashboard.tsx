"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { subDays, format, startOfDay, endOfDay } from "date-fns"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { RefreshCw, Clock3 } from "lucide-react"
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  YAxis
} from "recharts"
import { cn } from "@/lib/utils"

type AnalyticsResponse = {
  summary: {
    totalVisits: number
    uniqueUsers: number
    avgDurationSeconds: number
    mostVisitedGame: {
      productId: string
      slug: string
      title: string
      visits: number
    } | null
  }
  visitsOverTime: Array<{ date: string; visits: number }>
  topPages: Array<{ path: string; pageType: string | null; visits: number; avgDurationSeconds: number }>
  pagination: {
    page: number
    pageSize: number
    totalUsers: number
  }
  users: Array<{
    userId: string
    email: string
    name: string | null
    totalVisits: number
    avgDurationSeconds: number
    lastSeenAt: string | null
    topPages: Array<{ path: string; visits: number }>
    submittedGames: Array<{ id: string; title: string; slug: string }>
  }>
}

const PAGE_TYPE_FILTERS = [
  { label: "All pages", value: "all" },
  { label: "Product", value: "product" },
  { label: "Submit", value: "submit" },
  { label: "Community", value: "community" },
  { label: "Dashboard", value: "dashboard" },
  { label: "Editorial", value: "editorial" },
  { label: "Other", value: "other" }
]

const RANGE_OPTIONS = [
  { label: "Last 7 days", value: "7" },
  { label: "Last 14 days", value: "14" },
  { label: "Last 30 days", value: "30" }
]

const formatDuration = (seconds: number) => {
  if (!seconds || Number.isNaN(seconds)) return "0s"
  if (seconds < 60) return `${Math.round(seconds)}s`
  const minutes = Math.floor(seconds / 60)
  const remainder = Math.round(seconds % 60)
  return `${minutes}m ${remainder}s`
}

export function UserAnalyticsDashboard() {
  const [range, setRange] = useState("30")
  const [pageType, setPageType] = useState("all")
  const [search, setSearch] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<AnalyticsResponse | null>(null)
  const [page, setPage] = useState(1)

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const today = endOfDay(new Date())
      const days = Number(range)
      const from = format(startOfDay(subDays(today, days - 1)), "yyyy-MM-dd")
      const to = format(today, "yyyy-MM-dd")
      const params = new URLSearchParams({
        from,
        to,
        page: page.toString(),
        pageSize: "25"
      })
      if (pageType !== "all") {
        params.set("pageType", pageType)
      }

      const res = await fetch(`/api/editorial/user-analytics?${params.toString()}`)
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}))
        throw new Error(payload?.error || "Failed to load analytics data")
      }
      const payload = (await res.json()) as AnalyticsResponse
      setData(payload)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load analytics data")
    } finally {
      setIsLoading(false)
    }
  }, [range, pageType, page])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const filteredUsers = useMemo(() => {
    if (!data) return []
    if (!search.trim()) return data.users
    const query = search.trim().toLowerCase()
    return data.users.filter((user) => {
      const nameMatch = user.name?.toLowerCase().includes(query)
      const emailMatch = user.email.toLowerCase().includes(query)
      return nameMatch || emailMatch
    })
  }, [data, search])

  const summary = data?.summary
  const totalPages = data ? Math.max(1, Math.ceil(data.pagination.totalUsers / data.pagination.pageSize)) : 1

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">User Analytics</h1>
          <p className="text-gray-300">Activity for users who have submitted games on MobileGameHunt.</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Select value={range} onValueChange={(val) => { setRange(val); setPage(1) }}>
            <SelectTrigger className="w-full sm:w-[160px] bg-black/40 border-white/10 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-white/10 text-white">
              {RANGE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={pageType} onValueChange={(val) => { setPageType(val); setPage(1) }}>
            <SelectTrigger className="w-full sm:w-[160px] bg-black/40 border-white/10 text-white">
              <SelectValue placeholder="Page type" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-white/10 text-white">
              {PAGE_TYPE_FILTERS.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            onClick={fetchData}
            disabled={isLoading}
            className="border-white/30 text-white hover:bg-white/10"
          >
            <RefreshCw className={cn("w-4 h-4 mr-2", isLoading && "animate-spin")} />
            Refresh
          </Button>
        </div>
      </div>

      {error && (
        <Card className="bg-red-500/10 border-red-500/30 text-red-200">
          <CardContent className="py-4 text-sm">
            {error}
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-4">
        <SummaryCard
          label="Total visits (dev users)"
          value={summary?.totalVisits ?? 0}
        />
        <SummaryCard
          label="Active dev users"
          value={summary?.uniqueUsers ?? 0}
        />
        <SummaryCard
          label="Average time per visit"
          value={summary ? formatDuration(summary.avgDurationSeconds) : "0s"}
        />
        <MostVisitedGameCard game={summary?.mostVisitedGame ?? null} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card className="bg-black/40 border-white/5">
          <CardHeader>
            <CardTitle>Visits over time</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            {data?.visitsOverTime?.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.visitsOverTime}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="date" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" allowDecimals={false} />
                  <RechartsTooltip contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)' }} />
                  <Line type="monotone" dataKey="visits" stroke="#06b6d4" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState />
            )}
          </CardContent>
        </Card>

        <Card className="bg-black/40 border-white/5">
          <CardHeader>
            <CardTitle>Top pages</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            {data?.topPages?.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.topPages}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="path" stroke="#94a3b8" tickFormatter={(value) => truncate(value, 18)} />
                  <YAxis stroke="#94a3b8" allowDecimals={false} />
                  <RechartsTooltip contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)' }} />
                  <Bar dataKey="visits" fill="#6366f1" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState />
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="bg-black/40 border-white/5">
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>Developer activity</CardTitle>
          <Input
            placeholder="Search by name or email..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="max-w-sm bg-black/40 border-white/10 text-white"
          />
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <div className="min-w-[900px]">
            <Table>
              <TableHeader>
                <TableRow className="border-white/10">
                  <TableHead className="text-gray-300">User</TableHead>
                  <TableHead className="text-gray-300">Submitted games</TableHead>
                  <TableHead className="text-gray-300">Total visits</TableHead>
                  <TableHead className="text-gray-300">Avg duration</TableHead>
                  <TableHead className="text-gray-300">Last seen</TableHead>
                  <TableHead className="text-gray-300">Top pages</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {!isLoading && filteredUsers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="py-10 text-center text-gray-400">
                      No developers found for the selected filters.
                    </TableCell>
                  </TableRow>
                )}
                {isLoading
                  ? Array.from({ length: 5 }).map((_, index) => (
                      <TableRow key={`skeleton-${index}`}>
                        <TableCell colSpan={6} className="py-6">
                          <div className="h-4 w-full animate-pulse rounded bg-white/5" />
                        </TableCell>
                      </TableRow>
                    ))
                  : filteredUsers.map((user) => (
                      <TableRow key={user.userId} className="border-white/5">
                        <TableCell>
                          <div className="space-y-1">
                            <div className="text-white font-medium">{user.name || "Unknown user"}</div>
                            <div className="text-xs text-gray-400">{user.email}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1.5">
                            {user.submittedGames.length
                              ? user.submittedGames.map((game) => (
                                  <Badge key={game.id} variant="secondary" className="bg-white/10 text-white text-xs">
                                    {truncate(game.title, 20)}
                                  </Badge>
                                ))
                              : <span className="text-gray-400 text-sm">—</span>}
                          </div>
                        </TableCell>
                        <TableCell className="text-white">{user.totalVisits}</TableCell>
                        <TableCell className="text-white">{formatDuration(user.avgDurationSeconds)}</TableCell>
                        <TableCell className="text-gray-300 text-sm">
                          {user.lastSeenAt ? format(new Date(user.lastSeenAt), "MMM d, yyyy HH:mm") : "—"}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-2">
                            {user.topPages.length
                              ? user.topPages.map((page) => (
                                  <Badge key={page.path} variant="secondary" className="bg-white/10 text-white">
                                    {truncate(page.path, 28)} • {page.visits}
                                  </Badge>
                                ))
                              : <span className="text-gray-400 text-sm">No data</span>}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
              </TableBody>
            </Table>
          </div>

          {data?.pagination && (
            <div className="flex items-center justify-between mt-4 text-sm text-gray-400">
              <div>
                Page {page} of {totalPages}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1 || isLoading}
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages || isLoading}
                  onClick={() => setPage((prev) => prev + 1)}
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

const SummaryCard = ({ label, value }: { label: string; value: number | string }) => (
  <Card className="bg-gradient-to-br from-[#0b1220] to-[#05070d] border-white/5">
    <CardContent className="p-4 space-y-1">
      <p className="text-sm text-gray-400">{label}</p>
      <p className="text-3xl font-semibold text-white">{value}</p>
    </CardContent>
  </Card>
)

const MostVisitedGameCard = ({ game }: { game: { productId: string; slug: string; title: string; visits: number } | null }) => (
  <Card className="bg-gradient-to-br from-[#0b1220] to-[#05070d] border-white/5">
    <CardContent className="p-4 space-y-1">
      <p className="text-sm text-gray-400">Most visited game</p>
      <p className="text-3xl font-semibold text-white">{game?.title || "—"}</p>
      {game ? (
        <p className="text-xs text-gray-500 mt-1">{game.visits} {game.visits === 1 ? 'visit' : 'visits'}</p>
      ) : (
        <p className="text-xs text-gray-500 mt-1">No product visits in this period</p>
      )}
    </CardContent>
  </Card>
)

const EmptyState = () => (
  <div className="h-full flex items-center justify-center text-gray-400 text-sm">
    No data for this period.
  </div>
)

const truncate = (input: string, max = 24) => {
  if (!input) return ""
  return input.length > max ? `${input.slice(0, max)}…` : input
}

