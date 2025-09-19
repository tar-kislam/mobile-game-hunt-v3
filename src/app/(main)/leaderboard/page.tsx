'use client';

import { useState, useEffect } from 'react';
import { Trophy, TrendingUp, Calendar, Clock, Star, MessageCircle, Eye, Share2, Twitter, Instagram, Linkedin, Crown, Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { LazyGalaxy, LazyShuffle } from '@/components/LazyComponents';

interface LeaderboardProduct {
  id: string;
  title: string;
  description: string;
  thumbnail: string | null;
  url: string;
  platforms: string[];
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
  views: number;
  finalScore: number;
  rank: number;
}

interface LeaderboardData {
  window: string;
  take: number;
  total: number;
  products: LeaderboardProduct[];
}

export default function LeaderboardPage() {
  const [activeTab, setActiveTab] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sharingProduct, setSharingProduct] = useState<LeaderboardProduct | null>(null);

  const fetchLeaderboard = async (window: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/leaderboard?window=${window}&take=20`);
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
    if (rank === 1) return <Crown className="w-8 h-8 text-yellow-400" />;
    if (rank === 2) return <Trophy className="w-8 h-8 text-gray-300" />;
    if (rank === 3) return <Trophy className="w-8 h-8 text-amber-500" />;
    return <span className="text-2xl font-bold text-purple-400">#{rank}</span>;
  };

  const getRankBadgeColor = (rank: number) => {
    if (rank === 1) return 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-black shadow-lg shadow-yellow-500/50 border-2 border-yellow-400';
    if (rank === 2) return 'bg-gradient-to-r from-gray-400 to-gray-500 text-white shadow-lg shadow-gray-400/50 border-2 border-gray-300';
    if (rank === 3) return 'bg-gradient-to-r from-amber-600 to-amber-700 text-white shadow-lg shadow-amber-600/50 border-2 border-amber-500';
    return 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg shadow-purple-600/50 border-2 border-purple-400';
  };

  const getRankGlow = (rank: number) => {
    if (rank === 1) return 'shadow-yellow-500/50';
    if (rank === 2) return 'shadow-gray-400/50';
    if (rank === 3) return 'shadow-amber-600/50';
    return 'shadow-purple-600/50';
  };

  const generateShareImage = async (product: LeaderboardProduct) => {
    // Create a canvas element to generate the share image
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 1200;
    canvas.height = 630;

    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#0f0f23');
    gradient.addColorStop(1, '#1a1a2e');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add some particle effects (simplified)
    ctx.fillStyle = 'rgba(147, 51, 234, 0.3)';
    for (let i = 0; i < 50; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const size = Math.random() * 3;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }

    // Title
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('🏆 Mobile Game Hunt Leaderboard', canvas.width / 2, 100);

    // Rank
    ctx.fillStyle = rank === 1 ? '#fbbf24' : rank === 2 ? '#9ca3af' : rank === 3 ? '#d97706' : '#9333ea';
    ctx.font = 'bold 72px Arial';
    ctx.fillText(`#${product.rank}`, canvas.width / 2, 200);

    // Game title
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px Arial';
    ctx.fillText(product.title, canvas.width / 2, 280);

    // Metrics breakdown
    ctx.fillStyle = '#a78bfa';
    ctx.font = '14px Arial';
    ctx.fillText(`Votes: ${product.votes || 0}`, canvas.width / 2, 320);
    ctx.fillText(`Comments: ${product.comments || 0}`, canvas.width / 2, 340);
    ctx.fillText(`Follows: ${product.follows || 0}`, canvas.width / 2, 360);
    ctx.fillText(`Views: ${product.views || 0}`, canvas.width / 2, 380);

    // Mobile Game Hunt branding
    ctx.fillStyle = '#6b7280';
    ctx.font = '16px Arial';
    ctx.fillText('Mobile Game Hunt', canvas.width / 2, 450);
    ctx.fillText('mobilegamehunt.com', canvas.width / 2, 470);

    // Convert to blob and download
    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `mgh-leaderboard-${product.rank}-${product.title.replace(/[^a-zA-Z0-9]/g, '-')}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    });
  };

  const shareToSocial = (product: LeaderboardProduct, platform: 'twitter' | 'instagram' | 'linkedin') => {
    const text = `🔥 My game "${product.title}" just ranked #${product.rank} on Mobile Game Hunt! 🏆✨ Check it out 👉 mobilegamehunt.com`;
    const url = `https://mobilegamehunt.com/product/${product.id}`;
    
    let shareUrl = '';
    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
        break;
      case 'instagram':
        // Instagram doesn't support direct sharing, so we'll generate the image for manual sharing
        generateShareImage(product);
        return;
    }
    
    window.open(shareUrl, '_blank', 'width=600,height=400');
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
    { id: 'monthly', label: 'Monthly', icon: Clock },
  ] as const;

  if (loading && !leaderboardData) {
    return (
      <div className="relative w-full h-screen overflow-hidden">
        {/* Galaxy Background */}
        <Galaxy 
          mouseRepulsion={true}
          mouseInteraction={true}
          density={1.8}
          glowIntensity={0.9}
          saturation={0.0}
          hueShift={0}
          className="absolute inset-0 z-0"
        />
        
        {/* Dark overlay for readability */}
        <div 
          className="absolute inset-0 z-5"
          style={{
            background: 'linear-gradient(to bottom, rgba(10,10,15,0.8), rgba(10,10,15,0.95))'
          }}
        />
        
        <div className="container mx-auto px-4 py-8 relative z-10">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 animate-spin">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <p className="mt-4 text-purple-300 text-lg">Loading leaderboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full min-h-screen overflow-hidden">
      {/* Galaxy Background */}
      <LazyGalaxy 
        mouseRepulsion={true}
        mouseInteraction={true}
        density={1.8}
        glowIntensity={0.9}
        saturation={0.0}
        hueShift={0}
        className="absolute inset-0 z-0"
      />
      
      {/* Dark overlay for readability */}
      <div 
        className="absolute inset-0 z-5"
        style={{
          background: 'linear-gradient(to bottom, rgba(10,10,15,0.8), rgba(10,10,15,0.95))'
        }}
      />

      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="mb-6 flex items-end justify-center">
            <span className="text-6xl mr-4 mb-2">🏆</span>
            <LazyShuffle
              text="Leaderboard"
              shuffleDirection="right"
              duration={0.35}
              animationMode="evenodd"
              shuffleTimes={1}
              ease="power3.out"
              stagger={0.03}
              threshold={0.1}
              loop={true}
              loopDelay={1}
              className="text-6xl font-bold text-white"
            />
          </div>
          <p 
            className="text-lg md:text-xl font-semibold text-white max-w-2xl mx-auto"
            style={{
              fontFamily: '"Underdog", cursive',
              textShadow: '0 0 10px rgba(168, 85, 247, 0.5)'
            }}
          >
            Powered by the community, celebrating the games you love the most.
          </p>
        </motion.div>

        {/* Tabs */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex justify-center mb-12"
        >
            <div className="bg-slate-900/40 backdrop-blur-xl rounded-2xl p-2 border border-slate-700/30 shadow-2xl shadow-purple-500/10">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <Button
                  key={tab.id}
                  variant="ghost"
                  onClick={() => setActiveTab(tab.id)}
                  className={`mx-1 px-6 py-3 rounded-xl transition-all duration-300 ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg shadow-purple-500/50 transform scale-105'
                      : 'text-indigo-200 hover:text-white hover:bg-purple-500/20'
                  }`}
                >
                  <Icon className="w-5 h-5 mr-2" />
                  {tab.label}
                </Button>
              );
            })}
          </div>
        </motion.div>

        {/* Error Display */}
        {error && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-r from-red-900/50 to-pink-900/50 backdrop-blur-md border border-red-500/30 rounded-2xl p-6 mb-8 shadow-2xl shadow-red-500/20"
          >
            <p className="text-red-200 text-center">{error}</p>
          </motion.div>
        )}

        {/* Leaderboard */}
        {leaderboardData && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="space-y-6"
          >
            {/* Stats */}
            <div className="text-center mb-8">
                <p className="text-indigo-200 text-lg">
                  Showing top <span className="text-pink-400 font-bold">{leaderboardData.products.length}</span> of{' '}
                  <span className="text-pink-400 font-bold">{leaderboardData.total}</span> products
                </p>
            </div>

            {/* Products */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="space-y-4"
              >
                {leaderboardData.products.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                  >
                    <Card className="bg-slate-900/60 backdrop-blur-xl border border-slate-700/30 hover:border-purple-500/60 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/20 hover:scale-[1.02] group">
                      <CardContent className="p-6">
                        <div className="flex items-center space-x-6">
                          {/* Rank - Enhanced for top 3 */}
                          <div className="flex-shrink-0">
                            <div className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl ${getRankBadgeColor(product.rank)} shadow-lg ${getRankGlow(product.rank)} group-hover:scale-110 transition-transform duration-300 ${product.rank <= 3 ? 'animate-pulse' : ''}`}>
                              {getRankIcon(product.rank)}
                            </div>
                          </div>

                          {/* Product Image */}
                          <div className="flex-shrink-0">
                            {product.thumbnail ? (
                              <img
                                src={product.thumbnail}
                                alt={product.title}
                                width={96}
                                height={96}
                                loading="lazy"
                                className="w-24 h-24 rounded-xl object-cover border-2 border-purple-500/30 group-hover:border-purple-400/60 transition-colors duration-300"
                              />
                            ) : (
                              <div className="w-24 h-24 bg-gradient-to-br from-slate-700 to-purple-700 rounded-xl flex items-center justify-center border-2 border-purple-500/30 group-hover:border-purple-400/60 transition-colors duration-300">
                                <span className="text-purple-300 text-sm font-medium">No Image</span>
                              </div>
                            )}
                          </div>

                          {/* Product Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="text-xl font-bold text-white truncate group-hover:text-purple-300 transition-colors duration-300">
                                {product.title}
                              </h3>
                              <Badge className="bg-gradient-to-r from-green-600 to-emerald-600 text-white border-0 shadow-lg shadow-green-500/30">
                                {product.status}
                              </Badge>
                            </div>
                            
                            <p className="text-purple-200 text-sm mb-3 line-clamp-2">
                              {product.description}
                            </p>

                            {/* Platforms */}
                            <div className="flex flex-wrap gap-2 mb-3">
                              {product.platforms?.slice(0, 3).map((platform) => (
                                <Badge key={platform} variant="outline" className="text-xs border-purple-500/50 text-purple-300 hover:bg-purple-500/20 transition-colors duration-300">
                                  {platform.toUpperCase()}
                                </Badge>
                              ))}
                              {product.platforms?.length > 3 && (
                                <Badge variant="outline" className="text-xs border-purple-500/50 text-purple-300">
                                  +{product.platforms.length - 3}
                                </Badge>
                              )}
                            </div>

                            {/* User Info */}
                            <div className="flex items-center space-x-2 text-sm text-purple-300">
                              <span>by</span>
                              <span className="font-medium text-purple-200">
                                {product.user.name || 'Anonymous'}
                              </span>
                              <span>•</span>
                              <span>{formatDate(product.createdAt)}</span>
                            </div>
                          </div>

                          {/* Stats */}
                          <div className="flex-shrink-0 text-right">
                            <div className="space-y-2 text-sm">
                              <div className="flex items-center space-x-2 text-purple-300">
                                <Star className="w-4 h-4 text-yellow-400" />
                                <span>{product.votes || 0} votes</span>
                              </div>
                              <div className="flex items-center space-x-2 text-purple-300">
                                <MessageCircle className="w-4 h-4 text-blue-400" />
                                <span>{product.comments || 0} comments</span>
                              </div>
                              <div className="flex items-center space-x-2 text-purple-300">
                                <TrendingUp className="w-4 h-4 text-green-400" />
                                <span>{product.follows || 0} follows</span>
                              </div>
                              <div className="flex items-center space-x-2 text-purple-300">
                                <Eye className="w-4 h-4 text-cyan-400" />
                                <span>{product.views || 0} views</span>
                              </div>
                            </div>
                          </div>

                          {/* Share Button */}
                          <div className="flex-shrink-0">
                            <div className="relative group/share">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSharingProduct(sharingProduct?.id === product.id ? null : product)}
                                className="border-purple-500/50 text-purple-300 hover:bg-purple-500/20 hover:border-purple-400/60 transition-all duration-300"
                              >
                                <Share2 className="w-4 h-4 mr-2" />
                                Share
                              </Button>
                              
                              {/* Share Dropdown */}
                              {sharingProduct?.id === product.id && (
                                <motion.div
                                  initial={{ opacity: 0, scale: 0.9, y: 10 }}
                                  animate={{ opacity: 1, scale: 1, y: 0 }}
                                  exit={{ opacity: 0, scale: 0.9, y: 10 }}
                                  className="absolute top-full right-0 mt-2 bg-gradient-to-r from-slate-800 to-purple-800 backdrop-blur-md border border-purple-500/30 rounded-xl p-3 shadow-2xl shadow-purple-500/20 z-50"
                                >
                                  <div className="flex space-x-2">
                                    <Button
                                      size="sm"
                                      onClick={() => shareToSocial(product, 'twitter')}
                                      className="bg-blue-600 hover:bg-blue-700 text-white border-0"
                                    >
                                      <Twitter className="w-4 h-4" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      onClick={() => shareToSocial(product, 'instagram')}
                                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0"
                                    >
                                      <Instagram className="w-4 h-4" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      onClick={() => shareToSocial(product, 'linkedin')}
                                      className="bg-blue-700 hover:bg-blue-800 text-white border-0"
                                    >
                                      <Linkedin className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </motion.div>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
          </motion.div>
        )}

        {/* Empty State */}
        {leaderboardData && leaderboardData.products.length === 0 && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16"
          >
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 mb-6">
              <Trophy className="w-12 h-12 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">
              No products found
            </h3>
            <p className="text-purple-300 text-lg">
              Try a different time window or check back later.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
