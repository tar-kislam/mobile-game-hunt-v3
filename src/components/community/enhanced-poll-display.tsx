'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'

interface PollOption {
  id: string
  text: string
  votesCount: number
  percentage: number
}

interface PollData {
  id: string
  question: string
  expiresAt: string
  isExpired: boolean
}

interface PollDisplayProps {
  postId: string
  poll: PollData
  options: PollOption[]
  userVote?: string | null
  hasVoted?: boolean
  totalVotes?: number
}

export function PollDisplay({ postId, poll, options, userVote, hasVoted, totalVotes = 0 }: PollDisplayProps) {
  const { data: session } = useSession()
  const [localOptions, setLocalOptions] = useState(options)
  const [localHasVoted, setLocalHasVoted] = useState(hasVoted || false)
  const [localUserVote, setLocalUserVote] = useState(userVote)
  const [localTotalVotes, setLocalTotalVotes] = useState(totalVotes)
  const [isVoting, setIsVoting] = useState(false)

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
        body: JSON.stringify({
          optionId
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setLocalOptions(data.results)
        setLocalHasVoted(true)
        setLocalUserVote(optionId)
        setLocalTotalVotes(data.totalVotes)
        toast.success('Vote recorded ✅')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to vote')
      }
    } catch (error) {
      console.error('Error voting:', error)
      toast.error('Failed to vote. Please try again.')
    } finally {
      setIsVoting(false)
    }
  }

  const formatExpiration = (expiresAt: string) => {
    const now = new Date()
    const expiration = new Date(expiresAt)
    const diffMs = expiration.getTime() - now.getTime()
    
    if (diffMs <= 0) return 'Expired'
    
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
    const diffHours = Math.ceil(diffMs / (1000 * 60 * 60))
    const diffMinutes = Math.ceil(diffMs / (1000 * 60))
    
    if (diffDays > 1) return `${diffDays} days left`
    if (diffHours > 1) return `${diffHours} hours left`
    return `${diffMinutes} minutes left`
  }

  const showResults = localHasVoted || poll.isExpired

  return (
    <Card className="mt-4 bg-gray-800/50 border-purple-500/30 shadow-lg shadow-purple-500/10">
      <CardContent className="p-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-gray-200">{poll.question}</h3>
            <span className="text-xs text-gray-400">
              {formatExpiration(poll.expiresAt)}
            </span>
          </div>
          
          <div className="space-y-3">
            {localOptions.map((option) => {
              const isSelected = localUserVote === option.id
              
              return (
                <div key={option.id} className="space-y-2">
                  <Button
                    onClick={() => handleVote(option.id)}
                    disabled={!session || localHasVoted || poll.isExpired || isVoting}
                    className={`w-full justify-start p-3 h-auto text-left transition-all duration-200 ${
                      isSelected && showResults
                        ? 'bg-purple-500/20 border-purple-500/50 text-purple-300'
                        : 'bg-gray-700/50 border-gray-600 text-gray-300 hover:bg-purple-500/10 hover:border-purple-500/50'
                    }`}
                    variant="outline"
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-sm">{option.text}</span>
                      {showResults && (
                        <span className="text-xs text-gray-400 ml-2">
                          {option.percentage}% ({option.votesCount})
                        </span>
                      )}
                    </div>
                  </Button>
                  
                  {showResults && (
                    <div className="relative">
                      <Progress 
                        value={option.percentage} 
                        className="h-2 bg-gray-700"
                      />
                      <div 
                        className="absolute top-0 left-0 h-2 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full transition-all duration-500"
                        style={{ width: `${option.percentage}%` }}
                      />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
          
          {showResults && (
            <div className="text-xs text-gray-400 text-center pt-2 border-t border-gray-700">
              {localTotalVotes} total vote{localTotalVotes !== 1 ? 's' : ''}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
