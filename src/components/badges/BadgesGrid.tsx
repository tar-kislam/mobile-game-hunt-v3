"use client"

import useSWR from "swr"
import { BadgeCard } from "./BadgeCard"
import { toast } from "sonner"

async function fetcher(url: string) {
  const res = await fetch(url)
  if (!res.ok) throw new Error("Failed to load badges")
  return res.json()
}

export function BadgesGrid() {
  const { data, error, mutate } = useSWR("/api/badges", fetcher, {
    refreshInterval: 5000, // Refresh every 5 seconds for real-time updates
    revalidateOnFocus: true,
    revalidateOnReconnect: true
  })

  if (error) return <div className="text-red-500">Failed to load badges</div>
  if (!data) return <div className="text-white/60">Loading badges...</div>

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
      {data.map((badge: any) => (
        <BadgeCard
          key={badge.code}
          title={badge.title}
          emoji={badge.emoji}
          description={badge.description}
          progress={badge.progress}
          xp={badge.xp}
          locked={badge.locked}
          claimable={badge.claimable}
          badgeCode={badge.code}
          onClaim={(code) => handleClaim(code, badge.title, badge.xp)}
        />
      ))}
    </div>
  )
}
