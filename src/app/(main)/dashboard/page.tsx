'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Eye, Edit, Trash2, PieChart, TrendingUp, BarChart3 } from 'lucide-react';
import { toast } from 'sonner';
import { 
  PieChart as RechartsPieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  Area,
  AreaChart
} from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Product {
  id: string;
  name: string;
  status: string;
  releaseDate?: string | null;
  createdAt: string;
  totalViews: number;
  totalVotes: number;
  totalFollows: number;
  totalClicks: number;
}

interface GameAnalytics {
  game: {
    id: string;
    title: string;
  };
  overview: {
    totalViews: number;
    totalVotes: number;
    totalFollows: number;
    totalClicks: number;
    engagementRate: number;
  };
  charts: {
    votesOverTime: Array<{ date: string; votes: number }>;
    followersGrowth: Array<{ date: string; followers: number }>;
    clicksByType: Array<{ name: string; value: number; color: string }>;
    internalVsExternal: Array<{ name: string; value: number; color: string }>;
    geoStats: Array<{ country: string; count: number }>;
    languagePreferences: Array<{ name: string; value: number; color: string }>;
    deviceSplit: Array<{ name: string; value: number; color: string }>;
    trafficTimeline: Array<{ hour: string; traffic: number }>;
  };
  insights: {
    topClickedLink: { type: string; count: number } | null;
    topCountry: { country: string; count: number } | null;
    peakTrafficHour: { hour: string; traffic: number };
  };
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedGameId, setSelectedGameId] = useState<string>('');
  const [gameAnalytics, setGameAnalytics] = useState<GameAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchUserProducts().catch(error => {
        console.error('Error loading dashboard data:', error);
        toast.error('Failed to load dashboard data');
      });
    }
  }, [status]);

  useEffect(() => {
    if (selectedGameId) {
      fetchGameAnalytics(selectedGameId);
    }
  }, [selectedGameId]);

  const fetchUserProducts = async () => {
    try {
      const response = await fetch('/api/developer/products', {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        if (data.ok) {
          setProducts(data.products);
        } else {
          console.error('Error fetching products:', data.error);
          toast.error('Failed to load your games');
        }
      } else {
        console.error('Error fetching products:', response.status);
        toast.error('Failed to load your games');
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load your games');
    } finally {
      setLoading(false);
    }
  };

  const fetchGameAnalytics = async (gameId: string) => {
    try {
      setAnalyticsLoading(true);
      const response = await fetch(`/api/analytics/${gameId}`, {
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        setGameAnalytics(data);
      } else {
        console.error('Error fetching game analytics:', response.status);
        toast.error('Failed to load game analytics');
      }
    } catch (error) {
      console.error('Error fetching game analytics:', error);
      toast.error('Failed to load game analytics');
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const handleEditGame = (productId: string) => {
    toast("Opening game editor", {
      description: "You'll be redirected to edit your game.",
    });
    router.push(`/submit/${productId}`);
  };

  const handleViewGame = (productId: string) => {
    toast("Opening game details", {
      description: "You'll be redirected to view your game.",
    });
    router.push(`/product/${productId}`);
  };

  const handleDeleteClick = (product: Product) => {
    setProductToDelete(product);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!productToDelete) return;

    try {
      const response = await fetch(`/api/products/${productToDelete.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        toast("Game deleted successfully", {
          description: "The game has been permanently removed from your dashboard.",
        });
        fetchUserProducts(); // Refresh the list
      } else {
        toast.error('Failed to delete game');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete game');
    } finally {
      setDeleteDialogOpen(false);
      setProductToDelete(null);
    }
  };

  const handleCreateGame = () => {
    toast("Redirecting to game creation", {
      description: "You'll be taken to the game submission form.",
    });
    router.push('/submit/new');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400"></div>
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
              Game Analytics Dashboard
            </h1>
            <p className="text-gray-300">
              Track your game's performance and analyze user engagement.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-gray-300">{session?.user?.name}</span>
            <Avatar className="h-10 w-10 border-2 border-purple-400">
              <AvatarImage src={session?.user?.image || ''} />
              <AvatarFallback className="bg-purple-600 text-white">
                {session?.user?.name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>

        {/* Game Selector */}
        <div className="mb-8">
          <Card className="bg-gray-800/50 border-purple-500/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-white mb-2">Select a Game</h2>
                  <p className="text-gray-400">Choose a game to view detailed analytics</p>
                </div>
                <div className="w-64">
                  <Select value={selectedGameId} onValueChange={setSelectedGameId}>
                    <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                      <SelectValue placeholder="Choose a game..." />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-600">
                      {products.map((product) => (
                        <SelectItem 
                          key={product.id} 
                          value={product.id}
                          className="text-white hover:bg-gray-700"
                        >
                          {product.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Analytics Overview - Only show when game is selected */}
        {selectedGameId && gameAnalytics && (
          <>
            {/* Overview Metrics */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-6">
                {gameAnalytics.game.title} - Performance Overview
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <Card className="bg-gray-800/50 border-purple-500/20 hover:border-purple-400/40 transition-colors">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm">Total Views</p>
                        <p className="text-2xl font-bold text-white">{gameAnalytics.overview.totalViews}</p>
                      </div>
                      <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                        <Eye className="w-4 h-4 text-blue-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800/50 border-purple-500/20 hover:border-purple-400/40 transition-colors">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm">Total Votes</p>
                        <p className="text-2xl font-bold text-white">{gameAnalytics.overview.totalVotes}</p>
                      </div>
                      <div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center">
                        <TrendingUp className="w-4 h-4 text-red-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800/50 border-purple-500/20 hover:border-purple-400/40 transition-colors">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm">Total Followers</p>
                        <p className="text-2xl font-bold text-white">{gameAnalytics.overview.totalFollows}</p>
                      </div>
                      <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                        <BarChart3 className="w-4 h-4 text-green-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800/50 border-purple-500/20 hover:border-purple-400/40 transition-colors">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm">Total Clicks</p>
                        <p className="text-2xl font-bold text-white">{gameAnalytics.overview.totalClicks}</p>
                      </div>
                      <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                        <PieChart className="w-4 h-4 text-purple-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800/50 border-purple-500/20 hover:border-purple-400/40 transition-colors">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm">Engagement Rate</p>
                        <p className="text-2xl font-bold text-white">{gameAnalytics.overview.engagementRate}%</p>
                      </div>
                      <div className="w-8 h-8 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                        <TrendingUp className="w-4 h-4 text-cyan-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Votes Over Time */}
              <Card className="bg-gray-800/50 border-purple-500/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-red-400" />
                    Votes Over Time
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {analyticsLoading ? (
                    <Skeleton className="h-64 w-full bg-gray-600" />
                  ) : (
                    <div className="h-[300px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={gameAnalytics.charts.votesOverTime}>
                          <defs>
                            <linearGradient id="colorVotes" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                              <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1}/>
                            </linearGradient>
                          </defs>
                          <XAxis 
                            dataKey="date" 
                            stroke="#6b7280"
                            fontSize={12}
                          />
                          <YAxis 
                            stroke="#6b7280"
                            fontSize={12}
                          />
                          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                          <Tooltip 
                            contentStyle={{
                              backgroundColor: '#1f2937',
                              border: '1px solid #6b7280',
                              borderRadius: '8px',
                              color: '#f9fafb'
                            }}
                          />
                          <Area 
                            type="monotone" 
                            dataKey="votes" 
                            stroke="#ef4444" 
                            fill="url(#colorVotes)"
                            strokeWidth={2}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Followers Growth */}
              <Card className="bg-gray-800/50 border-purple-500/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-green-400" />
                    Followers Growth
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {analyticsLoading ? (
                    <Skeleton className="h-64 w-full bg-gray-600" />
                  ) : (
                    <div className="h-[300px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={gameAnalytics.charts.followersGrowth}>
                          <defs>
                            <linearGradient id="colorFollowers" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                              <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                            </linearGradient>
                          </defs>
                          <XAxis 
                            dataKey="date" 
                            stroke="#6b7280"
                            fontSize={12}
                          />
                          <YAxis 
                            stroke="#6b7280"
                            fontSize={12}
                          />
                          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                          <Tooltip 
                            contentStyle={{
                              backgroundColor: '#1f2937',
                              border: '1px solid #6b7280',
                              borderRadius: '8px',
                              color: '#f9fafb'
                            }}
                          />
                          <Area 
                            type="monotone" 
                            dataKey="followers" 
                            stroke="#10b981" 
                            fill="url(#colorFollowers)"
                            strokeWidth={2}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Clicks by Type */}
              <Card className="bg-gray-800/50 border-purple-500/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <PieChart className="w-5 h-5 text-purple-400" />
                    Clicks by Platform
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {analyticsLoading ? (
                    <Skeleton className="h-64 w-full bg-gray-600" />
                  ) : (
                    <div className="mx-auto aspect-square max-h-[250px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsPieChart>
                          <Pie
                            data={gameAnalytics.charts.clicksByType}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {gameAnalytics.charts.clicksByType.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </RechartsPieChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Internal vs External Clicks */}
              <Card className="bg-gray-800/50 border-purple-500/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <PieChart className="w-5 h-5 text-cyan-400" />
                    Internal vs External Clicks
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {analyticsLoading ? (
                    <Skeleton className="h-64 w-full bg-gray-600" />
                  ) : (
                    <div className="mx-auto aspect-square max-h-[250px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsPieChart>
                          <Pie
                            data={gameAnalytics.charts.internalVsExternal}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {gameAnalytics.charts.internalVsExternal.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </RechartsPieChart>
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
                {/* Geo Stats */}
                <Card className="bg-gray-800/50 border-purple-500/20">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-blue-400" />
                      Top Countries
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {analyticsLoading ? (
                      <Skeleton className="h-64 w-full bg-gray-600" />
                    ) : (
                      <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={gameAnalytics.charts.geoStats.slice(0, 8)}>
                            <XAxis 
                              dataKey="country" 
                              stroke="#6b7280"
                              fontSize={12}
                              angle={-45}
                              textAnchor="end"
                              height={80}
                            />
                            <YAxis 
                              stroke="#6b7280"
                              fontSize={12}
                            />
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <Tooltip 
                              contentStyle={{
                                backgroundColor: '#1f2937',
                                border: '1px solid #6b7280',
                                borderRadius: '8px',
                                color: '#f9fafb'
                              }}
                            />
                            <Bar 
                              dataKey="count" 
                              fill="#3b82f6" 
                              radius={[4, 4, 0, 0]}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Language Preferences */}
                <Card className="bg-gray-800/50 border-purple-500/20">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <PieChart className="w-5 h-5 text-yellow-400" />
                      Language Preferences
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {analyticsLoading ? (
                      <Skeleton className="h-64 w-full bg-gray-600" />
                    ) : (
                      <div className="mx-auto aspect-square max-h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <RechartsPieChart>
                            <Pie
                              data={gameAnalytics.charts.languagePreferences}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={100}
                              paddingAngle={5}
                              dataKey="value"
                            >
                              {gameAnalytics.charts.languagePreferences.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                          </RechartsPieChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Device Split */}
                <Card className="bg-gray-800/50 border-purple-500/20">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <PieChart className="w-5 h-5 text-orange-400" />
                      Device Split
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {analyticsLoading ? (
                      <Skeleton className="h-64 w-full bg-gray-600" />
                    ) : (
                      <div className="mx-auto aspect-square max-h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <RechartsPieChart>
                            <Pie
                              data={gameAnalytics.charts.deviceSplit}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={100}
                              paddingAngle={5}
                              dataKey="value"
                            >
                              {gameAnalytics.charts.deviceSplit.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                          </RechartsPieChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Traffic Timeline */}
                <Card className="bg-gray-800/50 border-purple-500/20">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-purple-400" />
                      Peak Traffic Hours
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {analyticsLoading ? (
                      <Skeleton className="h-64 w-full bg-gray-600" />
                    ) : (
                      <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={gameAnalytics.charts.trafficTimeline}>
                            <XAxis 
                              dataKey="hour" 
                              stroke="#6b7280"
                              fontSize={12}
                            />
                            <YAxis 
                              stroke="#6b7280"
                              fontSize={12}
                            />
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <Tooltip 
                              contentStyle={{
                                backgroundColor: '#1f2937',
                                border: '1px solid #6b7280',
                                borderRadius: '8px',
                                color: '#f9fafb'
                              }}
                            />
                            <Bar 
                              dataKey="traffic" 
                              fill="#8b5cf6" 
                              radius={[4, 4, 0, 0]}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Key Insights */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-6">Key Insights</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {gameAnalytics.insights.topClickedLink && (
                  <Card className="bg-gray-800/50 border-purple-500/20">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                          <TrendingUp className="w-5 h-5 text-green-400" />
                        </div>
                        <div>
                          <p className="text-gray-400 text-sm">Top Clicked Link</p>
                          <p className="text-white font-semibold">{gameAnalytics.insights.topClickedLink.type}</p>
                          <p className="text-gray-300 text-sm">{gameAnalytics.insights.topClickedLink.count} clicks</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {gameAnalytics.insights.topCountry && (
                  <Card className="bg-gray-800/50 border-purple-500/20">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                          <BarChart3 className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                          <p className="text-gray-400 text-sm">Top Country</p>
                          <p className="text-white font-semibold">{gameAnalytics.insights.topCountry.country}</p>
                          <p className="text-gray-300 text-sm">{gameAnalytics.insights.topCountry.count} users</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <Card className="bg-gray-800/50 border-purple-500/20">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-purple-400" />
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Peak Traffic Hour</p>
                        <p className="text-white font-semibold">{gameAnalytics.insights.peakTrafficHour.hour}</p>
                        <p className="text-gray-300 text-sm">{gameAnalytics.insights.peakTrafficHour.traffic} sessions</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </>
        )}

        {/* Games Table */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Your Games</h2>
            <Button 
              onClick={handleCreateGame}
              className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white border-0"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Game
            </Button>
          </div>
          
          <Card className="bg-gray-800/50 border-purple-500/20">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-700">
                    <TableHead className="text-gray-300">Title</TableHead>
                    <TableHead className="text-gray-300">Status</TableHead>
                    <TableHead className="text-gray-300">Release Date</TableHead>
                    <TableHead className="text-gray-300">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-gray-400 py-8">
                        No games found. Create your first game to get started!
                      </TableCell>
                    </TableRow>
                  ) : (
                    products.map((product) => (
                      <TableRow key={product.id} className="border-gray-700 hover:bg-gray-700/50">
                        <TableCell className="text-white">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gray-600 flex items-center justify-center">
                              <span className="text-white font-bold text-sm">
                                {product.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <div className="font-medium">{product.name}</div>
                              <div className="text-sm text-gray-400">
                                {product.totalViews} views • {product.totalVotes} votes
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={product.status === 'PUBLISHED' ? 'default' : 'secondary'}
                            className={
                              product.status === 'PUBLISHED' 
                                ? 'bg-green-600 text-white' 
                                : product.status === 'PENDING'
                                ? 'bg-yellow-600 text-white'
                                : 'bg-gray-600 text-white'
                            }
                          >
                            {product.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-gray-300">
                          {product.releaseDate ? formatDate(product.releaseDate) : 'Not set'}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewGame(product.id)}
                              className="text-blue-400 hover:text-blue-300 hover:bg-blue-400/10"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditGame(product.id)}
                              className="text-green-400 hover:text-green-300 hover:bg-green-400/10"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteClick(product)}
                              className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>


        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent className="bg-gray-800 border-purple-500/20">
            <DialogHeader>
              <DialogTitle className="text-white">Delete Game</DialogTitle>
              <DialogDescription className="text-gray-400">
                Are you sure you want to delete "{productToDelete?.name}"? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDeleteDialogOpen(false)}
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                Cancel
              </Button>
              <Button
                onClick={handleDeleteConfirm}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
