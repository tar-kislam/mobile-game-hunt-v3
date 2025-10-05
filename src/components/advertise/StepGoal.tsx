"use client"

import React from 'react'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

interface StepGoalProps {
  data: {
    goal: string
  }
  updateData: (field: string, value: any) => void
}

const goals = [
  {
    id: 'brand-awareness',
    label: 'Brand Awareness',
    description: 'Increase visibility and recognition for your studio',
    icon: '🎯'
  },
  {
    id: 'game-launch',
    label: 'Game Launch',
    description: 'Generate buzz and downloads for your new release',
    icon: '🚀'
  },
  {
    id: 'community-growth',
    label: 'Community Growth',
    description: 'Build an engaged player community',
    icon: '👥'
  }
]

export default function StepGoal({ data, updateData }: StepGoalProps) {
  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">
          🎯 Advertising Goal
        </h2>
        <p className="text-gray-300">
          What do you want to achieve with your campaign?
        </p>
      </div>

      <RadioGroup
        value={data.goal}
        onValueChange={(value) => updateData('goal', value)}
        className="space-y-4"
      >
        {goals.map((goal) => (
          <div key={goal.id} className="flex items-center space-x-3">
            <RadioGroupItem value={goal.id} id={goal.id} />
            <Label htmlFor={goal.id} className="flex-1 cursor-pointer">
              <div className="p-6 rounded-xl border border-gray-600 hover:border-purple-400 transition-all duration-200 hover:bg-purple-500/5">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">{goal.icon}</span>
                  <h3 className="text-xl font-semibold text-white">{goal.label}</h3>
                </div>
                <p className="text-gray-400">{goal.description}</p>
              </div>
            </Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  )
}
