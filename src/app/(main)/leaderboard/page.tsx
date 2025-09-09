'use client';

import { useState, useEffect } from 'react';
import { Trophy, TrendingUp, Calendar, Clock, Star, MessageCircle, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface LeaderboardProduct {
  id: string;
  title: string;
  description: string;
  tagline: string | null;
  thumbnail: string | null;
  url: string;
  platforms: string[];
  countries: string[];
  status: string;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    image: string | null;
  };
  votes: number;
  comments: number;
  follows: number;
  clicks: number;
  score: number;
  rank: number;
}

interface LeaderboardData {
  window: string;
  take: number;
  total: number;
  products: LeaderboardProduct[];
}

export default function LeaderboardPage() {
  const [activeTab, setActiveTab] = useState<'daily' | 'weekly' | 'all'>('daily');
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLeaderboard = async (window: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/leaderboard?window=${window}&take=50`);
      if (!response.ok) {
        throw new Error('Failed to fetch leaderboard data');
      }
      
      const data = await response.json();
      setLeaderboardData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard(activeTab);
  }, [activeTab]);

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-6 h-6 text-yellow-500" />;
    if (rank === 2) return <Trophy className="w-6 h-6 text-gray-400" />;
    if (rank === 3) return <Trophy className="w-6 h-6 text-amber-600" />;
    return <span className="text-lg font-bold text-gray-600">#{rank}</span>;
  };

  const getRankBadgeColor = (rank: number) => {
    if (rank === 1) return 'bg-yellow-500 text-white';
    if (rank === 2) return 'bg-gray-400 text-white';
    if (rank === 3) return 'bg-amber-600 text-white';
    return 'bg-gray-200 text-gray-700';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const tabs = [
    { id: 'daily', label: 'Daily', icon: Calendar },
    { id: 'weekly', label: 'Weekly', icon: TrendingUp },
    { id: 'all', label: 'All Time', icon: Clock },
  ] as const;

  if (loading && !leaderboardData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-[#121225] to-[#050509] bg-[radial-gradient(80%_80%_at_0%_0%,rgba(124,58,237,0.22),transparent_60%),radial-gradient(80%_80%_at_100%_100%,rgba(6,182,212,0.18),transparent_60%)]">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading leaderboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-[#121225] to-[#050509] bg-[radial-gradient(80%_80%_at_0%_0%,rgba(124,58,237,0.22),transparent_60%),radial-gradient(80%_80%_at_100%_100%,rgba(6,182,212,0.18),transparent_60%)]">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            🏆 Leaderboard
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Discover the most popular mobile games and apps
          </p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-1 shadow-lg">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <Button
                  key={tab.id}
                  variant={activeTab === tab.id ? 'default' : 'ghost'}
                  onClick={() => setActiveTab(tab.id)}
                  className={`mx-1 ${
                    activeTab === tab.id
                      ? 'bg-purple-600 text-white hover:bg-purple-700'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {tab.label}
                </Button>
              );
            })}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {/* Leaderboard */}
        {leaderboardData && (
          <div className="space-y-4">
            {/* Stats */}
            <div className="text-center mb-6">
              <p className="text-gray-600 dark:text-gray-400">
                Showing top {leaderboardData.products.length} of {leaderboardData.total} products
              </p>
            </div>

            {/* Products */}
            {leaderboardData.products.map((product) => (
              <Card key={product.id} className="hover:shadow-lg transition-shadow duration-200">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    {/* Rank */}
                    <div className="flex-shrink-0 w-16 text-center">
                      <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full ${getRankBadgeColor(product.rank)}`}>
                        {getRankIcon(product.rank)}
                      </div>
                    </div>

                    {/* Product Image */}
                    <div className="flex-shrink-0">
                      {product.thumbnail ? (
                        <img
                          src={product.thumbnail}
                          alt={product.title}
                          className="w-20 h-20 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                          <span className="text-gray-500 dark:text-gray-400 text-sm">No Image</span>
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                          {product.title}
                        </h3>
                        <Badge variant="secondary" className="text-xs">
                          {product.status}
                        </Badge>
                      </div>
                      
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
                        {product.tagline || product.description}
                      </p>

                      {/* Platforms & Countries */}
                      <div className="flex flex-wrap gap-2 mb-3">
                        {product.platforms?.map((platform) => (
                          <Badge key={platform} variant="outline" className="text-xs">
                            {platform.toUpperCase()}
                          </Badge>
                        ))}
                        {product.countries?.map((country) => (
                          <Badge key={country} variant="outline" className="text-xs">
                            {country}
                          </Badge>
                        ))}
                      </div>

                      {/* User Info */}
                      <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                        <span>by</span>
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                          {product.user.name || 'Anonymous'}
                        </span>
                        <span>•</span>
                        <span>{formatDate(product.createdAt)}</span>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex-shrink-0 text-right">
                      <div className="text-2xl font-bold text-purple-600 mb-2">
                        {product.score.toFixed(2)}
                      </div>
                      <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 text-yellow-500" />
                          <span>{product.votes} votes</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MessageCircle className="w-4 h-4 text-blue-500" />
                          <span>{product.comments} comments</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Eye className="w-4 h-4 text-green-500" />
                          <span>{product.clicks} clicks</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {leaderboardData && leaderboardData.products.length === 0 && (
          <div className="text-center py-12">
            <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No products found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Try a different time window or check back later.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
