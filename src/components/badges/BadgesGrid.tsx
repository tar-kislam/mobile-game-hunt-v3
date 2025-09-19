"use client"

import { useEffect } from "react"
import useSWR from "swr"
import { BadgeCard } from "./BadgeCard"
import { toast } from "sonner"

async function fetcher(url: string) {
  try {
    const res = await fetch(url, {
      redirect: 'manual' // Don't follow redirects automatically
    })
    
    if (res.status === 401 || res.status === 307) {
      // User not authenticated or redirected to sign-in, return empty array
      return []
    }
    
    if (!res.ok) {
      throw new Error("Failed to load badges")
    }
    
    const data = await res.json()
    
    // Ensure we always return an array
    if (Array.isArray(data)) {
      return data
    } else if (data && typeof data === 'object') {
      // If it's an object, try to extract values
      return Object.values(data)
    } else {
      // Fallback to empty array
      return []
    }
  } catch (error) {
    // If there's any error (including network errors), return empty array
    console.warn('Badges fetch error:', error)
    return []
  }
}

export function BadgesGrid() {
  const { data, error, mutate } = useSWR("/api/badges", fetcher, {
    refreshInterval: 5000, // Refresh every 5 seconds for real-time updates
    revalidateOnFocus: true,
    revalidateOnReconnect: true
  })

  // Listen for badge updates from follow actions
  useEffect(() => {
    const handleBadgeUpdate = () => {
      mutate() // Refresh badges data
    }

    window.addEventListener('badge-updated', handleBadgeUpdate)
    return () => window.removeEventListener('badge-updated', handleBadgeUpdate)
  }, [mutate])

  if (error) return <div className="text-red-500">Failed to load badges</div>
  if (!data) return <div className="text-white/60">Loading badges...</div>
  
  // Defensive handling: ensure data is always an array
  const rawBadges = Array.isArray(data) ? data : Object.values(data || {});
  
  // Filter out invalid badge objects and ensure they have required properties
  const badges = rawBadges.filter((badge: any) => 
    badge && 
    typeof badge === 'object' && 
    badge.title && 
    badge.emoji
  );
  
  // Handle empty badges
  if (!badges || badges.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-400 mb-4">
          <p className="text-lg font-medium">No badges yet</p>
          <p className="text-sm">Earn badges by participating in the community!</p>
        </div>
      </div>
    )
  }

  const handleClaim = async (badgeCode: string, badgeTitle: string, xp: number) => {
    try {
      const response = await fetch("/api/badges/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ badgeCode })
      })

      if (!response.ok) {
        throw new Error("Failed to claim badge")
      }

      const result = await response.json()
      
      // Show success toast
      toast.success(`🎉 You unlocked ${badgeTitle} and earned +${xp} XP!`, {
        description: "Your progress has been updated",
        duration: 5000,
      })

      // Refresh badges data
      mutate()
      
      // Also refresh XP data if available
      if (typeof window !== 'undefined' && window.dispatchEvent) {
        window.dispatchEvent(new CustomEvent('xp-updated'))
      }
    } catch (error) {
      console.error('Error claiming badge:', error)
      toast.error("Failed to claim badge", {
        description: "Please try again later",
        duration: 3000,
      })
    }
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-8">
      {badges.map((badge: any, index: number) => {
        // Create a unique key - prioritize code, then title, then index
        const uniqueKey = badge?.code || badge?.title || `badge-${index}`
        
        return (
          <BadgeCard
            key={uniqueKey}
            title={badge.title}
            emoji={badge.emoji}
            description={badge.description}
            progress={badge.progress}
            xp={badge.xp}
            locked={badge.locked}
            claimable={badge.claimable}
            badgeCode={badge.code}
            isCompleted={badge.isCompleted}
            onClaim={(code) => handleClaim(code, badge.title, badge.xp)}
          />
        )
      })}
    </div>
  )
}
