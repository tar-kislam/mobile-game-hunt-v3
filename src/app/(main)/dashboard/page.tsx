'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { Eye, TrendingUp, BarChart3, PieChart } from 'lucide-react';
import { DonutWithText, BarCompare, LineOverTime } from '@/components/dashboard/charts';
import useSWR from 'swr';

// Fetcher function for SWR
const fetcher = (url: string) => fetch(url, { credentials: 'include' }).then((res) => {
  if (!res.ok) throw new Error('Failed to fetch data');
  return res.json();
});


type DashboardGame = { id: string; title: string; status?: string; thumbnail?: string | null };

type GameAnalytics = {
  game: { id: string; title: string };
  overview: { totalViews: number; totalVotes: number; totalFollows: number; totalClicks: number; engagementRate: number };
  charts: {
    votesOverTime: Array<{ date: string; votes: number }>;
    followersGrowth: Array<{ date: string; followers: number }>;
    clicksByType: Array<{ name: string; value: number; color?: string }>;
    internalVsExternal: Array<{ name: string; value: number; color?: string }>;
    votesVsFollows: Array<{ name: string; votes: number; follows: number }>;
    clicksOverTime: Array<{ date: string; internal: number; external: number }>;
    geoStats: Array<{ country: string; count: number }>;
    languagePreferences: Array<{ type: string; value: number; color?: string }>;
    trafficTimeline: Array<{ hour: string; traffic: number }>;
  };
};

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [games, setGames] = useState<DashboardGame[]>([]);
  const [selectedGameId, setSelectedGameId] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // SWR hook for analytics data with real-time updates
  const { data: analyticsData, error: analyticsError, isLoading: analyticsLoading } = useSWR(
    selectedGameId ? `/api/dashboard/analytics?gameId=${selectedGameId}` : null,
    fetcher,
    {
      refreshInterval: 15000, // Refresh every 15 seconds
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      onError: (error) => {
        console.error('Analytics fetch error:', error);
        toast.error('Failed to load analytics');
      }
    }
  );

  useEffect(() => {
    if (status === 'authenticated') {
      void loadGames();
    }
  }, [status]);


  const loadGames = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/dashboard/games', { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch games');
      const data = await res.json();
      const list: DashboardGame[] = Array.isArray(data?.games) ? data.games : [];
      setGames(list);
      if (list.length) setSelectedGameId(list[0].id);
    } catch (e) {
      toast.error('Failed to load your games');
    } finally {
      setLoading(false);
    }
  };

  // Transform analytics data
  const analytics = useMemo(() => {
    if (!analyticsData || !selectedGameId) return null;
    
    return {
      game: { id: selectedGameId, title: games.find(g => g.id === selectedGameId)?.title || 'Unknown Game' },
      overview: {
        totalViews: 0, // Not provided by current API
        totalVotes: analyticsData.votesVsFollows?.reduce((sum: number, item: any) => sum + item.votes, 0) || 0,
        totalFollows: analyticsData.votesVsFollows?.reduce((sum: number, item: any) => sum + item.follows, 0) || 0,
        totalClicks: analyticsData.clicksByPlatform?.reduce((sum: number, item: any) => sum + item.value, 0) || 0,
        engagementRate: 0 // Calculate if needed
      },
      charts: {
        votesOverTime: [], // Not provided by current API
        followersGrowth: [], // Not provided by current API
        clicksByType: (analyticsData.clicksByPlatform || []).map((item: { name: string; value: number; color?: string }) => ({
          name: item.name,
          value: item.value,
          color: item.color
        })),
        internalVsExternal: [
          ...(analyticsData.internalClicks || []).map((item: { name: string; value: number; color?: string }) => ({
            name: item.name,
            value: item.value,
            color: item.color
          })),
          ...(analyticsData.externalClicks || []).map((item: { name: string; value: number; color?: string }) => ({
            name: item.name,
            value: item.value,
            color: item.color
          }))
        ],
        geoStats: [], // Not provided by current API
        languagePreferences: [], // Not provided by current API
        trafficTimeline: [], // Not provided by current API
        votesVsFollows: analyticsData.votesVsFollows || [],
        clicksOverTime: analyticsData.clicksOverTime || []
      }
    };
  }, [analyticsData, selectedGameId, games]);

  const overview = analytics?.overview;
  const showAnalytics = !!(analytics && selectedGameId);

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-[#121225] to-[#050509] bg-[radial-gradient(80%_80%_at_0%_0%,rgba(124,58,237,0.22),transparent_60%),radial-gradient(80%_80%_at_100%_100%,rgba(6,182,212,0.18),transparent_60%)]">
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-10 w-48 mb-6 bg-gray-700" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-24 w-full bg-gray-700" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    router.push('/auth/signin');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-[#121225] to-[#050509] bg-[radial-gradient(80%_80%_at_0%_0%,rgba(124,58,237,0.22),transparent_60%),radial-gradient(80%_80%_at_100%_100%,rgba(6,182,212,0.18),transparent_60%)]">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent font-orbitron">
              Your Game Dashboard
            </h1>
            <p className="text-gray-300">Track your game's performance and analyze user engagement.</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-gray-300">{session?.user?.name}</span>
            <Avatar className="h-10 w-10 border-2 border-purple-400">
              <AvatarImage src={session?.user?.image || ''} />
              <AvatarFallback className="bg-purple-600 text-white">{session?.user?.name?.charAt(0) || 'U'}</AvatarFallback>
            </Avatar>
          </div>
        </div>

        {/* Game Selector */}
        <Card className="bg-gray-800/50 border-purple-500/20 mb-8">
          <CardContent className="p-6">
            {games.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center py-8">
                <p className="text-white text-lg mb-2">You haven’t submitted a game yet.</p>
                <p className="text-gray-400 mb-4">Submit your first game to start tracking analytics.</p>
                <Button onClick={() => router.push('/submit/new')} className="bg-purple-600 hover:bg-purple-500">Submit Game</Button>
              </div>
            ) : (
              <div>
                <h2 className="text-xl font-semibold text-white mb-4">Your Games</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {games.map((g) => {
                    const isSelected = g.id === selectedGameId;
                    return (
                      <button key={g.id} onClick={() => setSelectedGameId(g.id)} className="text-left">
                        <div className={`rounded-lg border transition-all duration-300 ${
                          isSelected
                            ? 'border-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.4)]'
                            : 'border-purple-500/20 hover:border-purple-400/60 hover:shadow-[0_0_12px_rgba(168,85,247,0.25)]'
                        }`}>
                          <div className="p-4 flex items-center gap-3">
                            <div className="w-16 h-16 rounded-md overflow-hidden bg-gray-700 flex items-center justify-center transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/25 hover:ring-2 hover:ring-purple-400/50">
                              {g.thumbnail ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={g.thumbnail} alt={g.title} className="w-full h-full object-cover" />
                              ) : (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src="/logo/mgh.png" alt="Game placeholder" className="w-8 h-8 object-contain" onError={(e) => {
                                  e.currentTarget.src = '/logo/moblogo.png';
                                }} />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-white font-medium truncate">{g.title}</p>
                              {g.status ? (
                                <Badge variant="outline" className="mt-1 border-purple-400/40 text-purple-200">{g.status}</Badge>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Overview */}
        {showAnalytics && (
          <div>
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-6">{analytics!.game.title} - Performance Overview</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <Card className="bg-gray-800/50 border-purple-500/20 hover:border-purple-400/60 hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300 group">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm">Total Views</p>
                        <p className="text-2xl font-bold text-white group-hover:text-purple-300 transition-colors">{overview!.totalViews}</p>
                      </div>
                      <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center group-hover:bg-blue-500/30 transition-colors">
                        <Eye className="w-4 h-4 text-blue-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-gray-800/50 border-purple-500/20 hover:border-purple-400/60 hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300 group">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm">Total Votes</p>
                        <p className="text-2xl font-bold text-white group-hover:text-purple-300 transition-colors">{overview!.totalVotes}</p>
                      </div>
                      <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center group-hover:bg-green-500/30 transition-colors">
                        <TrendingUp className="w-4 h-4 text-green-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-gray-800/50 border-purple-500/20 hover:border-purple-400/60 hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300 group">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm">Total Followers</p>
                        <p className="text-2xl font-bold text-white group-hover:text-purple-300 transition-colors">{overview!.totalFollows}</p>
                      </div>
                      <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center group-hover:bg-purple-500/30 transition-colors">
                        <PieChart className="w-4 h-4 text-purple-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-gray-800/50 border-purple-500/20 hover:border-purple-400/60 hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300 group">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm">Total Clicks</p>
                        <p className="text-2xl font-bold text-white group-hover:text-purple-300 transition-colors">{overview!.totalClicks}</p>
                      </div>
                      <div className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center group-hover:bg-orange-500/30 transition-colors">
                        <BarChart3 className="w-4 h-4 text-orange-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-gray-800/50 border-purple-500/20 hover:border-purple-400/60 hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300 group">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm">Engagement Rate</p>
                        <p className="text-2xl font-bold text-white group-hover:text-purple-300 transition-colors">{overview!.engagementRate.toFixed(1)}%</p>
                      </div>
                      <div className="w-8 h-8 bg-cyan-500/20 rounded-lg flex items-center justify-center group-hover:bg-cyan-500/30 transition-colors">
                        <TrendingUp className="w-4 h-4 text-cyan-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Interactions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Clicks Over Time */}
              <LineOverTime
                title="Clicks Over Time"
                data={analytics?.charts.clicksOverTime || []}
                isLoading={analyticsLoading}
                error={analyticsError ? 'Failed to load data' : undefined}
              />

              {/* Votes vs Follows */}
              <BarCompare
                title="Votes vs Follows"
                data={analytics?.charts.votesVsFollows || []}
                isLoading={analyticsLoading}
                error={analyticsError ? 'Failed to load data' : undefined}
              />
            </div>

            {/* Clicks Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Clicks by Type */}
              <DonutWithText
                title="Clicks by Type"
                data={analytics?.charts.clicksByType || []}
                totalLabel="Clicks"
                isLoading={analyticsLoading}
                error={analyticsError ? 'Failed to load data' : undefined}
                trendingText="Trending up by 12% this week"
                trendingColor="green"
              />

              {/* Internal vs External */}
              <DonutWithText
                title="Internal vs External"
                data={analytics?.charts.internalVsExternal || []}
                totalLabel="Interactions"
                isLoading={analyticsLoading}
                error={analyticsError ? 'Failed to load data' : undefined}
                trendingText="Balanced engagement this week"
                trendingColor="blue"
              />
            </div>

            {/* Audience Insights */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-6">Audience Insights</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-gray-800/50 border-purple-500/20">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2"><BarChart3 className="w-5 h-5 text-blue-400" />Top Countries</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center text-gray-400 py-8">
                      <p className="text-sm">Geographic data not available</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800/50 border-purple-500/20">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2"><PieChart className="w-5 h-5 text-yellow-400" />Language Preferences</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center text-gray-400 py-8">
                      <p className="text-sm">Language data not available</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}

        {/* Developer Games Table (simple) */}
        <div className="mb-8">
          <Card className="bg-gray-800/50 border-purple-500/20">
            <CardHeader>
              <CardTitle className="text-white">Your Games</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-700">
                    <TableHead className="text-gray-300">Game</TableHead>
                    <TableHead className="text-gray-300">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {games.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={2} className="text-center text-gray-400 py-8">No games</TableCell>
                    </TableRow>
                  ) : (
                    games.map((g) => (
                      <TableRow key={g.id} className="border-gray-700">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-md overflow-hidden bg-gray-700 flex items-center justify-center transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/25 hover:ring-2 hover:ring-purple-400/50">
                              {g.thumbnail ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={g.thumbnail} alt={g.title} className="w-full h-full object-cover" />
                              ) : (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src="/logo/mgh.png" alt="Game placeholder" className="w-6 h-6 object-contain" onError={(e) => {
                                  e.currentTarget.src = '/logo/moblogo.png';
                                }} />
                              )}
                            </div>
                            <span className="text-white">{g.title}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-300">{g.status || '—'}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
