"use client"

import { useState, useEffect, useMemo } from 'react'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface Category {
  id: string
  name: string
}

interface MultiSelectProps {
  selectedCategories: string[]
  onSelectionChange: (categoryIds: string[]) => void
  maxSelections?: number
  placeholder?: string
}

export function CategoryMultiSelect({ 
  selectedCategories, 
  onSelectionChange, 
  maxSelections = 3,
  placeholder = "Select categories..." 
}: MultiSelectProps) {
  const [categories, setCategories] = useState<Category[]>([])
  const reachedMax = selectedCategories.length >= maxSelections

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories')
        if (response.ok) {
          const data = await response.json()
          setCategories(data)
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error)
      }
    }
    fetchCategories()
  }, [])

  const toggle = (categoryId: string) => {
    if (selectedCategories.includes(categoryId)) {
      onSelectionChange(selectedCategories.filter(id => id !== categoryId))
    } else if (!reachedMax) {
      onSelectionChange([...selectedCategories, categoryId])
    }
  }

  const ordered = useMemo(() => {
    // Sort A–Z for consistency, but keep selected first preserving alphabetical order in each group
    const byName = (a: Category, b: Category) => a.name.localeCompare(b.name)
    const selected = categories.filter(c => selectedCategories.includes(c.id)).sort(byName)
    const rest = categories.filter(c => !selectedCategories.includes(c.id)).sort(byName)
    return [...selected, ...rest]
  }, [categories, selectedCategories])

  return (
    <div className="space-y-2">
      {/* Assistive summary bar */}
      <div className="w-full h-12 rounded-xl border border-border px-3 flex items-center text-sm text-muted-foreground">
        {selectedCategories.length === 0 ? placeholder : `${selectedCategories.length}/${maxSelections} selected`}
      </div>

      {/* Chip list */}
      <div className="flex flex-wrap gap-2" role="group" aria-label="Categories">
        {ordered.map((category) => {
          const isSelected = selectedCategories.includes(category.id)
          return (
            <Button
              key={category.id}
              type="button"
              size="sm"
              variant={isSelected ? "default" : "outline"}
              className={`rounded-full h-8 px-3 ${!isSelected && reachedMax ? 'opacity-50 cursor-not-allowed' : ''}`}
              aria-pressed={isSelected}
              aria-label={`Category ${category.name}${isSelected ? ' selected' : ''}`}
              onClick={() => toggle(category.id)}
              disabled={!isSelected && reachedMax}
            >
              {category.name}
              {isSelected && <span className="ml-1">×</span>}
            </Button>
          )
        })}
      </div>

      {/* Selected badges (quick remove) */}
      {selectedCategories.length > 0 && (
        <div className="flex flex-wrap gap-1 text-xs text-muted-foreground">
          {selectedCategories.map((id) => {
            const name = categories.find(c => c.id === id)?.name || id
            return (
              <Badge
                key={`sel-${id}`}
                variant="secondary"
                className="cursor-pointer"
                onClick={() => onSelectionChange(selectedCategories.filter(x => x !== id))}
              >
                {name} ×
              </Badge>
            )
          })}
        </div>
      )}
    </div>
  )
}
