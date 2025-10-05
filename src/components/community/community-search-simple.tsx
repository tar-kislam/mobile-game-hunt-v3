'use client'

import { useState, useEffect, useCallback } from 'react'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'

interface CommunitySearchSimpleProps {
  onSearch: (query: string) => void
  onClear: () => void
}

export function CommunitySearchSimple({ onSearch, onClear }: CommunitySearchSimpleProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [isSearching, setIsSearching] = useState(false)

  // Debounced search function
  const debouncedSearch = useCallback(
    (() => {
      let timeoutId: NodeJS.Timeout
      return (query: string) => {
        clearTimeout(timeoutId)
        timeoutId = setTimeout(() => {
          if (query.trim()) {
            setIsSearching(true)
            onSearch(query.trim())
            // Reset searching state after a short delay
            setTimeout(() => setIsSearching(false), 500)
          } else {
            onClear()
          }
        }, 300) // 300ms debounce
      }
    })(),
    [onSearch, onClear]
  )

  useEffect(() => {
    debouncedSearch(searchTerm)
  }, [searchTerm, debouncedSearch])

  const handleClear = () => {
    setSearchTerm('')
    onClear()
  }

  return (
    <div className="relative mb-6">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
      <Input
        placeholder="Search posts in community..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="pl-10 pr-10 bg-background/40 border-white/10 focus:border-primary/50 rounded-xl"
      />
      {searchTerm && (
        <button
          onClick={handleClear}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground text-sm"
        >
          Clear
        </button>
      )}
      {isSearching && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground text-sm">
          Searching...
        </div>
      )}
    </div>
  )
}