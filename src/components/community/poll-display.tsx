'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Clock, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'
import { useSession } from 'next-auth/react'

interface PollOption {
  id: string
  text: string
  votesCount: number
  percentage: number
}

interface Poll {
  id: string
  question: string
  expiresAt: string
  isExpired: boolean
}

interface PollDisplayProps {
  postId: string
  poll: Poll
  options: PollOption[]
  userVote?: string | null
  hasVoted?: boolean
  totalVotes: number
}

export function PollDisplay({ postId, poll, options, userVote, hasVoted, totalVotes }: PollDisplayProps) {
  const { data: session } = useSession()
  const [localOptions, setLocalOptions] = useState(options)
  const [localHasVoted, setLocalHasVoted] = useState(hasVoted)
  const [localUserVote, setLocalUserVote] = useState(userVote)
  const [isVoting, setIsVoting] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)

  // Fetch poll data and user vote status on mount
  useEffect(() => {
    const fetchPollData = async () => {
      try {
        const response = await fetch(`/api/community/poll/vote?postId=${postId}`)
        if (response.ok) {
          const data = await response.json()
          setLocalOptions(data.options)
          setLocalHasVoted(data.hasVoted)
          setLocalUserVote(data.userVote)
        }
      } catch (error) {
        console.error('Error fetching poll data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPollData()
  }, [postId])

  // Calculate time remaining
  useEffect(() => {
    const updateTimeRemaining = () => {
      const now = new Date()
      const expiresAt = new Date(poll.expiresAt)
      const diffMs = expiresAt.getTime() - now.getTime()

      if (diffMs <= 0) {
        setTimeRemaining('Expired')
        return
      }

      const days = Math.floor(diffMs / (1000 * 60 * 60 * 24))
      const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))

      if (days > 0) {
        setTimeRemaining(`${days}d ${hours}h`)
      } else if (hours > 0) {
        setTimeRemaining(`${hours}h ${minutes}m`)
      } else {
        setTimeRemaining(`${minutes}m`)
      }
    }

    updateTimeRemaining()
    const interval = setInterval(updateTimeRemaining, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [poll.expiresAt])

  const handleVote = async (optionId: string) => {
    if (!session) {
      toast.error('Please sign in to vote')
      return
    }

    if (localHasVoted || poll.isExpired) {
      return
    }

    setIsVoting(true)

    try {
      const response = await fetch('/api/community/poll/vote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ optionId }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to vote')
      }

      const data = await response.json()
      
      // Update local state with new results
      setLocalOptions(data.results)
      setLocalHasVoted(true)
      setLocalUserVote(optionId)
      
      toast.success('Vote recorded!')
    } catch (error) {
      console.error('Error voting:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to vote')
    } finally {
      setIsVoting(false)
    }
  }

  const isExpired = poll.isExpired || timeRemaining === 'Expired'

  if (isLoading) {
    return (
      <div className="mt-4 p-4 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-lg border border-purple-500/20">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-600 rounded w-3/4"></div>
          <div className="space-y-2">
            <div className="h-10 bg-gray-600 rounded"></div>
            <div className="h-10 bg-gray-600 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mt-4 p-4 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-lg border border-purple-500/20">
      {/* Poll Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-200">{poll.question}</h3>
        <Badge 
          variant="outline" 
          className={`text-xs ${
            isExpired 
              ? 'border-red-500/50 text-red-400' 
              : 'border-purple-500/50 text-purple-400'
          }`}
        >
          <Clock className="h-3 w-3 mr-1" />
          {isExpired ? 'Expired' : `Ends in ${timeRemaining}`}
        </Badge>
      </div>

      {/* Poll Options */}
      <div className="space-y-3">
        {localOptions.map((option) => {
          const isSelected = localUserVote === option.id
          const isDisabled = localHasVoted || isExpired || isVoting
          
          return (
            <div key={option.id} className="space-y-2">
              <Button
                variant={isSelected ? "default" : "outline"}
                className={`w-full justify-between h-auto p-3 ${
                  isSelected
                    ? 'bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600'
                    : 'border-gray-600 hover:border-purple-500 hover:bg-purple-500/10'
                } ${isDisabled ? 'opacity-60 cursor-not-allowed' : ''}`}
                onClick={() => handleVote(option.id)}
                disabled={isDisabled}
              >
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">{option.text}</span>
                  {isSelected && <CheckCircle className="h-4 w-4" />}
                </div>
                <div className="text-xs opacity-75">
                  {option.votesCount} vote{option.votesCount !== 1 ? 's' : ''}
                </div>
              </Button>
              
              {/* Progress Bar - Show after voting or if expired */}
              {(localHasVoted || isExpired) && (
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>{option.percentage}%</span>
                    <span>{option.votesCount} votes</span>
                  </div>
                  <Progress 
                    value={option.percentage} 
                    className="h-2 bg-gray-700"
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Total Votes */}
      {(localHasVoted || isExpired) && (
        <div className="mt-4 pt-3 border-t border-gray-600">
          <p className="text-sm text-gray-400 text-center">
            {totalVotes} total vote{totalVotes !== 1 ? 's' : ''}
          </p>
        </div>
      )}
    </div>
  )
}