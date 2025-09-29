"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Search, Filter, X } from "lucide-react"

interface SearchBarProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  selectedCategory: string
  onCategoryChange: (category: string) => void
  selectedPlatform: string
  onPlatformChange: (platform: string) => void
  selectedReleaseStatus: string
  onReleaseStatusChange: (status: string) => void
  categories: Array<{ value: string; label: string; count?: number }>
  platforms: Array<{ value: string; label: string; count?: number }>
  releaseStatuses: Array<{ value: string; label: string; count?: number }>
  onClearFilters: () => void
  className?: string
}

export function GogSearchBar({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedPlatform,
  onPlatformChange,
  selectedReleaseStatus,
  onReleaseStatusChange,
  categories,
  platforms,
  releaseStatuses,
  onClearFilters,
  className = ""
}: SearchBarProps) {
  const hasActiveFilters = selectedCategory !== "all" || selectedPlatform !== "all" || selectedReleaseStatus !== "all"

  return (
    <div className={`bg-card/50 backdrop-blur-sm border border-white/10 rounded-lg p-4 products-font ${className}`}>
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search Input */}
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Search games…"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-purple-500/20 font-[Orbitron] font-semibold"
            />
          </div>
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Category Filter */}
          <Select value={selectedCategory} onValueChange={onCategoryChange}>
            <SelectTrigger className="w-full sm:w-[180px] bg-gray-800/50 border-gray-600 text-white font-[Orbitron] font-semibold">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-600 font-[Orbitron] font-semibold">
              <SelectItem value="all" className="text-white hover:bg-gray-700 focus:bg-gray-700">
                All Categories
              </SelectItem>
              {categories.map((category) => (
                <SelectItem 
                  key={category.value} 
                  value={category.value}
                  className="text-white hover:bg-gray-700 focus:bg-gray-700"
                >
                  <div className="flex items-center justify-between w-full">
                    <span>{category.label}</span>
                    {category.count !== undefined && (
                      <span className="text-xs text-gray-400 ml-2">({category.count})</span>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Platform Filter */}
          <Select value={selectedPlatform} onValueChange={onPlatformChange}>
            <SelectTrigger className="w-full sm:w-[180px] bg-gray-800/50 border-gray-600 text-white font-[Orbitron] font-semibold">
              <SelectValue placeholder="Platform" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-600 font-[Orbitron] font-semibold">
              <SelectItem value="all" className="text-white hover:bg-gray-700 focus:bg-gray-700">
                All Platforms
              </SelectItem>
              {platforms.map((platform) => (
                <SelectItem 
                  key={platform.value} 
                  value={platform.value}
                  className="text-white hover:bg-gray-700 focus:bg-gray-700"
                >
                  <div className="flex items-center justify-between w-full">
                    <span>{platform.label}</span>
                    {platform.count !== undefined && (
                      <span className="text-xs text-gray-400 ml-2">({platform.count})</span>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Release Status Filter */}
          <Select value={selectedReleaseStatus} onValueChange={onReleaseStatusChange}>
            <SelectTrigger className="w-full sm:w-[180px] bg-gray-800/50 border-gray-600 text-white font-[Orbitron] font-semibold">
              <SelectValue placeholder="Release Status" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-600 font-[Orbitron] font-semibold">
              <SelectItem value="all" className="text-white hover:bg-gray-700 focus:bg-gray-700">
                All Status
              </SelectItem>
              {releaseStatuses.map((status) => (
                <SelectItem 
                  key={status.value} 
                  value={status.value}
                  className="text-white hover:bg-gray-700 focus:bg-gray-700"
                >
                  <div className="flex items-center justify-between w-full">
                    <span>{status.label}</span>
                    {status.count !== undefined && (
                      <span className="text-xs text-gray-400 ml-2">({status.count})</span>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={onClearFilters}
              className="bg-gray-800/50 border-gray-600 text-gray-300 hover:bg-gray-700/50 hover:text-white"
            >
              <X className="w-4 h-4 mr-1" />
              Clear
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
