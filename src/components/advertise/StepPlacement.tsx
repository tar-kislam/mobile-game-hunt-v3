"use client"

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckIcon, StarIcon, MailIcon, ZapIcon } from 'lucide-react'

interface StepPlacementProps {
  data: {
    placements: string[]
  }
  updateData: (field: string, value: any) => void
}

const placementOptions = [
  {
    id: 'featured-games',
    label: 'Featured Games',
    description: 'Prominent placement on the homepage',
    icon: '/emojis/star-emoji.webp',
    multiplier: 1.0
  },
  {
    id: 'editors-choice',
    label: 'Editor\'s Choice',
    description: 'Curated selection by our editorial team',
    icon: '/emojis/target-emoji.webp',
    multiplier: 1.2
  },
  {
    id: 'newsletter',
    label: 'Newsletter',
    description: 'Featured in our weekly newsletter',
    icon: '/emojis/newsletter-emoji.webp',
    multiplier: 1.3
  }
]

export default function StepPlacement({ data, updateData }: StepPlacementProps) {
  const selectedPlacements = data.placements || []

  const togglePlacement = (placementId: string) => {
    const newPlacements = selectedPlacements.includes(placementId)
      ? selectedPlacements.filter(id => id !== placementId)
      : [...selectedPlacements, placementId]
    
    updateData('placements', newPlacements)
  }

  const calculateTotalMultiplier = () => {
    return selectedPlacements.reduce((total, placementId) => {
      const option = placementOptions.find(opt => opt.id === placementId)
      return total + (option?.multiplier || 0)
    }, 0)
  }

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">
          Choose Your Placements
        </h2>
        <p className="text-gray-300">
          Select where you want your game to be featured. You can choose multiple placements.
        </p>
      </div>

      {/* Placement Options */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {placementOptions.map((option) => {
          const isSelected = selectedPlacements.includes(option.id)
          
          return (
            <Card
              key={option.id}
              className={`cursor-pointer transition-all duration-200 ${
                isSelected
                  ? 'border-purple-400 bg-purple-500/10 ring-2 ring-purple-400/30'
                  : 'border-gray-600 hover:border-purple-400 hover:bg-purple-500/5'
              }`}
              onClick={() => togglePlacement(option.id)}
            >
              <CardContent className="p-6">
                <div className="text-center space-y-4">
                  <img src={option.icon} alt={option.label} className="w-12 h-12 mx-auto" />
                  
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">
                      {option.label}
                    </h3>
                    <p className="text-gray-400 text-sm mb-3">
                      {option.description}
                    </p>
                    
                    <Badge 
                      variant={isSelected ? "default" : "secondary"}
                      className={`${
                        isSelected 
                          ? 'bg-purple-500 text-white' 
                          : 'bg-gray-700 text-gray-300'
                      }`}
                    >
                      {option.multiplier === 1.0 ? 'Base Price' : `+${Math.round((option.multiplier - 1) * 100)}%`}
                    </Badge>
                  </div>

                  {isSelected && (
                    <div className="flex items-center justify-center text-green-400">
                      <CheckIcon className="h-5 w-5" />
                      <span className="ml-1 text-sm font-medium">Selected</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Selection Summary */}
      {selectedPlacements.length > 0 && (
        <div className="p-4 rounded-xl bg-blue-900/20 border border-blue-500/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ZapIcon className="h-5 w-5 text-blue-400" />
              <span className="text-blue-400 font-medium">
                {selectedPlacements.length} placement{selectedPlacements.length > 1 ? 's' : ''} selected
              </span>
            </div>
            <div className="text-right">
              <div className="text-white font-semibold">
                Total Multiplier: {calculateTotalMultiplier().toFixed(1)}x
              </div>
              <div className="text-gray-400 text-sm">
                {calculateTotalMultiplier() > 1 ? 'Premium pricing applied' : 'Base pricing'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Validation Message */}
      {selectedPlacements.length === 0 && (
        <div className="p-4 rounded-xl bg-yellow-900/20 border border-yellow-500/30">
          <div className="flex items-center gap-2 text-yellow-400">
            <StarIcon className="h-5 w-5" />
            <span className="font-medium">Please select at least one placement option</span>
          </div>
        </div>
      )}
    </div>
  )
}
