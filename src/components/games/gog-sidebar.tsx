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

interface GogSidebarProps {
  categories: FilterOption[]
  platforms: FilterOption[]
  releaseStatuses: FilterOption[]
  monetization: FilterOption[]
  engines: FilterOption[]
  pricing: FilterOption[]
  selectedCategories: string[]
  selectedPlatforms: string[]
  selectedReleaseStatuses: string[]
  selectedMonetization: string[]
  selectedEngines: string[]
  selectedPricing: string[]
  onCategoryChange: (categories: string[]) => void
  onPlatformChange: (platforms: string[]) => void
  onReleaseStatusChange: (statuses: string[]) => void
  onMonetizationChange: (monetization: string[]) => void
  onEngineChange: (engines: string[]) => void
  onPricingChange: (pricing: string[]) => void
  onClearFilters: () => void
  className?: string
}

export function GogSidebar({
  categories,
  platforms,
  releaseStatuses,
  monetization,
  engines,
  pricing,
  selectedCategories,
  selectedPlatforms,
  selectedReleaseStatuses,
  selectedMonetization,
  selectedEngines,
  selectedPricing,
  onCategoryChange,
  onPlatformChange,
  onReleaseStatusChange,
  onMonetizationChange,
  onEngineChange,
  onPricingChange,
  onClearFilters,
  className = ""
}: GogSidebarProps) {
  const [expandedSections, setExpandedSections] = useState({
    categories: true,
    platforms: true,
    releaseStatus: true,
    monetization: true,
    engines: true,
    pricing: true
  })

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const hasActiveFilters = selectedCategories.length > 0 || selectedPlatforms.length > 0 || selectedReleaseStatuses.length > 0 || selectedMonetization.length > 0 || selectedEngines.length > 0 || selectedPricing.length > 0

  const FilterSection = ({ 
    title, 
    options, 
    selected, 
    onChange, 
    sectionKey,
    showCounts = true
  }: {
    title: string
    options: FilterOption[]
    selected: string[]
    onChange: (values: string[]) => void
    sectionKey: keyof typeof expandedSections
    showCounts?: boolean
  }) => (
    <Collapsible 
      open={expandedSections[sectionKey]} 
      onOpenChange={() => toggleSection(sectionKey)}
    >
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          className="w-full justify-between p-0 h-auto font-semibold text-white hover:text-purple-400 text-sm"
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
              {showCounts && option.count !== undefined && (
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

  // Mock features for demonstration
  const features = [
    { value: 'single-player', label: 'Single-player', count: 45 },
    { value: 'multi-player', label: 'Multi-player', count: 32 },
    { value: 'co-op', label: 'Co-op', count: 28 },
    { value: 'achievements', label: 'Achievements', count: 38 },
    { value: 'controller-support', label: 'Controller support', count: 41 },
    { value: 'cloud-saves', label: 'Cloud saves', count: 25 }
  ]

  return (
    <div className={`w-64 flex-shrink-0 ${className}`}>
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
            title="Genres"
            options={categories}
            selected={selectedCategories}
            onChange={onCategoryChange}
            sectionKey="categories"
          />

          {/* Platforms */}
          <FilterSection
            title="Operating Systems"
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

          {/* Monetization Model */}
          <FilterSection
            title="Monetization Model"
            options={monetization}
            selected={selectedMonetization}
            onChange={onMonetizationChange}
            sectionKey="monetization"
          />

          {/* Engine */}
          <FilterSection
            title="Engine"
            options={engines}
            selected={selectedEngines}
            onChange={onEngineChange}
            sectionKey="engines"
          />

          {/* Pricing */}
          <FilterSection
            title="Pricing"
            options={pricing}
            selected={selectedPricing}
            onChange={onPricingChange}
            sectionKey="pricing"
          />

        </CardContent>
      </Card>
    </div>
  )
}
