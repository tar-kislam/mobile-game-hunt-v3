"use client"

import { useState } from 'react'
import { Feed } from '@/components/social/Feed'
import { FeedSidebar } from '@/components/feed/FeedSidebar'
import Galaxy from '@/components/Galaxy'
import Shuffle from '@/components/Shuffle'

export default function FeedPage() {
  const [activeFilter, setActiveFilter] = useState<{ type: string; value: string } | null>(null)

  const handleFilterChange = (filterType: string, filterValue: string | null) => {
    if (filterValue) {
      setActiveFilter({ type: filterType, value: filterValue })
    } else {
      setActiveFilter(null)
    }
  }

  return (
    <div className="relative w-full min-h-screen overflow-hidden">
      <div className="absolute inset-0 z-0">
        <Galaxy
          mouseRepulsion={true}
          mouseInteraction={true}
          density={1.8}
          glowIntensity={0.7}
          saturation={0.9}
          hueShift={260}
        />
      </div>
      <div
        className="absolute inset-0 z-5"
        style={{
          background: 'linear-gradient(to bottom, rgba(10,10,15,0.8), rgba(10,10,15,0.95))'
        }}
      />

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="mb-6 flex items-center justify-center">
            <img 
              src="/logo/logo-feed.png" 
              alt="Feed Logo"
              className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 mr-4 object-contain"
              loading="eager"
              decoding="async"
            />
            <Shuffle
              text="FEED"
              shuffleDirection="right"
              duration={0.35}
              animationMode="evenodd"
              shuffleTimes={1}
              ease="power3.out"
              stagger={0.03}
              threshold={0.1}
              loop={true}
              loopDelay={1}
              triggerOnce={false}
              triggerOnHover={false}
              respectReducedMotion={true}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white"
              tag="h1"
            />
          </div>
          <p className="text-lg sm:text-xl text-indigo-200 max-w-2xl mx-auto px-4">
            Stay up to date with the latest games and activity from the community you follow.
          </p>
        </div>

        {/* Main Content Layout */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar - Mobile: Full width, Desktop: 35% width */}
          <div className="w-full lg:w-[35%]">
            <FeedSidebar 
              onFilterChange={handleFilterChange}
              activeFilter={activeFilter}
            />
          </div>

          {/* Feed Content - Mobile: Full width, Desktop: 65% width */}
          <div className="w-full lg:w-[65%]">
            <Feed filter={activeFilter} />
          </div>
        </div>
      </div>
    </div>
  )
}
