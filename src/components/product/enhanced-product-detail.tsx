'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Star, 
  Heart, 
  Bell, 
  ExternalLink, 
  Share2, 
  Play,
  Calendar,
  User,
  MessageCircle,
  Eye,
  Download,
  Send,
  ArrowUpIcon
} from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PlatformIcons } from '@/components/ui/platform-icons';
import { MediaCarousel } from './media-carousel';
import { PlaytestClaim } from '@/components/playtest/playtest-claim';
import { UpvoteButton } from '@/components/ui/upvote-button';
import { Comment } from '@/components/ui/comment';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input'
import Link from 'next/link'

interface Product {
  id: string;
  title: string;
  tagline?: string | null;
  description: string;
  url: string;
  image?: string | null;
  images: string[];
  video?: string | null;
  platforms?: string[];
  appStoreUrl?: string | null;
  playStoreUrl?: string | null;
  socialLinks?: any;
  createdAt: string;
  releaseAt?: string | null;
  clicks: number;
  follows: number;
  user: {
    id: string;
    name: string | null;
    image?: string | null;
  };
  categories?: Array<{
    category: {
      id: string;
      name: string;
    };
  }>;
  _count: {
    votes: number;
    comments: number;
  };
}

interface EnhancedProductDetailProps {
  product: Product;
  hasVoted: boolean;
}

