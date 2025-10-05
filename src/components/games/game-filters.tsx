"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDown, ChevronUp, Filter, X } from "lucide-react"
import { useState } from "react"
import { PLATFORMS } from "@/components/ui/platform-icons"

interface FilterOption {
  value: string
  label: string
  count?: number
}

interface GameFiltersProps {
  categories: FilterOption[]
  platforms: FilterOption[]
  releaseStatuses: FilterOption[]
  selectedCategories: string[]
  selectedPlatforms: string[]
  selectedReleaseStatuses: string[]
  onCategoryChange: (categories: string[]) => void
  onPlatformChange: (platforms: string[]) => void
  onReleaseStatusChange: (statuses: string[]) => void
  onClearFilters: () => void
  isMobile?: boolean
}

export function GameFilters({
  categories,
  platforms,
  releaseStatuses,
  selectedCategories,
  selectedPlatforms,
  selectedReleaseStatuses,
  onCategoryChange,
  onPlatformChange,
  onReleaseStatusChange,
  onClearFilters,
  isMobile = false
}: GameFiltersProps) {
  const [expandedSections, setExpandedSections] = useState({
    categories: true,
    platforms: true,
    releaseStatus: true
  })

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const hasActiveFilters = selectedCategories.length > 0 || selectedPlatforms.length > 0 || selectedReleaseStatuses.length > 0

  const FilterSection = ({ 
    title, 
    options, 
    selected, 
    onChange, 
    sectionKey 
  }: {
    title: string
    options: FilterOption[]
    selected: string[]
    onChange: (values: string[]) => void
    sectionKey: keyof typeof expandedSections
  }) => (
    <Collapsible 
      open={expandedSections[sectionKey]} 
      onOpenChange={() => toggleSection(sectionKey)}
    >
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          className="w-full justify-between p-0 h-auto font-semibold text-white hover:text-purple-400"
        >
          <span>{title}</span>
          {expandedSections[sectionKey] ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-2 mt-3">
        {options.map((option) => (
          <div key={option.value} className="flex items-center space-x-2">
            <Checkbox
              id={`${sectionKey}-${option.value}`}
              checked={selected.includes(option.value)}
              onCheckedChange={(checked) => {
                if (checked) {
                  onChange([...selected, option.value])
                } else {
                  onChange(selected.filter(v => v !== option.value))
                }
              }}
              className="border-gray-600 data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
            />
            <label
              htmlFor={`${sectionKey}-${option.value}`}
              className="text-sm text-gray-300 cursor-pointer flex-1 flex items-center justify-between"
            >
              <span>{option.label}</span>
              {option.count !== undefined && (
                <Badge variant="outline" className="text-xs bg-gray-800/50 border-gray-600 text-gray-400">
                  {option.count}
                </Badge>
              )}
            </label>
          </div>
        ))}
      </CollapsibleContent>
    </Collapsible>
  )

  const content = (
    <Card className="bg-card/50 backdrop-blur-sm border-white/10">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg text-white flex items-center">
            <Filter className="w-5 h-5 mr-2" />
            Filters
          </CardTitle>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
              className="text-gray-400 hover:text-white text-xs"
            >
              <X className="w-4 h-4 mr-1" />
              Clear All
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Categories */}
        <FilterSection
          title="Categories"
          options={categories}
          selected={selectedCategories}
          onChange={onCategoryChange}
          sectionKey="categories"
        />

        {/* Platforms */}
        <FilterSection
          title="Platforms"
          options={platforms}
          selected={selectedPlatforms}
          onChange={onPlatformChange}
          sectionKey="platforms"
        />

        {/* Release Status */}
        <FilterSection
          title="Release Status"
          options={releaseStatuses}
          selected={selectedReleaseStatuses}
          onChange={onReleaseStatusChange}
          sectionKey="releaseStatus"
        />
      </CardContent>
    </Card>
  )

  if (isMobile) {
    return (
      <div className="lg:hidden mb-6">
        {content}
      </div>
    )
  }

  return (
    <div className="hidden lg:block w-64 flex-shrink-0">
      {content}
    </div>
  )
}

// Mobile filter dropdown component
export function MobileFilterDropdown({
  categories,
  platforms,
  releaseStatuses,
  selectedCategories,
  selectedPlatforms,
  selectedReleaseStatuses,
  onCategoryChange,
  onPlatformChange,
  onReleaseStatusChange,
  onClearFilters
}: Omit<GameFiltersProps, 'isMobile'>) {
  const [isOpen, setIsOpen] = useState(false)
  const hasActiveFilters = selectedCategories.length > 0 || selectedPlatforms.length > 0 || selectedReleaseStatuses.length > 0

  return (
    <div className="lg:hidden mb-6">
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full justify-between bg-card/50 border-white/10 text-white hover:bg-card/80"
      >
        <span className="flex items-center">
          <Filter className="w-4 h-4 mr-2" />
          Filters
          {hasActiveFilters && (
            <Badge className="ml-2 bg-purple-600 text-white">
              {selectedCategories.length + selectedPlatforms.length + selectedReleaseStatuses.length}
            </Badge>
          )}
        </span>
        {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </Button>
      
      {isOpen && (
        <div className="mt-4">
          <GameFilters
            categories={categories}
            platforms={platforms}
            releaseStatuses={releaseStatuses}
            selectedCategories={selectedCategories}
            selectedPlatforms={selectedPlatforms}
            selectedReleaseStatuses={selectedReleaseStatuses}
            onCategoryChange={onCategoryChange}
            onPlatformChange={onPlatformChange}
            onReleaseStatusChange={onReleaseStatusChange}
            onClearFilters={onClearFilters}
            isMobile={true}
          />
        </div>
      )}
    </div>
  )
}
