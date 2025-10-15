'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  ArrowUpIcon, 
  MessageCircle, 
  Flag, 
  Share2,
  MoreHorizontal
} from 'lucide-react';
import { toast } from 'sonner';
import { UpvoteButton } from './upvote-button';

interface CommentActionsProps {
  commentId: string;
  initialVotes: number;
  isUpvoted: boolean;
  onVoteChange?: (newVoteCount: number, isUpvoted: boolean) => void;
  onReply?: () => void;
  onReport?: () => void;
  onShare?: () => void;
  timestamp: string;
  className?: string;
  isAuthenticated?: boolean;
}

export function CommentActions({
  commentId,
  initialVotes,
  isUpvoted,
  onVoteChange,
  onReply,
  onReport,
  onShare,
  timestamp,
  className = '',
  isAuthenticated = false
}: CommentActionsProps) {
  const [showMore, setShowMore] = useState(false);

  const handleReply = () => {
    if (onReply) {
      onReply();
    } else {
      toast.info('Reply functionality coming soon!');
    }
  };

  const handleReport = () => {
    if (onReport) {
      onReport();
    } else {
      toast.info('Report functionality coming soon!');
    }
  };

  const handleShare = () => {
    if (onShare) {
      onShare();
    } else {
      // Share the comment URL
      const commentUrl = `${window.location.href}#comment-${commentId}`;
      navigator.clipboard.writeText(commentUrl);
      toast.success('Comment link copied to clipboard!');
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const now = new Date();
    const commentDate = new Date(timestamp);
    const diffInHours = Math.floor((now.getTime() - commentDate.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now.getTime() - commentDate.getTime()) / (1000 * 60));
      return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;
    }
  };

  return (
    <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 ${className}`}>
      <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
        {/* Upvote */}
        <div
          onClickCapture={(e) => {
            if (!isAuthenticated) {
              e.preventDefault();
              e.stopPropagation();
              toast.warning('Please sign in to upvote comments');
              if (typeof window !== 'undefined') {
                const returnTo = encodeURIComponent(window.location.pathname + window.location.search);
                setTimeout(() => {
                  window.location.assign(`/auth/signin?callbackUrl=${returnTo}`);
                }, 3000);
              }
            }
          }}
        >
          <UpvoteButton
            initialVotes={initialVotes}
            isUpvoted={isUpvoted}
            onVoteChange={(newVotes, up) => {
              // Only propagate when authenticated; otherwise click was captured above
              if (isAuthenticated) {
                onVoteChange && onVoteChange(newVotes, up);
              }
            }}
            size="sm"
            variant="ghost"
          />
        </div>

        {/* Reply */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleReply}
          className="h-7 sm:h-8 px-1 sm:px-2 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
        >
          <MessageCircle className="w-3 h-3 mr-1" />
          <span className="hidden sm:inline">Reply</span>
        </Button>

        {/* Share */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleShare}
          className="h-7 sm:h-8 px-1 sm:px-2 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
        >
          <Share2 className="w-3 h-3 mr-1" />
          <span className="hidden sm:inline">Share</span>
        </Button>

        {/* Timestamp */}
        <span className="text-xs text-gray-500 dark:text-gray-500">
          {formatTimestamp(timestamp)}
        </span>
      </div>

      {/* More Actions */}
      <div className="relative self-end sm:self-auto">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowMore(!showMore)}
          className="h-7 sm:h-8 w-7 sm:w-8 p-0 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
        >
          <MoreHorizontal className="w-3 h-3" />
        </Button>

        {showMore && (
          <div className="absolute right-0 top-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10 min-w-[120px]">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReport}
              className="w-full justify-start h-8 px-3 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <Flag className="w-3 h-3 mr-2" />
              Report
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
