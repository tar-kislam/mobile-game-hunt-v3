'use client'

import { TrendingTopics } from './trending-topics'
import { useTrendingData } from '@/hooks/useTrendingData'

interface TrendingTopicsWrapperProps {
  topics: string[] // Keep for backward compatibility, but will be overridden by API data
}

export function TrendingTopicsWrapper({ topics }: TrendingTopicsWrapperProps) {
  const { data: trendingData, isLoading, error } = useTrendingData()
  
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

  // Use API data if available, fallback to props
  const displayTopics = trendingData?.hashtags?.map(h => h.tag) || topics

  return (
    <TrendingTopics 
      topics={displayTopics}
      trendingData={trendingData}
      isLoading={isLoading}
      onSimpleSearch={handleSimpleSearch}
      onSimpleSearchClear={handleSimpleSearchClear}
    />
  )
}