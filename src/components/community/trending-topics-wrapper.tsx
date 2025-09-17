'use client'

import { TrendingTopics } from './trending-topics'

interface TrendingTopicsWrapperProps {
  topics: string[]
}

export function TrendingTopicsWrapper({ topics }: TrendingTopicsWrapperProps) {
  const handleSimpleSearch = async (query: string) => {
    // This will be handled by the parent component through a custom event
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('community:simple-search', { detail: query }))
    }
  }

  const handleSimpleSearchClear = () => {
    // This will be handled by the parent component through a custom event
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('community:simple-search-clear', { detail: null }))
    }
  }

  return (
    <TrendingTopics 
      topics={topics}
      onSimpleSearch={handleSimpleSearch}
      onSimpleSearchClear={handleSimpleSearchClear}
    />
  )
}