"use client"

import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckIcon, Loader2, EditIcon, DollarSignIcon, GamepadIcon, TargetIcon } from 'lucide-react'
import Image from 'next/image'

interface StepReviewProps {
  data: {
    goal: string
    placements: string[]
    packageType: string
    budget: number
    gameId: string
    gameName?: string
  }
  onSubmit: () => void
  isSubmitting: boolean
  onEdit: (step: number) => void
}

const goals = [
  { id: 'brand-awareness', label: 'Brand Awareness', icon: '/emojis/target-emoji.webp' },
  { id: 'game-launch', label: 'Game Launch', icon: '/emojis/rocket-emoji.webp' },
  { id: 'community-growth', label: 'Community Growth', icon: '/emojis/community-emoji.webp' }
]

const packages = [
  {
    id: 'daily',
    label: 'Daily Promo',
    budget: 100,
    duration: '1 day',
    icon: '/emojis/lightning-emoji.webp'
  },
  {
    id: 'weekly',
    label: 'Weekly Promo',
    budget: 500,
    duration: '7 days',
    icon: '/emojis/promo-emoji.webp'
  },
  {
    id: 'monthly',
    label: 'Monthly Promo',
    budget: 1500,
    duration: '30 days',
    icon: '/emojis/target-emoji.webp'
  }
]

const placementOptions = [
  { id: 'featured-games', label: 'Featured Games', icon: '/emojis/star-emoji.webp' },
  { id: 'editors-choice', label: 'Editor\'s Choice', icon: '/emojis/target-emoji.webp' },
  { id: 'newsletter', label: 'Newsletter', icon: '/emojis/newsletter-emoji.webp' }
]

export default function StepReview({ data, onSubmit, isSubmitting, onEdit }: StepReviewProps) {
  const selectedGoal = goals.find(g => g.id === data.goal)
  const selectedPackage = packages.find(pkg => pkg.id === data.packageType)
  const selectedPlacements = (data.placements || []).map(placementId => 
    placementOptions.find(opt => opt.id === placementId)
  ).filter(Boolean)

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">
          Review & Submit
        </h2>
        <p className="text-gray-300">
          Review your campaign details before launching
        </p>
      </div>

      {/* Campaign Summary */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Campaign Summary</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Goal */}
          <Card className="bg-gray-800/50 border-gray-600">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <CardTitle className="text-white text-base">Advertising Goal</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(1)}
                  className="text-purple-400 hover:text-purple-300 hover:bg-purple-900/20 p-1 h-auto"
                >
                  <EditIcon className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center gap-2">
                <img src={selectedGoal?.icon} alt={selectedGoal?.label} className="w-5 h-5" />
                <p className="text-gray-300">{selectedGoal?.label}</p>
              </div>
            </CardContent>
          </Card>

          {/* Package */}
          <Card className="bg-gray-800/50 border-gray-600">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <CardTitle className="text-white text-base">Package & Budget</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(3)}
                  className="text-purple-400 hover:text-purple-300 hover:bg-purple-900/20 p-1 h-auto"
                >
                  <EditIcon className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <img src={selectedPackage?.icon} alt={selectedPackage?.label} className="w-5 h-5" />
                  <p className="text-gray-300 font-medium">{selectedPackage?.label}</p>
                </div>
                <div className="flex items-center gap-1">
                  <DollarSignIcon className="h-4 w-4 text-green-400" />
                  <p className="text-green-400 font-semibold">{data.budget}</p>
                  <span className="text-gray-400 text-sm">for {selectedPackage?.duration}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Placements */}
        <Card className="bg-gray-800/50 border-gray-600">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start">
              <CardTitle className="text-white text-base">Selected Placements</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(2)}
                className="text-purple-400 hover:text-purple-300 hover:bg-purple-900/20 p-1 h-auto"
              >
                <EditIcon className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              {selectedPlacements.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {selectedPlacements.map((placement) => (
                    <Badge key={placement?.id} variant="secondary" className="bg-purple-500/20 text-purple-300 border-purple-400/30">
                      <img src={placement?.icon} alt={placement?.label} className="w-4 h-4 mr-1" />
                      {placement?.label}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-sm">No placements selected</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Game Selection */}
        <Card className="bg-gray-800/50 border-gray-600">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start">
              <CardTitle className="text-white text-base">Selected Game</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(4)}
                className="text-purple-400 hover:text-purple-300 hover:bg-purple-900/20 p-1 h-auto"
              >
                <EditIcon className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center gap-3">
              <GamepadIcon className="h-8 w-8 text-purple-400" />
              <div>
                <p className="text-gray-300 font-medium">{data.gameName || data.gameId}</p>
                <p className="text-gray-400 text-sm">Selected for promotion</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Budget Summary */}
      <Card className="bg-gradient-to-r from-green-900/20 to-blue-900/20 border-green-500/30">
        <CardContent className="p-6">
          <div className="text-center space-y-2">
            <h4 className="text-lg font-semibold text-white">Campaign Total</h4>
            <div className="flex items-center justify-center gap-2">
              <DollarSignIcon className="h-8 w-8 text-green-400" />
              <span className="text-3xl font-bold text-green-400">{data.budget}</span>
            </div>
            <p className="text-gray-400 text-sm">
              {selectedPackage?.duration} promotion package
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Terms & Conditions */}
      <div className="bg-gray-800/30 border border-gray-600 rounded-xl p-4">
        <h4 className="text-white font-medium mb-2">Terms & Conditions</h4>
        <ul className="text-gray-400 text-sm space-y-1">
          <li>• Campaign will be reviewed before going live</li>
          <li>• Payment will be processed upon approval</li>
          <li>• Campaign duration cannot be changed after launch</li>
          <li>• Refunds are available within 24 hours of launch</li>
        </ul>
      </div>

      {/* Submit Button */}
      <div className="flex justify-center pt-6">
        <Button
          onClick={onSubmit}
          disabled={isSubmitting}
          className="rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 px-8 py-3 text-lg"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Launching Campaign...
            </>
          ) : (
            <>
              <CheckIcon className="w-5 h-5 mr-2" />
              Launch Campaign
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
