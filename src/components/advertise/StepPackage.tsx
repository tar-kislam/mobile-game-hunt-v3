"use client"

import React, { useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckIcon, ClockIcon, DollarSignIcon, ZapIcon, TrendingUpIcon } from 'lucide-react'

interface StepPackageProps {
  data: {
    packageType: string
    budget: number
    placements: string[]
  }
  updateData: (field: string, value: any) => void
}

const basePackages = [
  {
    id: 'daily',
    label: 'Daily Promo',
    baseBudget: 100,
    duration: '1 day',
    description: 'Quick boost for immediate visibility',
    features: ['Featured placement', 'Social media mention', '24-hour promotion'],
    icon: '/emojis/lightning-emoji.webp'
  },
  {
    id: 'weekly',
    label: 'Weekly Promo',
    baseBudget: 500,
    duration: '7 days',
    description: 'Extended promotion for sustained growth',
    features: ['Premium placement', 'Newsletter inclusion', 'Cross-platform promotion'],
    icon: '/emojis/promo-emoji.webp'
  },
  {
    id: 'monthly',
    label: 'Monthly Promo',
    baseBudget: 1500,
    duration: '30 days',
    description: 'Comprehensive campaign for maximum impact',
    features: ['Editor\'s Choice badge', 'Priority placement', 'Full marketing suite'],
    icon: '/emojis/target-emoji.webp'
  }
]

const placementMultipliers = {
  'featured-games': 1.0,
  'editors-choice': 1.2,
  'newsletter': 1.3
}

export default function StepPackage({ data, updateData }: StepPackageProps) {
  const selectedPlacements = data.placements || []

  // Calculate total multiplier from selected placements
  const calculateMultiplier = () => {
    if (selectedPlacements.length === 0) return 1.0
    
    return selectedPlacements.reduce((total, placementId) => {
      return total + (placementMultipliers[placementId as keyof typeof placementMultipliers] || 0)
    }, 0)
  }

  // Calculate final budget based on base package and placement multipliers
  const calculateFinalBudget = (baseBudget: number) => {
    const multiplier = calculateMultiplier()
    return Math.round(baseBudget * multiplier)
  }

  // Update budget when package or placements change
  useEffect(() => {
    if (data.packageType) {
      const selectedPackage = basePackages.find(pkg => pkg.id === data.packageType)
      if (selectedPackage) {
        const finalBudget = calculateFinalBudget(selectedPackage.baseBudget)
        // Only update if the budget has actually changed to prevent infinite loop
        if (finalBudget !== data.budget) {
          updateData('budget', finalBudget)
        }
      }
    }
  }, [data.packageType, selectedPlacements.join(','), data.budget])

  const handlePackageSelect = (packageType: string) => {
    updateData('packageType', packageType)
  }

  const selectedPackage = basePackages.find(pkg => pkg.id === data.packageType)
  const multiplier = calculateMultiplier()

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">
          Choose Your Package
        </h2>
        <p className="text-gray-300">
          Select a promotion package. Pricing is calculated based on your selected placements.
        </p>
      </div>

      {/* Package Options */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {basePackages.map((pkg) => {
          const finalBudget = calculateFinalBudget(pkg.baseBudget)
          const isSelected = data.packageType === pkg.id
          
          return (
            <Card
              key={pkg.id}
              className={`cursor-pointer transition-all duration-200 ${
                isSelected
                  ? 'border-purple-400 bg-purple-500/10 ring-2 ring-purple-400/30'
                  : 'border-gray-600 hover:border-purple-400 hover:bg-purple-500/5'
              }`}
              onClick={() => handlePackageSelect(pkg.id)}
            >
              <CardContent className="p-6">
                <div className="text-center space-y-4">
                  <img src={pkg.icon} alt={pkg.label} className="w-12 h-12 mx-auto" />
                  
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">
                      {pkg.label}
                    </h3>
                    <p className="text-gray-400 text-sm mb-3">
                      {pkg.description}
                    </p>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-center gap-2">
                        <DollarSignIcon className="h-5 w-5 text-green-400" />
                        <span className="text-2xl font-bold text-green-400">
                          {finalBudget}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-center gap-1 text-gray-400 text-sm">
                        <ClockIcon className="h-4 w-4" />
                        <span>{pkg.duration}</span>
                      </div>
                      
                      {multiplier > 1.0 && (
                        <Badge variant="secondary" className="text-xs">
                          {multiplier.toFixed(1)}x multiplier applied
                        </Badge>
                      )}
                    </div>
                  </div>

                  {isSelected && (
                    <div className="flex items-center justify-center text-purple-400">
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

      {/* Pricing Breakdown */}
      {selectedPackage && selectedPlacements.length > 0 && (
        <div className="p-4 rounded-xl bg-blue-900/20 border border-blue-500/30">
          <h4 className="text-white font-medium mb-3 flex items-center gap-2">
            <ZapIcon className="h-5 w-5 text-blue-400" />
            Pricing Breakdown
          </h4>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-gray-300">
              <span>Base {selectedPackage.label}:</span>
              <span>${selectedPackage.baseBudget}</span>
            </div>
            
            {selectedPlacements.map((placementId) => {
              const multiplier = placementMultipliers[placementId as keyof typeof placementMultipliers]
              if (multiplier === 1.0) return null
              
              return (
                <div key={placementId} className="flex justify-between text-gray-300">
                  <span className="capitalize">{placementId.replace('-', ' ')} (+{Math.round((multiplier - 1) * 100)}%):</span>
                  <span>+${Math.round(selectedPackage.baseBudget * (multiplier - 1))}</span>
                </div>
              )
            })}
            
            <div className="border-t border-gray-600 pt-2 mt-2">
              <div className="flex justify-between text-white font-semibold">
                <span>Total:</span>
                <span>${calculateFinalBudget(selectedPackage.baseBudget)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Validation Message */}
      {selectedPlacements.length === 0 && (
        <div className="p-4 rounded-xl bg-yellow-900/20 border border-yellow-500/30">
          <div className="flex items-center gap-2 text-yellow-400">
            <TrendingUpIcon className="h-5 w-5" />
            <span className="font-medium">Please select placements in the previous step to see pricing</span>
          </div>
        </div>
      )}
    </div>
  )
}