"use client"

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { EditIcon, CheckCircleIcon, ClockIcon, DollarSignIcon } from 'lucide-react'
import { motion } from 'framer-motion'

interface CampaignSummaryCardProps {
  campaign: {
    id: string
    goal: string
    budget: number
    status: string
    startDate: string
    endDate: string
    createdAt: string
    audience?: {
      countries: string[]
      ageRange: string[]
      interests: string[]
    }
    media?: {
      files: string[]
      thumbnail?: string
    }
  }
  onEdit?: () => void
  onView?: () => void
  showActions?: boolean
}

export default function CampaignSummaryCard({ 
  campaign, 
  onEdit, 
  onView, 
  showActions = true 
}: CampaignSummaryCardProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return <CheckCircleIcon className="h-4 w-4 text-green-400" />
      case 'pending':
      case 'submitted':
        return <ClockIcon className="h-4 w-4 text-yellow-400" />
      default:
        return <ClockIcon className="h-4 w-4 text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-600 hover:bg-green-700'
      case 'pending':
      case 'submitted':
        return 'bg-yellow-600 hover:bg-yellow-700'
      case 'rejected':
        return 'bg-red-600 hover:bg-red-700'
      default:
        return 'bg-gray-600 hover:bg-gray-700'
    }
  }

  const getGoalIcon = (goal: string) => {
    switch (goal.toLowerCase()) {
      case 'brand-awareness':
        return '🎯'
      case 'game-launch':
        return '🚀'
      case 'community-growth':
        return '👥'
      default:
        return '📢'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="bg-gray-800/50 border-gray-700 hover:border-purple-500/50 transition-all duration-200">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{getGoalIcon(campaign.goal)}</span>
              <div>
                <CardTitle className="text-lg text-white capitalize">
                  {campaign.goal.replace('-', ' ')}
                </CardTitle>
                <p className="text-sm text-gray-400">
                  Created {new Date(campaign.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            <Badge className={`${getStatusColor(campaign.status)} text-white`}>
              <div className="flex items-center gap-1">
                {getStatusIcon(campaign.status)}
                {campaign.status}
              </div>
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Budget & Duration */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSignIcon className="h-4 w-4 text-green-400" />
              <span className="text-white font-medium">{formatCurrency(campaign.budget)}</span>
            </div>
            <div className="text-sm text-gray-400">
              {new Date(campaign.startDate).toLocaleDateString()} - {new Date(campaign.endDate).toLocaleDateString()}
            </div>
          </div>

          {/* Audience Summary */}
          {campaign.audience && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-300">Target Audience</h4>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="text-xs">
                  {campaign.audience.countries.length} countries
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  {campaign.audience.ageRange.length} age groups
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  {campaign.audience.interests.length} interests
                </Badge>
              </div>
            </div>
          )}

          {/* Media Summary */}
          {campaign.media && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-300">Media Assets</h4>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  {campaign.media.files.length} files
                </Badge>
                {campaign.media.thumbnail && (
                  <Badge variant="secondary" className="text-xs">
                    Thumbnail selected
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          {showActions && (
            <div className="flex gap-2 pt-2">
              {onEdit && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onEdit}
                  className="flex-1 border-gray-600 text-gray-300 hover:text-white hover:border-purple-500"
                >
                  <EditIcon className="h-4 w-4 mr-1" />
                  Edit
                </Button>
              )}
              {onView && (
                <Button
                  size="sm"
                  onClick={onView}
                  className="flex-1 bg-purple-600 hover:bg-purple-700"
                >
                  View Details
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
