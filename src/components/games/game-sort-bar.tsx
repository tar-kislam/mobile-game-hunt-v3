"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowUpDown, Star, Eye, Calendar, Award, Trophy } from "lucide-react"

interface SortOption {
  value: string
  label: string
  icon: React.ComponentType<{ className?: string }>
}

const SORT_OPTIONS: SortOption[] = [
  { 
    value: 'newest', 
    label: 'Newest', 
    icon: Calendar 
  },
  { 
    value: 'most-upvoted', 
    label: 'Most Upvoted', 
    icon: Star 
  },
  { 
    value: 'most-viewed', 
    label: 'Most Viewed', 
    icon: Eye 
  },
  { 
    value: 'editors-choice', 
    label: "Editor's Choice", 
    icon: Award 
  }
]

interface GameSortBarProps {
  sortBy: string
  onSortChange: (sortBy: string) => void
  totalGames: number
  filteredGames: number
  className?: string
}

export function GameSortBar({ 
  sortBy, 
  onSortChange, 
  totalGames, 
  filteredGames,
  className = ""
}: GameSortBarProps) {
  const currentSort = SORT_OPTIONS.find(option => option.value === sortBy) || SORT_OPTIONS[0]

  return (
    <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 ${className}`}>
      {/* Results Count */}
      <div className="flex items-center space-x-2">
        <h2 className="text-lg font-semibold text-white">
          Mobile Games
        </h2>
        <Badge variant="outline" className="bg-gray-800/50 border-gray-600 text-gray-300">
          {filteredGames === totalGames ? (
            `${totalGames} games`
          ) : (
            `${filteredGames} of ${totalGames} games`
          )}
        </Badge>
      </div>

      {/* Sort Controls */}
      <div className="flex items-center space-x-3">
        <span className="text-sm text-gray-400 hidden sm:block">Sort by:</span>
        
        {/* Desktop: Button Group */}
        <div className="hidden sm:flex items-center space-x-1 bg-gray-800/50 rounded-lg p-1">
          {SORT_OPTIONS.map((option) => {
            const Icon = option.icon
            const isSelected = option.value === sortBy
            
            return (
              <Button
                key={option.value}
                variant={isSelected ? "default" : "ghost"}
                size="sm"
                onClick={() => onSortChange(option.value)}
                className={`px-3 py-1 text-sm transition-all duration-200 ${
                  isSelected 
                    ? "bg-purple-600 hover:bg-purple-700 text-white shadow-lg" 
                    : "text-gray-300 hover:text-white hover:bg-gray-700/50"
                }`}
              >
                <Icon className="w-4 h-4 mr-1" />
                {option.label}
              </Button>
            )
          })}
        </div>

        {/* Mobile: Dropdown */}
        <Select value={sortBy} onValueChange={onSortChange}>
          <SelectTrigger className="w-[180px] bg-gray-800/50 border-gray-600 text-white sm:hidden">
            <SelectValue>
              <div className="flex items-center">
                <ArrowUpDown className="w-4 h-4 mr-2" />
                {currentSort.label}
              </div>
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="bg-gray-800 border-gray-600">
            {SORT_OPTIONS.map((option) => {
              const Icon = option.icon
              return (
                <SelectItem 
                  key={option.value} 
                  value={option.value}
                  className="text-white hover:bg-gray-700 focus:bg-gray-700"
                >
                  <div className="flex items-center">
                    <Icon className="w-4 h-4 mr-2" />
                    {option.label}
                  </div>
                </SelectItem>
              )
            })}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}

// Compact version for smaller spaces
export function GameSortBarCompact({ 
  sortBy, 
  onSortChange, 
  totalGames, 
  filteredGames,
  className = ""
}: GameSortBarProps) {
  const currentSort = SORT_OPTIONS.find(option => option.value === sortBy) || SORT_OPTIONS[0]

  return (
    <div className={`flex items-center justify-between ${className}`}>
      {/* Results Count */}
      <div className="flex items-center space-x-2">
        <span className="text-sm text-gray-300">
          {filteredGames === totalGames ? (
            `${totalGames} games`
          ) : (
            `${filteredGames} of ${totalGames} games`
          )}
        </span>
      </div>

      {/* Sort Dropdown */}
      <Select value={sortBy} onValueChange={onSortChange}>
        <SelectTrigger className="w-[160px] bg-gray-800/50 border-gray-600 text-white">
          <SelectValue>
            <div className="flex items-center">
              <ArrowUpDown className="w-4 h-4 mr-2" />
              {currentSort.label}
            </div>
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="bg-gray-800 border-gray-600">
          {SORT_OPTIONS.map((option) => {
            const Icon = option.icon
            return (
              <SelectItem 
                key={option.value} 
                value={option.value}
                className="text-white hover:bg-gray-700 focus:bg-gray-700"
              >
                <div className="flex items-center">
                  <Icon className="w-4 h-4 mr-2" />
                  {option.label}
                </div>
              </SelectItem>
            )
          })}
        </SelectContent>
      </Select>
    </div>
  )
}
