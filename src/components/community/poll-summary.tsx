'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Edit, X } from 'lucide-react'

interface DraftPoll {
  options: string[]
  duration: { days: number; hours: number; minutes: number }
}

interface PollSummaryProps {
  draftPoll: DraftPoll
  onEdit: () => void
  onRemove: () => void
}

export function PollSummary({ draftPoll, onEdit, onRemove }: PollSummaryProps) {
  const formatDuration = (duration: { days: number; hours: number; minutes: number }) => {
    const parts = []
    if (duration.days > 0) parts.push(`${duration.days}d`)
    if (duration.hours > 0) parts.push(`${duration.hours}h`)
    if (duration.minutes > 0) parts.push(`${duration.minutes}m`)
    
    if (parts.length === 0) return '0m'
    return parts.join(' ')
  }

  return (
    <Card className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-purple-500/30">
      <CardContent className="p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"></div>
            <div>
              <span className="text-sm font-medium text-gray-200">
                Poll: {draftPoll.options.length} options
              </span>
              <span className="text-xs text-gray-400 ml-2">
                • ends in {formatDuration(draftPoll.duration)}
              </span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onEdit}
              className="p-1 h-8 w-8 text-gray-400 hover:text-purple-400 hover:bg-purple-500/10"
            >
              <Edit className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onRemove}
              className="p-1 h-8 w-8 text-gray-400 hover:text-red-400 hover:bg-red-500/10"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
