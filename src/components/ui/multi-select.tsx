"use client"

import { useState, useMemo } from 'react'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuCheckboxItem } from "@/components/ui/dropdown-menu"
import { ChevronDown } from 'lucide-react'

interface MultiSelectProps {
  selectedItems: string[]
  onSelectionChange: (itemIds: string[]) => void
  options: Array<{ id: string; label: string; icon?: React.ComponentType<{ className?: string }>; flag?: string }>
  maxSelections?: number
  placeholder?: string
  label?: string
}

export function MultiSelect({ 
  selectedItems, 
  onSelectionChange, 
  options,
  maxSelections = 5,
  placeholder = "Select items...",
  label
}: MultiSelectProps) {
  const [open, setOpen] = useState(false)
  const reachedMax = selectedItems.length >= maxSelections

  const toggle = (itemId: string) => {
    if (selectedItems.includes(itemId)) {
      onSelectionChange(selectedItems.filter(id => id !== itemId))
    } else if (!reachedMax) {
      onSelectionChange([...selectedItems, itemId])
    }
  }

  const ordered = useMemo(() => {
    // Show selected first for better visibility
    const selected = options.filter(o => selectedItems.includes(o.id))
    const rest = options.filter(o => !selectedItems.includes(o.id))
    return [...selected, ...rest]
  }, [options, selectedItems])

  const selectedLabels = selectedItems.map(id => options.find(o => o.id === id)?.label).filter(Boolean)

  return (
    <div className="space-y-2">
      {label && (
        <label className="text-sm font-medium">{label}</label>
      )}
      
      {/* Main selection field */}
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            className="w-full h-12 justify-between text-left font-normal"
            disabled={reachedMax && selectedItems.length === 0}
          >
            <span className="truncate">
              {selectedItems.length === 0 
                ? placeholder 
                : selectedItems.length === 1 
                  ? selectedLabels[0]
                  : `${selectedItems.length} selected`
              }
            </span>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-full max-h-60 overflow-y-auto" align="start">
          <DropdownMenuLabel>Select up to {maxSelections}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {ordered.map((option) => {
            const isSelected = selectedItems.includes(option.id)
            return (
              <DropdownMenuCheckboxItem
                key={option.id}
                checked={isSelected}
                onCheckedChange={() => toggle(option.id)}
                disabled={!isSelected && reachedMax}
                className="flex items-center gap-2"
              >
                {option.flag && <span>{option.flag}</span>}
                {option.icon && <option.icon className="w-4 h-4" />}
                <span>{option.label}</span>
              </DropdownMenuCheckboxItem>
            )
          })}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Selected items display */}
      {selectedItems.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {selectedItems.map((id) => {
            const option = options.find(o => o.id === id)
            if (!option) return null
            
            return (
              <Badge
                key={`sel-${id}`}
                variant="secondary"
                className="cursor-pointer hover:bg-destructive/10"
                onClick={() => onSelectionChange(selectedItems.filter(x => x !== id))}
              >
                {option.flag && <span className="mr-1">{option.flag}</span>}
                {option.icon && <option.icon className="w-3 h-3 mr-1" />}
                {option.label}
                <span className="ml-1">×</span>
              </Badge>
            )
          })}
        </div>
      )}
    </div>
  )
}
