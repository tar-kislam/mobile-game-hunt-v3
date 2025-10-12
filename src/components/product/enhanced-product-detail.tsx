'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { trackGameView } from '@/lib/analytics';
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
  MessageCircle,
  Eye,
  Download,
  Send,
  ArrowUpIcon,
  Globe,
  Twitter,
  Youtube,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Copy,
  Gift,
  Music,
  Smartphone,
  Instagram,
  Facebook,
  Linkedin,
  Building
} from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { PlatformIcons } from '@/components/ui/platform-icons';
import dynamicImport from 'next/dynamic';
import { PlaytestClaim } from '@/components/playtest/playtest-claim';
import { UpvoteButton } from '@/components/ui/upvote-button';
import { Comment } from '@/components/ui/comment';

// Dynamic imports for heavy components
const MediaCarousel = dynamicImport(() => import('./media-carousel').then(mod => ({ default: mod.MediaCarousel })), {
  loading: () => <div className="animate-pulse bg-gray-800 rounded-lg h-96 w-full" />
});

const ShareModal = dynamicImport(() => import('./share-modal').then(mod => ({ default: mod.ShareModal })), {
  ssr: false
});
import { toast } from 'sonner';
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { LANGUAGES } from '@/lib/constants/languages'
import { UserAvatarTooltip } from '@/components/ui/user-avatar-tooltip'
import { ProductTags } from './product-tags'
import { MeetTheTeamCard } from './meet-the-team-card';
import { AboutGameSection } from './about-game-section';

interface Product {
  id: string;
  title: string;
  tagline?: string | null;
  description: string;
  url: string;
  image?: string | null;
  thumbnail?: string | null;
  gallery?: any;
  videoUrl?: string | null;
  gameplayGifUrl?: string | null;
  demoUrl?: string | null;
  youtubeUrl?: string | null;
  images: string[];
  video?: string | null;
  platforms?: string[];
  iosUrl?: string | null;
  androidUrl?: string | null;
  socialLinks?: any;
  createdAt: string;
  releaseAt?: string | null;
  status?: string | null;
  launchType?: string | null;
  launchDate?: string | null;
  monetization?: string | null;
  engine?: string | null;
  clicks: number;
  follows: number;
  tags?: Array<{
    tag: {
      id: string;
      name: string;
      slug: string;
    };
  }>;
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
  makers?: Array<{
    id: string;
    role: string;
    isCreator: boolean;
    user?: {
      id: string;
      name: string | null;
      image?: string | null;
    } | null;
    email?: string | null;
  }>;
  _count: {
    votes: number;
    comments: number;
  };
  // Extras fields
  promoOffer?: string | null;
  promoCode?: string | null;
  promoExpiry?: string | null;
  // Playtest & Sponsor fields
  playtestQuota?: number | null;
  playtestExpiry?: string | null;
  sponsorRequest?: boolean | null;
  sponsorNote?: string | null;
  // Additional fields
  gamificationTags?: string[] | null;
  languages?: Array<{
    name: string;
    interface: boolean;
    audio: boolean;
    subtitles: boolean;
  }> | null;
  studioName?: string | null;
  countries?: string[] | null;
}

interface EnhancedProductDetailProps {
  product: Product;
  hasVoted: boolean;
  session: any;
}

