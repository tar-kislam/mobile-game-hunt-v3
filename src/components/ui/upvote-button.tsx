'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowUpIcon } from 'lucide-react';
import { toast } from 'sonner';

interface UpvoteButtonProps {
  initialVotes: number;
  isUpvoted: boolean;
  onVoteChange?: (newVoteCount: number, isUpvoted: boolean) => void;
  size?: 'sm' | 'default' | 'lg';
  variant?: 'default' | 'outline' | 'ghost';
  className?: string;
}

export function UpvoteButton({ 
  initialVotes, 
  isUpvoted: initialIsUpvoted, 
  onVoteChange,
  size = 'default',
  variant = 'outline',
  className = ''
}: UpvoteButtonProps) {
  const [votes, setVotes] = useState(initialVotes);
  const [isUpvoted, setIsUpvoted] = useState(initialIsUpvoted);
  const [isLoading, setIsLoading] = useState(false);

  const handleUpvote = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const newIsUpvoted = !isUpvoted;
      const newVoteCount = newIsUpvoted ? votes + 1 : votes - 1;
      
      setVotes(newVoteCount);
      setIsUpvoted(newIsUpvoted);
      
      if (onVoteChange) {
        onVoteChange(newVoteCount, newIsUpvoted);
      }
      
      toast.success(newIsUpvoted ? 'Upvoted!' : 'Removed upvote');
    } catch (error) {
      toast.error('Failed to update vote');
    } finally {
      setIsLoading(false);
    }
  };

  const sizeClasses = {
    sm: 'h-8 w-8 p-0',
    default: 'h-10 w-10 p-0',
    lg: 'h-12 w-12 p-0'
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    default: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Button
        onClick={handleUpvote}
        variant={variant}
        size={size}
        className={`${sizeClasses[size]} transition-all duration-200 ${
          isUpvoted 
            ? 'bg-green-500 hover:bg-green-600 text-white border-green-500' 
            : 'hover:bg-green-50 hover:border-green-200'
        }`}
        disabled={isLoading}
      >
        <ArrowUpIcon className={`${iconSizes[size]} transition-transform duration-200 ${
          isUpvoted ? 'transform scale-110' : ''
        }`} />
      </Button>
      <div className="flex flex-col">
        <span className={`font-medium ${
          size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-lg' : 'text-base'
        } ${isUpvoted ? 'text-green-600' : 'text-gray-600 dark:text-gray-400'}`}>
          {votes}
        </span>
        <span className={`text-xs ${
          isUpvoted ? 'text-green-600 font-medium' : 'text-gray-500 dark:text-gray-500'
        }`}>
          {isUpvoted ? 'Upvoted' : 'Upvote'}
        </span>
      </div>
    </div>
  );
}
