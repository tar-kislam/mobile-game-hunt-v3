"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface TimeWindowControlProps {
  timeWindow: string
  onTimeWindowChange: (window: string) => void
  className?: string
}

const TIME_WINDOWS = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
  { value: 'alltime', label: 'All Time' }
]

export function TimeWindowControl({ 
  timeWindow, 
  onTimeWindowChange, 
  className = "" 
}: TimeWindowControlProps) {
  return (
    <div className={cn("flex flex-wrap gap-2 products-font font-[Lexend]", className)}>
      {TIME_WINDOWS.map((window) => (
        <Button
          key={window.value}
          variant={timeWindow === window.value ? "default" : "outline"}
          size="sm"
          onClick={() => onTimeWindowChange(window.value)}
          className={cn(
            "transition-all duration-200",
            timeWindow === window.value
              ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white border-purple-500 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40"
              : "bg-gray-800/50 border-gray-600 text-gray-300 hover:bg-gray-700/50 hover:border-gray-500 hover:text-white"
          )}
        >
          {window.label}
        </Button>
      ))}
    </div>
  )
}