export function EnhancedProductDetail({ product, hasVoted, session }: EnhancedProductDetailProps) {
  const [isFollowing, setIsFollowing] = useState(false);
  const [isNotifying, setIsNotifying] = useState(false);
  const [followCount, setFollowCount] = useState(product.follows);
  const [clickCount, setClickCount] = useState(product.clicks);
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState<any[]>([]);
  const [productVotes, setProductVotes] = useState(product._count.votes);
  const [isProductUpvoted, setIsProductUpvoted] = useState(hasVoted);
  const [recommended, setRecommended] = useState<any[]>([])

  // Track product view in Google Analytics
  useEffect(() => {
    trackGameView(product.id, product.title)
  }, [product.id, product.title])
  const [currentUrl, setCurrentUrl] = useState('')
  const [isPromoExpanded, setIsPromoExpanded] = useState(false)

  // Track product detail page view
  const trackProductView = async () => {
    // Only track in browser environment
    if (typeof window === 'undefined') return;
    
    try {
      const response = await fetch('/api/metrics/click', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          gameId: product.id, 
          type: 'view',
          referrer: window.location.href
        })
      });

      if (!response.ok) {
        console.warn('Metrics tracking failed:', response.status, response.statusText);
        return;
      }

      const result = await response.json();
      console.log('Product view tracked successfully:', result);
    } catch (error) {
      console.warn('Error tracking product view (non-critical):', error);
      // Don't throw - this is non-critical functionality
    }
  };

  // Check follow status on mount
  useEffect(() => {
    if (session?.user?.id) {
      checkFollowStatus();
    }
    fetchComments();
    // Set current URL on client side
    setCurrentUrl(window.location.href);
    
    // Track product detail page view
    trackProductView();
  }, [session, product.id]);

  useEffect(() => {
    if (product?.id) {
      fetch('/api/metrics/click', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameId: product.id, type: 'INTERNAL' })
      }).catch(() => {})
    }
  }, [product?.id])


  const checkFollowStatus = async () => {
    try {
      const response = await fetch(`/api/game-follow?gameId=${product.id}`);
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
      const response = await fetch('/api/game-follow', {
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

  const formatLaunchDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();

    if (date < now) {
      return null; // Don't show past dates
    }

    const options: Intl.DateTimeFormatOptions = {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    };

    return `Launching ${date.toLocaleDateString('en-US', options)}`;
  };


  const formatPromoExpiry = (expiryDate: string) => {
    const expiry = new Date(expiryDate);
    const now = new Date();
    
    if (expiry <= now) return 'Expired';
    
    const diff = expiry.getTime() - now.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Expires today';
    if (days === 1) return 'Expires tomorrow';
    if (days < 7) return `Expires in ${days} days`;
    return `Expires ${expiry.toLocaleDateString()}`;
  };

  const handleCopyPromoCode = async () => {
    if (product.promoCode) {
      try {
        await navigator.clipboard.writeText(product.promoCode);
        toast.success('Promo code copied to clipboard!');
      } catch (error) {
        toast.error('Failed to copy promo code');
      }
    }
  };

  const handleRedeemPromo = () => {
    toast.info('Redeem functionality coming soon!');
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
      // Revert after 1 second to show the animation
      setTimeout(() => {
        setProductVotes(product._count.votes);
        setIsProductUpvoted(hasVoted);
      }, 1000);
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
        // Revert on error after 1 second
        setTimeout(() => {
          setProductVotes(product._count.votes);
          setIsProductUpvoted(hasVoted);
        }, 1000);
      }
    } catch (error) {
      console.error('Error updating vote:', error);
      toast.error('Failed to update vote');
      // Revert on error after 1 second
      setTimeout(() => {
        setProductVotes(product._count.votes);
        setIsProductUpvoted(hasVoted);
      }, 1000);
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


  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* H1 Heading for SEO */}
      <h1 className="text-3xl font-bold text-white mb-6 sr-only">
        {product.title} - Mobile Game Details & Launch Info
      </h1>
      
      {/* Hero Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Media */}
        <div className="lg:col-span-2">
          <MediaCarousel 
            images={(product.images && product.images.length > 0
              ? product.images
              : ((product as any).gallery || []))}
            video={product.youtubeUrl ?? product.video ?? (product as any).videoUrl ?? undefined}
            mainImage={product.image ?? (product as any).thumbnail ?? undefined}
            title={product.title}
            gameplayGifUrl={product.gameplayGifUrl ?? undefined}
          />
          
          {/* Game Overview Block - Steam Style */}
          <Card className="rounded-3xl shadow-soft border-2 mt-6 border border-gray-200 dark:border-gray-700">
            <CardHeader className="pb-4">
              <h2 className="text-xl font-semibold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
                Game Overview
              </h2>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Release Date */}
              {product.launchDate && (
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-blue-400" />
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Release Date:</h3>
                    <p className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                      {new Date(product.launchDate).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </p>
                  </div>
                </div>
              )}

              {/* Publisher */}
              {product.studioName && (
                <div className="flex items-center gap-3">
                  <Globe className="w-5 h-5 text-purple-400" />
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Publisher:</h3>
                    <p className="ml-2 text-sm text-gray-600 dark:text-gray-400">{product.studioName}</p>
                  </div>
                </div>
              )}

              {/* Categories */}
              {product.categories && product.categories.length > 0 && (
                <div className="flex items-start gap-3">
                  <Star className="w-5 h-5 text-yellow-400 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Categories:</h3>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {product.categories.map((cat, index) => (
                        <Badge key={index} variant="outline" className="text-xs rounded-full px-3 py-1">
                          {cat.category.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Tags */}
              <ProductTags tags={product.tags || []} />



              {/* Regions */}
              {product.countries && product.countries.length > 0 && (
                <div className="flex items-start gap-3">
                  <Globe className="w-5 h-5 text-indigo-400 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Regions:</h3>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {product.countries.map((country, index) => (
                        <Badge key={index} variant="outline" className="text-xs rounded-full px-3 py-1">
                          {country}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              )}


            </CardContent>
          </Card>
          
          {/* About This Game Section */}
          <AboutGameSection description={product.description} />

          {/* Comments Section - Right below About This Game */}
          <Card className="rounded-3xl shadow-soft border-2 mt-6">
            <CardHeader>
              <h2 className="text-xl font-semibold">
                Comments ({product._count.comments})
              </h2>
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
                  <Button onClick={handleCommentSubmit} className="rounded-full px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                    <Send className="w-4 h-4 mr-2" />
                    Post Comment
                  </Button>
                  </div>
                </div>
              ) : (
                <div className="p-4 border border-dashed border-muted-foreground/30 rounded-xl text-center">
                  <p className="text-muted-foreground mb-2">Join the conversation</p>
                  <Button className="rounded-full px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">Sign in to comment</Button>
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
          <Card className="rounded-3xl shadow-soft border-2">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                    {product.title}
                  </CardTitle>
                    {product.sponsorRequest && (
                      <Badge variant="secondary" className="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs px-3 py-1 rounded-full">
                        Sponsored
                      </Badge>
                    )}
                  </div>
                  {product.tagline && (
                    <p className="text-gray-600 dark:text-gray-300 text-lg">
                      {product.tagline}
                    </p>
                  )}

                  {/* Launch Date */}
                  {product.releaseAt && formatLaunchDate(product.releaseAt) && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mt-1">
                      {formatLaunchDate(product.releaseAt)}
                    </p>
                  )}

                  {/* Tags */}
                  {product.tags && product.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {product.tags.map((tagItem) => (
                        <Badge key={tagItem.tag.id} variant="secondary" className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full px-3 py-1">
                          {tagItem.tag.name}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Upvote Button - Above Platforms */}
              <div className="flex justify-center">
                <UpvoteButton
                  initialVotes={productVotes}
                  isUpvoted={isProductUpvoted}
                  onVoteChange={handleProductVote}
                  size="lg"
                  variant="outline"
                  showText={true}
                />
              </div>

              {/* Platform Icons */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Platforms:
                </span>
                <PlatformIcons 
                  platforms={product.platforms || []} 
                  size="lg" 
                  showLabels={false}
                />
              </div>


              {/* Promo Code Section */}
              {product.promoCode && (
                <div className="space-y-2">
                  <div 
                    className="flex items-center justify-between cursor-pointer p-2 rounded-lg border border-dashed border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    onClick={() => setIsPromoExpanded(!isPromoExpanded)}
                  >
                    <div className="flex items-center gap-2">
                      <Gift className="w-4 h-4 text-green-500" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Promo Code Available
                      </span>
                    </div>
                    {isPromoExpanded ? (
                      <ChevronUp className="w-4 h-4 text-gray-500" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-500" />
                    )}
                  </div>
                  
                  {isPromoExpanded && (
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Code:
                        </span>
                        <div className="flex items-center gap-2">
                          <code className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm font-mono">
                            {product.promoCode}
                          </code>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleCopyPromoCode}
                            className="h-6 w-6 p-0"
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                      
                      {product.promoOffer && (
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          <span className="font-medium">Offer:</span> {product.promoOffer}
                        </div>
                      )}
                      
                      {product.promoExpiry && (
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          <span className="font-medium">Expiry:</span> {formatPromoExpiry(product.promoExpiry)}
                        </div>
                      )}
                      
                      <Button
                        onClick={handleRedeemPromo}
                        size="sm"
                        className="w-full rounded-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                      >
                        Redeem
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {/* Release Date */}
              {product.releaseAt && (
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(product.releaseAt)}</span>
                  <Badge variant="outline" className="ml-2 rounded-full px-3 py-1">
                    {getTimeUntilRelease(product.releaseAt)}
                  </Badge>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button 
                  onClick={handlePlayNow}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 rounded-full shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105"
                >
                  <Play className="w-5 h-5 mr-2" />
                  Play Now
                </Button>

                {/* App Store Links */}
                {(product.iosUrl || product.androidUrl) && (
                  <div className="flex flex-wrap gap-2">
                    {product.iosUrl && (
                      <Button asChild variant="outline" size="sm" className="flex-1 rounded-full border-2 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950 hover:shadow-lg transition-all duration-300 hover:scale-105">
                        <a 
                          href={product.iosUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          onClick={async () => {
                            try {
                              await fetch('/api/metrics/click', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ 
                                  gameId: product.id, 
                                  type: 'IOS',
                                  referrer: window.location.href
                                })
                              });
                            } catch (error) {
                              console.error('Error tracking iOS click:', error);
                            }
                          }}
                        >
                          <div className="w-4 h-4 mr-1 flex items-center justify-center">
                            <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                            </svg>
                          </div>
                          App Store
                        </a>
                      </Button>
                    )}
                    {product.androidUrl && (
                      <Button asChild variant="outline" size="sm" className="flex-1 rounded-full border-2 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950 hover:shadow-lg transition-all duration-300 hover:scale-105">
                        <a 
                          href={product.androidUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          onClick={async () => {
                            try {
                              await fetch('/api/metrics/click', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ 
                                  gameId: product.id, 
                                  type: 'ANDROID',
                                  referrer: window.location.href
                                })
                              });
                            } catch (error) {
                              console.error('Error tracking Android click:', error);
                            }
                          }}
                        >
                          <div className="w-4 h-4 mr-1 flex items-center justify-center">
                            <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                              <path d="M17.523 15.3414c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.5511 0 .9993.4482.9993.9993.0001.5511-.4482.9997-.9993.9997m-11.046 0c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.5511 0 .9993.4482.9993.9993 0 .5511-.4482.9997-.9993.9997m11.4045-6.02l1.9973-3.4592a.416.416 0 00-.1521-.5976.416.416 0 00-.5976.1521l-2.0223 3.504C15.5902 9.2437 13.8533 9.0681 12 9.0681s-3.5902.1756-5.2057.3037L4.772 5.8676a.416.416 0 00-.5976-.1521.416.416 0 00-.1521.5976L5.8188 9.3214C2.6104 10.5037 0 13.5466 0 17.0851v.8308c0 .2876.2339.5215.5215.5215h22.957c.2876 0 .5215-.2339.5215-.5215v-.8308c0-3.5385-2.6104-6.5814-5.8188-7.7637"/>
                            </svg>
                          </div>
                          Google Play
                        </a>
                      </Button>
                    )}
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    onClick={handleFollow}
                    variant={isFollowing ? "default" : "outline"}
                    className="flex-1 rounded-full border-2 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105"
                  >
                    <Heart className={`w-4 h-4 mr-2 ${isFollowing ? 'fill-current' : ''}`} />
                    {isFollowing ? 'Following' : 'Follow'}
                  </Button>

                  <Button
                    onClick={handleNotify}
                    variant={isNotifying ? "default" : "outline"}
                    className="flex-1 rounded-full border-2 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105"
                  >
                    <Bell className={`w-4 h-4 mr-2 ${isNotifying ? 'fill-current' : ''}`} />
                    Notify
                  </Button>
                </div>

                <ShareModal 
                  product={product} 
                  currentUrl={currentUrl}
                >
                  <Button
                    variant="outline"
                    className="w-full rounded-full border-2 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                </ShareModal>
              </div>
            </CardContent>
          </Card>

          {/* Meet the Team Card */}
          <MeetTheTeamCard makers={product.makers || []} />

          {/* Stats Card */}
          <Card className="rounded-3xl shadow-soft border-2">
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
              
              {/* Launch Details */}
              {(product.launchType || product.monetization || product.engine) && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Launch Details</h4>
                  <div className="space-y-2">
                    {product.launchType && (
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3 h-3 text-blue-400" />
                        <span className="text-xs text-gray-600 dark:text-gray-400">Type:</span>
                        <Badge variant="outline" className="text-xs rounded-full px-3 py-1">
                          {product.launchType === 'SOFT_LAUNCH' ? 'Soft Launch' : 'Global Launch'}
                        </Badge>
                      </div>
                    )}
                    {product.monetization && (
                      <div className="flex items-center gap-2">
                        <Star className="w-3 h-3 text-yellow-400" />
                        <span className="text-xs text-gray-600 dark:text-gray-400">Model:</span>
                        <Badge variant="outline" className="text-xs rounded-full px-3 py-1">
                          {product.monetization.replace('_', ' ')}
                        </Badge>
                      </div>
                    )}
                    {product.engine && (
                      <div className="flex items-center gap-2">
                        <Play className="w-3 h-3 text-purple-400" />
                        <span className="text-xs text-gray-600 dark:text-gray-400">Engine:</span>
                        <Badge variant="outline" className="text-xs rounded-full px-3 py-1">
                          {product.engine === 'UNREAL' ? 'Unreal Engine' : 
                           product.engine === 'UNITY' ? 'Unity' : 
                           product.engine === 'GODOT' ? 'Godot' : 'Custom'}
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Details Card - Right below Game Stats */}
          <Card className="rounded-3xl shadow-soft border-2">
            <CardHeader>
              <CardTitle className="text-lg font-semibold bg-gradient-to-r from-green-500 to-blue-600 bg-clip-text text-transparent">
                Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Release Date */}
              {product.launchDate && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Release Date:</span>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {new Date(product.launchDate).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </span>
                </div>
              )}

              {/* Studio Name */}
              {product.studioName && (
                <div className="flex items-center gap-2">
                  <Building className="w-4 h-4 text-green-400" />
                  <span className="text-sm font-medium text-green-400 dark:text-green-300">Studio:</span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">{product.studioName}</span>
                </div>
              )}

              {/* Tags */}
              {product.tags && product.tags.length > 0 && (
                <div className="flex items-start gap-2">
                  <Star className="w-4 h-4 text-purple-400 mt-0.5" />
                  <div className="flex-1">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Tags:</span>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {product.tags.slice(0, 5).map((tagItem) => (
                        <Badge key={tagItem.tag.id} variant="secondary" className="text-xs">
                          {tagItem.tag.name}
                        </Badge>
                      ))}
                      {product.tags.length > 5 && (
                        <Badge variant="outline" className="text-xs rounded-full px-3 py-1">
                          +{product.tags.length - 5} more
                        </Badge>
                      )}
              </div>
                  </div>
                </div>
              )}

              {/* Sponsor Badge */}
              {product.sponsorRequest && (
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-purple-400" />
                  <Badge variant="secondary" className="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs">
                    Sponsored
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Connect With Us Card */}
          {product.socialLinks && (
            product.socialLinks.website || 
            product.socialLinks.discord || 
            product.socialLinks.twitter || 
            product.socialLinks.tiktok || 
            product.socialLinks.instagram || 
            product.socialLinks.reddit || 
            product.socialLinks.facebook || 
            product.socialLinks.linkedin || 
            product.socialLinks.youtube
          ) && (
            <Card className="rounded-3xl shadow-soft border-2">
              <CardHeader>
                <CardTitle className="text-lg font-semibold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
                  Connect With Us
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {product.socialLinks.website && (
                    <Button asChild variant="outline" size="sm" className="justify-start hover:bg-blue-500 hover:text-white hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300 h-10 w-full rounded-full border-2 hover:scale-105">
                      <a href={product.socialLinks.website} target="_blank" rel="noopener noreferrer" className="flex items-center w-full">
                        <Globe className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span className="whitespace-nowrap">Website</span>
                      </a>
                    </Button>
                  )}
                  {product.socialLinks.discord && (
                    <Button asChild variant="outline" size="sm" className="justify-start hover:bg-indigo-500 hover:text-white hover:shadow-lg hover:shadow-indigo-500/25 transition-all duration-300 h-10 w-full rounded-full border-2 hover:scale-105">
                      <a href={product.socialLinks.discord} target="_blank" rel="noopener noreferrer" className="flex items-center w-full">
                        <MessageSquare className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span className="whitespace-nowrap">Discord</span>
                      </a>
                    </Button>
                  )}
                  {product.socialLinks.twitter && (
                    <Button asChild variant="outline" size="sm" className="justify-start hover:bg-blue-500 hover:text-white hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300 h-10 w-full rounded-full border-2 hover:scale-105">
                      <a href={product.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="flex items-center w-full">
                        <Twitter className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span className="whitespace-nowrap">Twitter/X</span>
                      </a>
                    </Button>
                  )}
                  {product.socialLinks.tiktok && (
                    <Button asChild variant="outline" size="sm" className="justify-start hover:bg-black hover:text-white hover:shadow-lg hover:shadow-black/25 transition-all duration-300 h-10 w-full rounded-full border-2 hover:scale-105">
                      <a href={product.socialLinks.tiktok} target="_blank" rel="noopener noreferrer" className="flex items-center w-full">
                        <Music className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span className="whitespace-nowrap">TikTok</span>
                      </a>
                    </Button>
                  )}
                  {product.socialLinks.instagram && (
                    <Button asChild variant="outline" size="sm" className="justify-start hover:bg-pink-500 hover:text-white hover:shadow-lg hover:shadow-pink-500/25 transition-all duration-300 h-10 w-full rounded-full border-2 hover:scale-105">
                      <a href={product.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="flex items-center w-full">
                        <Instagram className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span className="whitespace-nowrap">Instagram</span>
                      </a>
                    </Button>
                  )}
                  {product.socialLinks.reddit && (
                    <Button asChild variant="outline" size="sm" className="justify-start hover:bg-orange-500 hover:text-white hover:shadow-lg hover:shadow-orange-500/25 transition-all duration-300 h-10 w-full rounded-full border-2 hover:scale-105">
                      <a href={product.socialLinks.reddit} target="_blank" rel="noopener noreferrer" className="flex items-center w-full">
                        <ExternalLink className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span className="whitespace-nowrap">Reddit</span>
                      </a>
                    </Button>
                  )}
                  {product.socialLinks.facebook && (
                    <Button asChild variant="outline" size="sm" className="justify-start hover:bg-blue-600 hover:text-white hover:shadow-lg hover:shadow-blue-600/25 transition-all duration-300 h-10 w-full rounded-full border-2 hover:scale-105">
                      <a href={product.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="flex items-center w-full">
                        <Facebook className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span className="whitespace-nowrap">Facebook</span>
                      </a>
                    </Button>
                  )}
                  {product.socialLinks.linkedin && (
                    <Button asChild variant="outline" size="sm" className="justify-start hover:bg-blue-700 hover:text-white hover:shadow-lg hover:shadow-blue-700/25 transition-all duration-300 h-10 w-full rounded-full border-2 hover:scale-105">
                      <a href={product.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center w-full">
                        <Linkedin className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span className="whitespace-nowrap">LinkedIn</span>
                      </a>
                    </Button>
                  )}
                  {product.socialLinks.youtube && (
                    <Button asChild variant="outline" size="sm" className="justify-start hover:bg-red-500 hover:text-white hover:shadow-lg hover:shadow-red-500/25 transition-all duration-300 h-10 w-full rounded-full border-2 hover:scale-105">
                      <a href={product.socialLinks.youtube} target="_blank" rel="noopener noreferrer" className="flex items-center w-full">
                        <Youtube className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span className="whitespace-nowrap">YouTube</span>
                      </a>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Supported Languages Card */}
          {product.languages && product.languages.length > 0 && (
            <Card className="rounded-3xl shadow-soft border-2">
        <CardHeader>
                <CardTitle className="text-xl font-semibold">Supported Languages</CardTitle>
        </CardHeader>
        <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="text-left py-2 font-medium text-gray-700 dark:text-gray-300">Language</th>
                        <th className="text-center py-2 font-medium text-gray-700 dark:text-gray-300">Interface</th>
                        <th className="text-center py-2 font-medium text-gray-700 dark:text-gray-300">Audio</th>
                        <th className="text-center py-2 font-medium text-gray-700 dark:text-gray-300">Subtitles</th>
                      </tr>
                    </thead>
                    <tbody>
                      {product.languages.map((lang, index) => (
                        <tr key={index} className="border-b border-gray-100 dark:border-gray-800">
                          <td className="py-2 text-gray-600 dark:text-gray-400">
                            <div className="flex items-center gap-2">
                              <span className="text-lg">
                                {LANGUAGES.find(l => l.name === lang.name)?.flag || '🌐'}
                              </span>
                              <span>{lang.name}</span>
                            </div>
                          </td>
                          <td className="text-center py-2">
                            {lang.interface ? (
                              <span className="text-green-500 text-lg">✔</span>
                            ) : (
                              <span className="text-gray-400">—</span>
                            )}
                          </td>
                          <td className="text-center py-2">
                            {lang.audio ? (
                              <span className="text-green-500 text-lg">✔</span>
                            ) : (
                              <span className="text-gray-400">—</span>
                            )}
                          </td>
                          <td className="text-center py-2">
                            {lang.subtitles ? (
                              <span className="text-green-500 text-lg">✔</span>
                            ) : (
                              <span className="text-gray-400">—</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
        </CardContent>
      </Card>
          )}


          {/* Playtest Keys Card */}
          {product.playtestQuota && product.playtestQuota > 0 && (
            <Card className="rounded-3xl shadow-soft border-2">
              <CardHeader>
                <CardTitle className="text-xl font-semibold">Playtest Access</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Help test this game and provide feedback to the developers.
                </div>
                {product.playtestQuota && (
                  <div className="text-sm text-muted-foreground">
                    {product.playtestQuota} keys available
                  </div>
                )}
                <Button
                  onClick={() => {
                    // This would trigger the playtest claim flow
                    toast.info('Playtest claim functionality coming soon!');
                  }}
                  className="w-full rounded-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Request Playtest Key
                </Button>
                {product.playtestExpiry && (
                  <div className="text-xs text-muted-foreground">
                    Available until {formatDate(product.playtestExpiry)}
                  </div>
                )}
              </CardContent>
            </Card>
          )}


          {/* Gamification Tags Card */}
          {product.gamificationTags && product.gamificationTags.length > 0 && (
            <Card className="rounded-3xl shadow-soft border-2">
              <CardHeader>
                <CardTitle className="text-xl font-semibold">Game Features</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {product.gamificationTags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}



          {/* Recommended Card - Right below Playtest Keys */}
          {recommended.length > 0 && (
            <Card className="rounded-3xl shadow-soft border-2">
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

          {/* Playtest Claim Card */}
          <PlaytestClaim gameId={product.id} gameTitle={product.title} />
        </div>
      </div>
    </div>
  );
}
