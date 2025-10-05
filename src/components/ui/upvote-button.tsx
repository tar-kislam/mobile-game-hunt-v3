'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { FaAngleUp, FaAngleDoubleUp } from 'react-icons/fa';
import { toast } from 'sonner';

interface UpvoteButtonProps {
  initialVotes: number;
  isUpvoted: boolean;
  onVoteChange?: (newVoteCount: number, isUpvoted: boolean) => void;
  size?: 'sm' | 'default' | 'lg';
  variant?: 'default' | 'outline' | 'ghost';
  className?: string;
  showText?: boolean;
}

export function UpvoteButton({ 
  initialVotes, 
  isUpvoted: initialIsUpvoted, 
  onVoteChange,
  size = 'default',
  variant = 'outline',
  className = '',
  showText = false
}: UpvoteButtonProps) {
  const [votes, setVotes] = useState(initialVotes);
  const [isUpvoted, setIsUpvoted] = useState(initialIsUpvoted);
  const [isLoading, setIsLoading] = useState(false);

  // Sync with parent props when they change (for error revert)
  useEffect(() => {
    setVotes(initialVotes);
    setIsUpvoted(initialIsUpvoted);
  }, [initialVotes, initialIsUpvoted]);

  const handleUpvote = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    
    try {
      const newIsUpvoted = !isUpvoted;
      const newVoteCount = newIsUpvoted ? votes + 1 : votes - 1;
      
      // Optimistic update
      setVotes(newVoteCount);
      setIsUpvoted(newIsUpvoted);
      
      // Call parent callback
      if (onVoteChange) {
        await onVoteChange(newVoteCount, newIsUpvoted);
      }
      
      // Don't show toast here - parent component will handle it
    } catch (error) {
      toast.error('Failed to update vote');
      // Revert on error
      setVotes(initialVotes);
      setIsUpvoted(initialIsUpvoted);
    } finally {
      setIsLoading(false);
    }
  };

  const sizeClasses = {
    sm: showText ? 'h-10 px-4 w-full rounded-full' : 'h-8 w-8 p-0 rounded-full',
    default: showText ? 'h-12 px-5 w-full rounded-full' : 'h-10 w-10 p-0 rounded-full',
    lg: showText ? 'h-14 px-6 w-full rounded-full' : 'h-12 w-12 p-0 rounded-full'
  };

  const iconPx = {
    sm: 14,
    default: 16,
    lg: 20
  } as const;

  if (showText) {
    return (
      <Button
        onClick={handleUpvote}
        variant={variant}
        size={size}
        className={`${sizeClasses[size]} relative group transition-all duration-300 transform hover:scale-105 ${
          isUpvoted 
            ? 'bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 hover:from-cyan-400 hover:via-purple-400 hover:to-pink-400 text-white border-0 shadow-lg shadow-cyan-500/25' 
            : 'bg-gray-800/50 hover:bg-gray-700/70 border border-gray-600 hover:border-cyan-400 text-gray-300 hover:text-white backdrop-blur-sm'
        } ${className}`}
        disabled={isLoading}
      >
        {/* Glow effect */}
        <div className={`absolute inset-0 rounded-full transition-opacity duration-300 ${
          isUpvoted 
            ? 'bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-pink-500/20 blur-sm opacity-100' 
            : 'bg-cyan-400/10 blur-sm opacity-0 group-hover:opacity-100'
        }`} />
        
        {/* Content */}
        <div className="relative flex items-center justify-center gap-2 w-full">
          <span className={`transition-all duration-300 ${isUpvoted ? 'scale-110 text-white' : 'group-hover:text-cyan-400'}`}>
            {isUpvoted ? <FaAngleDoubleUp size={iconPx[size]} /> : <FaAngleUp size={iconPx[size]} />}
          </span>
          <span className={`font-medium uppercase tracking-wide ${
            size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-sm' : 'text-sm'
          } ${isUpvoted 
            ? 'text-white/90 drop-shadow-sm' 
            : 'text-gray-300 group-hover:text-cyan-400'
          }`}>
            {isUpvoted ? 'Upvoted' : 'Upvote'}
          </span>
          <span className={`font-bold ${
            size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-lg' : 'text-base'
          } ${isUpvoted ? 'drop-shadow-lg' : 'group-hover:text-cyan-400'}`}>
            {votes} {votes === 1 ? 'Point' : 'Points'}
          </span>
        </div>

        {/* Animated particles effect when upvoted */}
        {isUpvoted && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1 left-1/4 w-1 h-1 bg-white rounded-full animate-ping" style={{ animationDelay: '0s' }} />
            <div className="absolute top-2 right-1/4 w-1 h-1 bg-cyan-300 rounded-full animate-ping" style={{ animationDelay: '0.2s' }} />
            <div className="absolute bottom-2 left-1/3 w-1 h-1 bg-purple-300 rounded-full animate-ping" style={{ animationDelay: '0.4s' }} />
          </div>
        )}
      </Button>
    );
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <Button
        onClick={handleUpvote}
        variant={variant}
        size={size}
        className={`${sizeClasses[size]} relative group transition-all duration-300 transform hover:scale-110 ${
          isUpvoted 
            ? 'bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 hover:from-cyan-400 hover:via-purple-400 hover:to-pink-400 text-white border-0 shadow-lg shadow-cyan-500/25' 
            : 'bg-gray-800/50 hover:bg-gray-700/70 border border-gray-600 hover:border-cyan-400 text-gray-300 hover:text-white backdrop-blur-sm'
        }`}
        disabled={isLoading}
      >
        {/* Glow effect */}
        <div className={`absolute inset-0 rounded-full transition-opacity duration-300 ${
          isUpvoted 
            ? 'bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-pink-500/20 blur-sm opacity-100' 
            : 'bg-cyan-400/10 blur-sm opacity-0 group-hover:opacity-100'
        }`} />
        
        <span className={`relative z-10 transition-all duration-300 ${isUpvoted ? 'scale-110 text-white' : 'group-hover:text-cyan-400'}`}>
          {isUpvoted ? <FaAngleDoubleUp size={iconPx[size]} /> : <FaAngleUp size={iconPx[size]} />}
        </span>

        {/* Animated particles effect when upvoted */}
        {isUpvoted && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/2 w-1 h-1 bg-white rounded-full animate-ping" style={{ animationDelay: '0s' }} />
            <div className="absolute top-1 right-1 w-0.5 h-0.5 bg-cyan-300 rounded-full animate-ping" style={{ animationDelay: '0.3s' }} />
          </div>
        )}
      </Button>
      
      <div className="flex flex-col">
        <span className={`font-bold transition-colors duration-300 ${
          size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-xl' : 'text-lg'
        } ${isUpvoted 
          ? 'text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 drop-shadow-sm' 
          : 'text-gray-300 dark:text-gray-400'
        }`}>
          {votes}
        </span>
        <span className={`text-xs font-medium uppercase tracking-wider transition-colors duration-300 ${
          isUpvoted 
            ? 'text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400' 
            : 'text-gray-500 dark:text-gray-500'
        }`}>
          {isUpvoted ? 'Upvoted' : 'Upvote'}
        </span>
      </div>
    </div>
  );
}
