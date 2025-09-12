'use client';

import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CommentActions } from './comment-actions';
import { UserAvatarTooltip } from './user-avatar-tooltip';

interface CommentProps {
  comment: {
    id: string;
    content: string;
    createdAt: string;
    user: {
      id: string;
      name: string | null;
      image?: string | null;
    };
    _count: {
      votes: number;
    };
    parentId?: string | null;
    replies?: CommentProps['comment'][];
  };
  onVoteChange?: (commentId: string, newVoteCount: number, isUpvoted: boolean) => void;
  onReply?: (commentId: string) => void;
  onReport?: (commentId: string) => void;
  onShare?: (commentId: string) => void;
  className?: string;
  isReply?: boolean;
}

export function Comment({
  comment,
  onVoteChange,
  onReply,
  onReport,
  onShare,
  className = '',
  isReply = false
}: CommentProps) {
  const [isUpvoted, setIsUpvoted] = useState(false);
  const [voteCount, setVoteCount] = useState(comment._count.votes);

  const handleVoteChange = (newVoteCount: number, newIsUpvoted: boolean) => {
    setVoteCount(newVoteCount);
    setIsUpvoted(newIsUpvoted);
    
    if (onVoteChange) {
      onVoteChange(comment.id, newVoteCount, newIsUpvoted);
    }
  };

  const handleReply = () => {
    if (onReply) {
      onReply(comment.id);
    }
  };

  const handleReport = () => {
    if (onReport) {
      onReport(comment.id);
    }
  };

  const handleShare = () => {
    if (onShare) {
      onShare(comment.id);
    }
  };

  return (
    <div className={`${isReply ? 'ml-2 sm:ml-8 border-l-2 border-gray-200 dark:border-gray-700 pl-2 sm:pl-4' : ''} ${className}`}>
      <div className={`flex gap-2 sm:gap-3 p-3 sm:p-4 rounded-xl bg-muted/30 ${isReply ? 'mt-2' : ''}`}>
        <UserAvatarTooltip 
          userId={comment.user.id}
          userName={comment.user.name}
          userImage={comment.user.image}
          size="sm"
        />
        
        <div className="flex-1 min-w-0 overflow-hidden">
          <div className="flex items-center gap-2 mb-1 sm:mb-2">
            <span className="text-xs sm:text-sm font-medium truncate">
              {comment.user.name || 'Anonymous'}
            </span>
          </div>
          
          <p className="text-xs sm:text-sm text-muted-foreground whitespace-pre-wrap mb-2 sm:mb-3 break-words">
            {comment.content}
          </p>
          
          <CommentActions
            commentId={comment.id}
            initialVotes={voteCount}
            isUpvoted={isUpvoted}
            onVoteChange={handleVoteChange}
            onReply={handleReply}
            onReport={handleReport}
            onShare={handleShare}
            timestamp={comment.createdAt}
          />
        </div>
      </div>
      
      {/* Render nested replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-2 space-y-2">
          {comment.replies.map((reply) => (
            <Comment
              key={reply.id}
              comment={reply}
              onVoteChange={onVoteChange}
              onReply={onReply}
              onReport={onReport}
              onShare={onShare}
              isReply={true}
            />
          ))}
        </div>
      )}
    </div>
  );
}
