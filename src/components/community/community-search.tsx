'use client'

import { useState, useEffect, useCallback } from 'react'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { formatDistanceToNow } from 'date-fns'
import Link from 'next/link'
import { ArrowUpIcon, MessageCircleIcon, HeartIcon } from 'lucide-react'

interface SearchResult {
  posts: any[]
  keywords: string[]
  products: any[]
}

interface CommunitySearchProps {
  onSearchResults: (results: SearchResult | null) => void
  onClearSearch: () => void
}

export function CommunitySearch({ onSearchResults, onClearSearch }: CommunitySearchProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<SearchResult | null>(null)

  // Debounced search function
  const debouncedSearch = useCallback(
    (() => {
      let timeoutId: NodeJS.Timeout
      return (term: string) => {
        clearTimeout(timeoutId)
        timeoutId = setTimeout(async () => {
          if (term.trim().length > 0) {
            await performSearch(term)
          } else {
            setSearchResults(null)
            onSearchResults(null)
          }
        }, 300)
      }
    })(),
    [onSearchResults]
  )

  const performSearch = async (term: string) => {
    setIsSearching(true)
    try {
      const response = await fetch(`/api/community/search?q=${encodeURIComponent(term)}`)
      if (!response.ok) {
        throw new Error('Search failed')
      }
      const results = await response.json()
      console.log('Search results:', results) // Debug log
      setSearchResults(results)
      onSearchResults(results)
    } catch (error) {
      console.error('Search failed:', error)
      setSearchResults(null)
      onSearchResults(null)
    } finally {
      setIsSearching(false)
    }
  }

  useEffect(() => {
    debouncedSearch(searchTerm)
  }, [searchTerm, debouncedSearch])

  const handleClearSearch = () => {
    setSearchTerm('')
    setSearchResults(null)
    onClearSearch()
  }

  const handleKeywordClick = (keyword: string) => {
    // This will be handled by the parent component
    onSearchResults(null)
    // Trigger hashtag filter in parent
    window.dispatchEvent(new CustomEvent('community:search-keyword', { detail: keyword }))
  }

  const handleProductClick = (productId: string) => {
    window.location.href = `/product/${productId}`
  }

  if (searchTerm.trim().length === 0) {
    return (
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search posts, keywords, or products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 bg-background/40 border-white/10 focus:border-primary/50"
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search posts, keywords, or products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 bg-background/40 border-white/10 focus:border-primary/50"
        />
        {searchTerm && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearSearch}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            Clear
          </Button>
        )}
      </div>

      {/* Loading State */}
      {isSearching && (
        <div className="text-center text-muted-foreground py-8">
          Searching...
        </div>
      )}
    </div>
  )
}
