'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { Eye, TrendingUp, BarChart3, PieChart } from 'lucide-react';
import { DonutWithText, BarCompare, LineOverTime } from '@/components/dashboard/charts';
import useSWR from 'swr';
import Head from 'next/head';
import Link from 'next/link';
import { Pen, Trash2 } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

// Fetcher function for SWR
const fetcher = (url: string) => fetch(url, { credentials: 'include' }).then((res) => {
  if (!res.ok) throw new Error('Failed to fetch data');
  return res.json();
});


type DashboardGame = { id: string; title: string; status?: string; thumbnail?: string | null; slug?: string | null };

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
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

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
        totalViews: analyticsData.overviewTotals?.totalViews ?? 0,
        totalVotes: analyticsData.overviewTotals?.totalVotes ?? 0,
        totalFollows: analyticsData.overviewTotals?.totalFollows ?? 0,
        totalClicks: analyticsData.overviewTotals?.totalClicks ?? 0,
        engagementRate: analyticsData.overviewTotals?.engagementRate ?? 0
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
        geoStats: analyticsData.geoStats || [],
        languagePreferences: analyticsData.languagePreferences || [],
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
    <>
      <Head>
        <title>Dashboard | Mobile Game Hunt</title>
        <meta name="description" content="Manage your mobile games, track analytics, and monitor performance on Mobile Game Hunt dashboard." />
        <meta name="robots" content="noindex,nofollow" />
        <link rel="canonical" href={`${process.env.NEXT_PUBLIC_BASE_URL || 'https://mobilegamehunt.com'}/dashboard`} />
      </Head>
      <div className="min-h-screen bg-gradient-to-br from-black via-[#121225] to-[#050509] bg-[radial-gradient(80%_80%_at_0%_0%,rgba(124,58,237,0.22),transparent_60%),radial-gradient(80%_80%_at_100%_100%,rgba(6,182,212,0.18),transparent_60%)]">
        <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent font-orbitron animate-pulse hover:animate-bounce transition-all duration-300">
              Your Game Dashboard
            </h1>
            <p className="text-gray-300">
              Welcome back,{' '}
              <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent font-bold animate-pulse hover:animate-bounce transition-all duration-300">
                {session?.user?.name || 'User'}
              </span>
              ! Let's see how your games are performing and celebrate your wins!
            </p>
          </div>
          <div className="flex items-center">
            <img 
              src="/logo/dashboard-logo.webp" 
              alt="Dashboard Logo" 
              className="h-16 w-auto object-contain"
            />
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
                      <div key={g.id} className="text-left">
                        <div className={`rounded-lg border transition-all duration-300 ${
                          isSelected
                            ? 'border-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.4)]'
                            : 'border-purple-500/20 hover:border-purple-400/60 hover:shadow-[0_0_12px_rgba(168,85,247,0.25)]'
                        }`}>
                          <div className="p-4 flex items-center gap-3 cursor-pointer" onClick={() => setSelectedGameId(g.id)}>
                            <div className="w-16 h-16 rounded-md overflow-hidden bg-gray-700 flex items-center justify-center transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/25 hover:ring-2 hover:ring-purple-400/50">
                              {g.thumbnail ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={g.thumbnail} alt={g.title} className="w-full h-full object-cover" />
                              ) : (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src="/logo/mgh.png" alt="Game placeholder" className="w-8 h-8 object-contain" onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/logo/moblogo.png' }} />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-white font-medium truncate">{g.title}</p>
                              {g.status ? (
                                <Badge variant="outline" className="mt-1 border-purple-400/40 text-purple-200">{g.status}</Badge>
                              ) : null}
                            </div>
                          </div>
                          <div className="px-4 pb-4 flex items-center gap-2">
                            <Link href={`/submit/edit/${g.slug || g.id}`}>
                              <Button variant="outline" className="rounded-2xl h-8 px-3">
                                <Pen className="w-4 h-4 mr-2" /> Edit
                              </Button>
                            </Link>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="destructive" className="rounded-2xl h-8 px-3">
                                  <Trash2 className="w-4 h-4 mr-2" /> Delete
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete this game?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This action cannot be undone. The game and its related data will be permanently removed.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={async ()=>{
                                    try{
                                      setPendingDeleteId(g.id)
                                      const res = await fetch(`/api/products/${g.id}`, { method: 'DELETE' })
                                      if(!res.ok) throw new Error('Failed')
                                      setGames(prev=> prev.filter(x=> x.id!==g.id))
                                      if(selectedGameId===g.id){
                                        const remaining = games.filter(x=>x.id!==g.id)
                                        setSelectedGameId(remaining[0]?.id || '')
                                      }
                                      toast.success('🗑️ Game successfully removed')
                                    }catch(err){
                                      console.error(err)
                                      toast.error('Failed to remove the game')
                                    }finally{
                                      setPendingDeleteId(null)
                                    }
                                  }}>Delete</AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      </div>
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

            {/* Audience Insights - Temporarily Hidden */}
            {/* <div className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-6">Audience Insights</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-gray-800/50 border-purple-500/20">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2"><BarChart3 className="w-5 h-5 text-blue-400" />Top Countries</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {analyticsLoading ? (
                      <div className="space-y-3">
                        {[...Array(5)].map((_, i) => (
                          <Skeleton key={i} className="h-6 w-full bg-gray-700" />
                        ))}
                      </div>
                    ) : (analytics?.charts.geoStats && (analytics.charts.geoStats as Array<{ country: string; count: number }>).length > 0) ? (
                      <div className="space-y-3">
                        {(analytics.charts.geoStats as Array<{ country: string; count: number }>).slice(0,5).map((row, idx) => (
                          <div key={idx} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <span className="text-sm text-gray-300">{idx + 1}.</span>
                              <span className="text-sm text-white">{row.country}</span>
                            </div>
                            <span className="text-sm text-purple-300">{row.count}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center text-gray-400 py-8 animate-pulse">
                        <p className="text-sm">No country data yet</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <DonutWithText
                  title="Language Preferences"
                  data={(analytics?.charts.languagePreferences || []).slice(0,5).map((l: any) => ({ name: l.name || l.type, value: l.value }))}
                  totalLabel="Users"
                  isLoading={analyticsLoading}
                  error={analyticsError ? 'Failed to load data' : undefined}
                  trendingText="Top languages by audience"
                  className="bg-gray-800/50 border-purple-500/20"
                />
              </div>
            </div> */}
          </div>
        )}

        {/* Developer Games Table - Temporarily Hidden */}
        {/* <div className="mb-8">
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
                                <img src={g.thumbnail} alt={g.title} className="w-full h-full object-cover" />
                              ) : (
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
        </div> */}
      </div>
    </div>
    </>
  );
}
