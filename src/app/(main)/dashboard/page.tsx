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
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ReTooltip,
  PieChart as RePieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

type DashboardGame = { id: string; title: string; status?: string; thumbnail?: string | null };

type GameAnalytics = {
  game: { id: string; title: string };
  overview: { totalViews: number; totalVotes: number; totalFollows: number; totalClicks: number; engagementRate: number };
  charts: {
    votesOverTime: Array<{ date: string; votes: number }>;
    followersGrowth: Array<{ date: string; followers: number }>;
    clicksByType: Array<{ type: string; value: number; color?: string }>;
    internalVsExternal: Array<{ type: string; value: number; color?: string }>;
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
  const [analytics, setAnalytics] = useState<GameAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  useEffect(() => {
    if (status === 'authenticated') {
      void loadGames();
    }
  }, [status]);

  useEffect(() => {
    if (selectedGameId) {
      void loadAnalytics(selectedGameId);
    }
  }, [selectedGameId]);

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

  const loadAnalytics = async (gameId: string) => {
    try {
      setAnalyticsLoading(true);
      const res = await fetch(`/api/analytics/${gameId}`, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch analytics');
      const data: GameAnalytics = await res.json();
      setAnalytics(data);
    } catch (e) {
      toast.error('Failed to load analytics');
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const overview = analytics?.overview;
  const showAnalytics = !!(analytics && selectedGameId);

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
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
                            <div className="w-12 h-12 rounded-md overflow-hidden bg-gray-700 flex items-center justify-center">
                              {g.thumbnail ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={g.thumbnail} alt={g.title} className="w-full h-full object-cover" />
                              ) : (
                                <PieChart className="w-6 h-6 text-purple-300" />
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
              {/* Votes Over Time */}
              <Card className="bg-gray-800/50 border-purple-500/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2"><TrendingUp className="w-5 h-5 text-red-400" />Votes Over Time</CardTitle>
                </CardHeader>
                <CardContent>
                  {analyticsLoading ? (
                    <Skeleton className="h-64 w-full bg-gray-600" />
                  ) : (
                    <ChartContainer config={{ votes: { label: 'Votes' } }} className="h-[300px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={analytics!.charts.votesOverTime}>
                          <defs>
                            <linearGradient id="colorVotes" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                              <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1} />
                            </linearGradient>
                          </defs>
                          <XAxis dataKey="date" stroke="#6b7280" fontSize={12} />
                          <YAxis stroke="#6b7280" fontSize={12} />
                          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                          <ReTooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #6b7280', borderRadius: 8, color: '#f9fafb' }} />
                          <Area type="monotone" dataKey="votes" stroke="#ef4444" fill="url(#colorVotes)" strokeWidth={2} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  )}
                </CardContent>
              </Card>

              {/* Followers Growth */}
              <Card className="bg-gray-800/50 border-purple-500/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2"><BarChart3 className="w-5 h-5 text-green-400" />Followers Growth</CardTitle>
                </CardHeader>
                <CardContent>
                  {analyticsLoading ? (
                    <Skeleton className="h-64 w-full bg-gray-600" />
                  ) : (
                    <ChartContainer config={{ followers: { label: 'Followers' } }} className="h-[300px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={analytics!.charts.followersGrowth}>
                          <defs>
                            <linearGradient id="colorFollowers" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                              <stop offset="95%" stopColor="#10b981" stopOpacity={0.1} />
                            </linearGradient>
                          </defs>
                          <XAxis dataKey="date" stroke="#6b7280" fontSize={12} />
                          <YAxis stroke="#6b7280" fontSize={12} />
                          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                          <ReTooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #6b7280', borderRadius: 8, color: '#f9fafb' }} />
                          <Area type="monotone" dataKey="followers" stroke="#10b981" fill="url(#colorFollowers)" strokeWidth={2} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Clicks Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <Card className="bg-gray-800/50 border-purple-500/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2"><PieChart className="w-5 h-5 text-purple-400" />Clicks by Type</CardTitle>
              </CardHeader>
              <CardContent>
                  {analyticsLoading ? (
                    <Skeleton className="h-64 w-full bg-gray-600" />
                  ) : (
                    <div className="mx-auto aspect-square max-h-[250px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <RePieChart>
                          <Pie data={analytics!.charts.clicksByType} dataKey="value" nameKey="type" innerRadius={60} outerRadius={100} paddingAngle={5}>
                            {analytics!.charts.clicksByType.map((d, i) => (
                              <Cell key={i} fill={d.color || ['#8b5cf6', '#10b981', '#ef4444', '#06b6d4', '#f59e0b'][i % 5]} />
                            ))}
                          </Pie>
                          <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                        </RePieChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-gray-800/50 border-purple-500/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2"><PieChart className="w-5 h-5 text-cyan-400" />Internal vs External</CardTitle>
                </CardHeader>
                <CardContent>
                  {analyticsLoading ? (
                    <Skeleton className="h-64 w-full bg-gray-600" />
                  ) : (
                    <div className="mx-auto aspect-square max-h-[250px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <RePieChart>
                          <Pie data={analytics!.charts.internalVsExternal} dataKey="value" nameKey="type" innerRadius={60} outerRadius={100} paddingAngle={5}>
                            {analytics!.charts.internalVsExternal.map((d, i) => (
                              <Cell key={i} fill={d.color || ['#06b6d4', '#f59e0b'][i % 2]} />
                            ))}
                          </Pie>
                          <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                        </RePieChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </CardContent>
              </Card>
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
                    {analyticsLoading ? (
                      <Skeleton className="h-64 w-full bg-gray-600" />
                    ) : (
                      <ChartContainer config={{ views: { label: 'Views' } }} className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={analytics!.charts.geoStats.slice(0, 8)}>
                            <XAxis dataKey="country" stroke="#6b7280" fontSize={12} angle={-45} textAnchor="end" height={80} />
                            <YAxis stroke="#6b7280" fontSize={12} />
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <ReTooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #6b7280', borderRadius: 8, color: '#f9fafb' }} />
                            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                              {analytics!.charts.geoStats.slice(0, 8).map((entry, index, arr) => {
                                const top = Math.max(...arr.map((x) => x.count));
                                const isTop = entry.count === top;
                                return <Cell key={index} fill={isTop ? '#60a5fa' : '#3b82f6'} />;
                              })}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </ChartContainer>
                    )}
                  </CardContent>
                </Card>

                <Card className="bg-gray-800/50 border-purple-500/20">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2"><PieChart className="w-5 h-5 text-yellow-400" />Language Preferences</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {analyticsLoading ? (
                      <Skeleton className="h-64 w-full bg-gray-600" />
                    ) : (
                      <ChartContainer config={{ languages: { label: 'Languages' } }} className="mx-auto aspect-square max-h-[250px]">
                        <RePieChart>
                          <Pie data={analytics!.charts.languagePreferences} dataKey="value" nameKey="type" innerRadius={60} outerRadius={100} paddingAngle={5}>
                            {analytics!.charts.languagePreferences.map((d, i) => (
                              <Cell key={i} fill={d.color || ['#f59e0b', '#10b981', '#8b5cf6', '#06b6d4'][i % 4]} />
                            ))}
                          </Pie>
                        </RePieChart>
                      </ChartContainer>
                    )}
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
                    <TableHead className="text-gray-300">Title</TableHead>
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
                        <TableCell className="text-white">{g.title}</TableCell>
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