export function EnhancedProductDetail({ product, hasVoted }: EnhancedProductDetailProps) {
  const { data: session } = useSession();
  const [isFollowing, setIsFollowing] = useState(false);
  const [isNotifying, setIsNotifying] = useState(false);
  const [followCount, setFollowCount] = useState(product.follows);
  const [clickCount, setClickCount] = useState(product.clicks);
  const [hasPressKit, setHasPressKit] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState<any[]>([]);
  const [productVotes, setProductVotes] = useState(product._count.votes);
  const [isProductUpvoted, setIsProductUpvoted] = useState(hasVoted);
  const [pledgeAmount, setPledgeAmount] = useState('')
  const [pledgeNote, setPledgeNote] = useState('')
  const [pledgeTotal, setPledgeTotal] = useState<number | null>(null)
  const [isPledging, setIsPledging] = useState(false)
  const [recommended, setRecommended] = useState<any[]>([])

  // Check follow status and press kit on mount
  useEffect(() => {
    if (session?.user?.id) {
      checkFollowStatus();
    }
    checkPressKitStatus();
    fetchComments();
  }, [session, product.id]);

  useEffect(() => {
    // Load pledge total on mount
    const loadPledges = async () => {
      try {
        const res = await fetch(`/api/pledge?gameId=${product.id}`)
        if (!res.ok) return
        const data = await res.json()
        setPledgeTotal(Number(data.total) || 0)
      } catch {}
    }
    loadPledges()
  }, [product.id])

  useEffect(() => {
    const likes = [product.title, product.tagline || '', ...(product.platforms || [])].join(',')
    const load = async () => {
      try {
        const res = await fetch(`/api/recommend?likes=${encodeURIComponent(likes)}&take=5`)
        if (!res.ok) return
        const data = await res.json()
        setRecommended(data.products || [])
      } catch {}
    }
    load()
  }, [product.id])

  const checkPressKitStatus = async () => {
    try {
      const response = await fetch(`/api/presskit?gameId=${product.id}`);
      if (response.ok) {
        setHasPressKit(true);
      }
    } catch (error) {
      // Press kit doesn't exist or error occurred
      setHasPressKit(false);
    }
  };

  const checkFollowStatus = async () => {
    try {
      const response = await fetch(`/api/follow?gameId=${product.id}`);
      if (response.ok) {
        const data = await response.json();
        setIsFollowing(data.following);
      }
    } catch (error) {
      console.error('Error checking follow status:', error);
    }
  };

  const handleFollow = async () => {
    if (!session) {
      toast.error('Please sign in to follow products');
      return;
    }

    try {
      const response = await fetch('/api/follow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameId: product.id })
      });

      if (response.ok) {
        const data = await response.json();
        setIsFollowing(data.following);
        setFollowCount(prev => data.following ? prev + 1 : prev - 1);
        toast.success(data.message);
      } else {
        toast.error('Failed to update follow status');
      }
    } catch (error) {
      console.error('Error following product:', error);
      toast.error('Failed to update follow status');
    }
  };

  const handleNotify = async () => {
    if (!session) {
      toast.error('Please sign in to get notifications');
      return;
    }

    setIsNotifying(!isNotifying);
    toast.success(isNotifying ? 'Notifications disabled' : 'Notifications enabled');
  };

  const handlePlayNow = async () => {
    // Track click metric
    try {
      await fetch('/api/metrics/click', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          gameId: product.id, 
          type: 'play',
          referrer: window.location.href
        })
      });
    } catch (error) {
      console.error('Error tracking metric:', error);
    }

    // Open game URL
    window.open(product.url, '_blank', 'noopener,noreferrer');
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.title,
          text: product.tagline || product.description,
          url: window.location.href,
        });
      } catch (error) {
        // Fallback to clipboard
        await navigator.clipboard.writeText(window.location.href);
        toast.success('Link copied to clipboard!');
      }
    } else {
      await navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  const handleDownloadPressKit = async () => {
    try {
      // For now, we'll open the press kit in a new tab
      // Later this can be enhanced to download as ZIP
      const response = await fetch(`/api/presskit?gameId=${product.id}`);
      if (response.ok) {
        const data = await response.json();
        // For now, just show the press kit data
        // In the future, this could generate a PDF or ZIP file
        toast.success('Press kit available! (Download feature coming soon)');
        console.log('Press Kit Data:', data.pressKit);
      } else {
        toast.error('Press kit not found');
      }
    } catch (error) {
      console.error('Error fetching press kit:', error);
      toast.error('Failed to load press kit');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getTimeUntilRelease = (releaseDate: string) => {
    const now = new Date();
    const release = new Date(releaseDate);
    const diff = release.getTime() - now.getTime();
    
    if (diff <= 0) return 'Released';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ${hours}h until release`;
    return `${hours}h until release`;
  };

  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/products/${product.id}/comments`);
      if (response.ok) {
        const data = await response.json();
        setComments(data);
      } else {
        toast.error('Failed to fetch comments');
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
      toast.error('Failed to load comments');
    }
  };

  const handleCommentSubmit = async () => {
    if (!session) {
      toast.error('Please sign in to comment');
      return;
    }

    if (!newComment.trim()) {
      toast.error('Comment cannot be empty');
      return;
    }

    try {
      const response = await fetch(`/api/products/${product.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newComment })
      });

      if (response.ok) {
        const data = await response.json();
        setComments(prev => [data, ...prev]);
        setNewComment('');
        toast.success('Comment posted!');
      } else {
        toast.error('Failed to post comment');
      }
    } catch (error) {
      console.error('Error posting comment:', error);
      toast.error('Failed to post comment');
    }
  };

  const handleProductVote = async (newVoteCount: number, isUpvoted: boolean) => {
    if (!session) {
      toast.error('Please sign in to vote');
      return;
    }

    try {
      const response = await fetch(`/api/products/${product.id}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ upvoted: isUpvoted })
      });

      if (response.ok) {
        setProductVotes(newVoteCount);
        setIsProductUpvoted(isUpvoted);
        toast.success(isUpvoted ? 'Upvoted!' : 'Removed upvote');
      } else {
        toast.error('Failed to update vote');
      }
    } catch (error) {
      console.error('Error updating vote:', error);
      toast.error('Failed to update vote');
    }
  };

  const handleCommentVote = (commentId: string, newVoteCount: number, isUpvoted: boolean) => {
    // Update comment votes in local state
    setComments(prev => prev.map(comment => 
      comment.id === commentId 
        ? { ...comment, _count: { ...comment._count, votes: newVoteCount } }
        : comment
    ));
  };

  const handleCommentReply = (commentId: string) => {
    // Focus on comment input and add @username
    const comment = comments.find(c => c.id === commentId);
    if (comment) {
      setNewComment(`@${comment.user.name || 'Anonymous'} `);
      // Focus on textarea
      const textarea = document.querySelector('textarea');
      if (textarea) {
        textarea.focus();
      }
    }
  };

  const handleCommentReport = (commentId: string) => {
    toast.info('Report functionality coming soon!');
  };

  const handleCommentShare = (commentId: string) => {
    const commentUrl = `${window.location.href}#comment-${commentId}`;
    navigator.clipboard.writeText(commentUrl);
    toast.success('Comment link copied to clipboard!');
  };

  const handlePledge = async () => {
    if (!pledgeAmount || isNaN(Number(pledgeAmount))) return
    try {
      setIsPledging(true)
      const res = await fetch('/api/pledge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameId: product.id, amount: Number(pledgeAmount), note: pledgeNote })
      })
      if (res.ok) {
        const list = await fetch(`/api/pledge?gameId=${product.id}`).then(r => r.json())
        setPledgeTotal(Number(list.total) || 0)
        setPledgeAmount('')
        setPledgeNote('')
      }
    } finally {
      setIsPledging(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Hero Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Media */}
        <div className="lg:col-span-2">
          <MediaCarousel 
            images={(product.images && product.images.length > 0
              ? product.images
              : ((product as any).gallery || []))}
            video={product.video ?? (product as any).videoUrl ?? undefined}
            mainImage={product.image ?? (product as any).thumbnail ?? undefined}
            title={product.title}
          />
          
          {/* About This Game Section */}
          <Card className="rounded-2xl shadow-soft mt-6">
            <CardHeader>
              <CardTitle className="text-xl font-semibold">About This Game</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap break-words">
                {product.description}
              </p>
            </CardContent>
          </Card>

          {/* Comments Section - Right below About This Game */}
          <Card className="rounded-2xl shadow-soft mt-6">
            <CardHeader>
              <CardTitle className="text-xl font-semibold">
                Comments ({product._count.comments})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Add Comment */}
              {session ? (
                <div className="space-y-3">
                  <Textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="What do you think? Share your thoughts..."
                    className="rounded-xl border-border focus:ring-2 focus:ring-ring min-h-[100px]"
                  />
                  <div className="flex justify-end">
                    <Button onClick={handleCommentSubmit} className="rounded-xl">
                      <Send className="w-4 h-4 mr-2" />
                      Post Comment
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="p-4 border border-dashed border-muted-foreground/30 rounded-xl text-center">
                  <p className="text-muted-foreground mb-2">Join the conversation</p>
                  <Button className="rounded-xl">Sign in to comment</Button>
                </div>
              )}

              {/* Comments List */}
              <div className="space-y-4">
                {comments.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No comments yet. Be the first to share your thoughts!
                  </p>
                ) : (
                  comments.map((comment) => (
                    <Comment
                      key={comment.id}
                      comment={comment}
                      onVoteChange={handleCommentVote}
                      onReply={handleCommentReply}
                      onReport={handleCommentReport}
                      onShare={handleCommentShare}
                    />
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Info & Actions */}
        <div className="space-y-6">
                    {/* Game Info Card */}
          <Card className="rounded-2xl shadow-soft">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {product.title}
                  </CardTitle>
                  {product.tagline && (
                    <p className="text-gray-600 dark:text-gray-300 text-lg">
                      {product.tagline}
                    </p>
                  )}
                </div>
                
                {/* Upvote Button */}
                <div className="flex items-center gap-2">
                  <UpvoteButton
                    initialVotes={productVotes}
                    isUpvoted={isProductUpvoted}
                    onVoteChange={handleProductVote}
                    size="lg"
                    variant="outline"
                    className="mr-2"
                  />
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Platform Icons */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Platforms:
                </span>
                <PlatformIcons 
                  platforms={product.platforms || []} 
                  size="sm" 
                  showLabels={true}
                />
              </div>

              {/* Release Date */}
              {product.releaseAt && (
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(product.releaseAt)}</span>
                  <Badge variant="outline" className="ml-2">
                    {getTimeUntilRelease(product.releaseAt)}
                  </Badge>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button 
                  onClick={handlePlayNow}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 rounded-xl"
                >
                  <Play className="w-5 h-5 mr-2" />
                  Play Now
                </Button>

                <div className="flex gap-2">
                  <Button
                    onClick={handleFollow}
                    variant={isFollowing ? "default" : "outline"}
                    className="flex-1"
                  >
                    <Heart className={`w-4 h-4 mr-2 ${isFollowing ? 'fill-current' : ''}`} />
                    {isFollowing ? 'Following' : 'Follow'}
                  </Button>

                  <Button
                    onClick={handleNotify}
                    variant={isNotifying ? "default" : "outline"}
                    className="flex-1"
                  >
                    <Bell className={`w-4 h-4 mr-2 ${isNotifying ? 'fill-current' : ''}`} />
                    Notify
                  </Button>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleShare}
                    variant="outline"
                    className="flex-1"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>

                  {hasPressKit && (
                    <Button
                      onClick={handleDownloadPressKit}
                      variant="outline"
                      className="flex-1"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Press Kit
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats Card */}
          <Card className="rounded-2xl shadow-soft">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Game Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-400" />
                  <span className="text-gray-600 dark:text-gray-400">Votes</span>
                  <span className="font-semibold">{productVotes}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-red-400" />
                  <span className="text-gray-600 dark:text-gray-400">Following</span>
                  <span className="font-semibold">{followCount}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-blue-400" />
                  <span className="text-gray-600 dark:text-gray-400">Comments</span>
                  <span className="font-semibold">{product._count.comments}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-green-400" />
                  <span className="text-gray-600 dark:text-gray-400">Views</span>
                  <span className="font-semibold">{clickCount}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Download Card - Right below Game Stats */}
          {(product.appStoreUrl || product.playStoreUrl) && (
            <Card className="rounded-2xl shadow-soft">
              <CardHeader>
                <CardTitle className="text-xl font-semibold">Download</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-3">
                  {product.appStoreUrl && (
                    <Button asChild variant="outline" className="flex-1">
                      <a href={product.appStoreUrl} target="_blank" rel="noopener noreferrer">
                        <Download className="w-4 h-4 mr-2" />
                        App Store
                      </a>
                    </Button>
                  )}
                  {product.playStoreUrl && (
                    <Button asChild variant="outline" className="flex-1">
                      <a href={product.playStoreUrl} target="_blank" rel="noopener noreferrer">
                        <Download className="w-4 h-4 mr-2" />
                        Google Play
                      </a>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Pledge Card - Right below Download/Playtest cards */}
          <Card className="rounded-2xl shadow-soft">
            <CardHeader>
              <CardTitle className="text-xl font-semibold">Pledge Support</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm text-muted-foreground">Total pledged: {pledgeTotal === null ? '—' : `$${pledgeTotal.toFixed(0)}`}</div>
              <div className="flex gap-2">
                <Input
                  type="number"
                  min="1"
                  placeholder="Amount"
                  value={pledgeAmount}
                  onChange={(e) => setPledgeAmount(e.target.value)}
                />
                <Button onClick={handlePledge} disabled={isPledging || !pledgeAmount}>
                  {isPledging ? 'Sending…' : 'Pledge'}
                </Button>
              </div>
              <Input
                placeholder="Add a note (optional)"
                value={pledgeNote}
                onChange={(e) => setPledgeNote(e.target.value)}
              />
            </CardContent>
          </Card>

          {/* Recommended Card - Right below Pledge Card */}
          {recommended.length > 0 && (
            <Card className="rounded-2xl shadow-soft">
              <CardHeader>
                <CardTitle className="text-xl font-semibold">Recommended for you</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {recommended.map((r) => (
                  <div key={r.id} className="flex items-center justify-between text-sm">
                    <Link href={`/product/${r.id}`} className="truncate hover:underline">
                      {r.title}
                    </Link>
                    <span className="text-muted-foreground">{Math.round((r._score || 0) * 100)}%</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Share Card */}
          <Card className="rounded-2xl shadow-soft">
            <CardHeader>
              <CardTitle className="text-xl font-semibold">Share</CardTitle>
            </CardHeader>
            <CardContent className="flex gap-2">
              <Button variant="outline" asChild>
                <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}&text=${encodeURIComponent(product.title)}`} target="_blank" rel="noopener noreferrer">
                  <Share2 className="w-4 h-4 mr-2" /> Twitter
                </a>
              </Button>
              <Button variant="outline" asChild>
                <a href={`https://www.reddit.com/submit?url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}&title=${encodeURIComponent(product.title)}`} target="_blank" rel="noopener noreferrer">
                  <Share2 className="w-4 h-4 mr-2" /> Reddit
                </a>
              </Button>
              <Button variant="outline" onClick={handleShare}>
                <Share2 className="w-4 h-4 mr-2" /> Copy
              </Button>
            </CardContent>
          </Card>

          {/* Developer Info */}
          <Card className="rounded-2xl shadow-soft">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Developer</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-blue-500 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {product.user.name || 'Anonymous'}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(product.createdAt)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Playtest Claim Card */}
          <PlaytestClaim gameId={product.id} gameTitle={product.title} />
        </div>
      </div>
    </div>
  );
}
