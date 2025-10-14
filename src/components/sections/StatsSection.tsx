"use client"

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { LuGamepad2 } from 'react-icons/lu'
import { IoPeople } from 'react-icons/io5'
import { HiOutlineChat } from 'react-icons/hi'
import { useAnimatedCounter, formatStatNumber } from '@/hooks/useAnimatedCounter'

interface StatsData {
  games: number
  members: number
  reviews: number
}

export function StatsSection() {
  const [stats, setStats] = useState<StatsData>({ games: 100, members: 1000, reviews: 250 })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        console.log('[StatsSection] 🔄 Fetching stats from /api/stats...')
        const response = await fetch('/api/stats', { 
          cache: 'no-store',
          headers: {
            'Content-Type': 'application/json',
          }
        })
        console.log('[StatsSection] 📡 Response status:', response.status, response.ok)
        
        if (response.ok) {
          const data = await response.json()
          console.log('[StatsSection] ✅ Received real data:', data)
          setStats(data)
          setIsLoading(false)
        } else {
          console.error('[StatsSection] ❌ Response not OK:', response.status, response.statusText)
          setIsLoading(false)
        }
      } catch (error) {
        console.error('[StatsSection] ❌ Fetch error:', error)
        setIsLoading(false)
      }
    }

    // Initial fetch
    console.log('[StatsSection] 🚀 Component mounted, starting initial fetch')
    fetchStats()

    // Refresh every 30 seconds
    const interval = setInterval(() => {
      console.log('[StatsSection] ⏰ 30-second interval triggered')
      fetchStats()
    }, 30000)

    return () => {
      console.log('[StatsSection] 🛑 Component unmounting, clearing interval')
      clearInterval(interval)
    }
  }, [])

  console.log('[StatsSection] 📊 Current stats:', stats)

  // Animated counters with proper values
  const gamesAnimated = useAnimatedCounter({ 
    value: stats.games, 
    formatValue: formatStatNumber,
    duration: 1500
  })
  const membersAnimated = useAnimatedCounter({ 
    value: stats.members, 
    formatValue: formatStatNumber,
    duration: 1500
  })
  const reviewsAnimated = useAnimatedCounter({ 
    value: stats.reviews, 
    formatValue: formatStatNumber,
    duration: 1500
  })

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.7 }}
      className="flex flex-col sm:flex-row gap-6 sm:gap-8 items-center justify-center w-full mt-8"
    >
      {/* Stat 1 - Games */}
      <section className="text-center hover:scale-105 transition-all duration-300">
        <div className="mb-1 sm:mb-2 flex justify-center">
          <div className="text-base sm:text-3xl drop-shadow-[0_0_4px_rgba(168,85,247,0.6)] sm:drop-shadow-[0_0_6px_rgba(168,85,247,0.8)]" style={{ color: '#a855f7' }}>
            <LuGamepad2 />
          </div>
        </div>
        <div className="text-sm sm:text-2xl font-bold text-white mb-0.5 sm:mb-1">
          {gamesAnimated}
        </div>
        <p className="text-xs sm:text-sm text-gray-400 leading-tight">Curated Games</p>
      </section>

      {/* Stat 2 - Members */}
      <section className="text-center hover:scale-105 transition-all duration-300">
        <div className="mb-1 sm:mb-2 flex justify-center">
          <div className="text-base sm:text-3xl drop-shadow-[0_0_4px_rgba(168,85,247,0.6)] sm:drop-shadow-[0_0_6px_rgba(168,85,247,0.8)]" style={{ color: '#a855f7' }}>
            <IoPeople />
          </div>
        </div>
        <div className="text-sm sm:text-2xl font-bold text-white mb-0.5 sm:mb-1">
          {membersAnimated}
        </div>
        <p className="text-xs sm:text-sm text-gray-400 leading-tight">Community Members</p>
      </section>

      {/* Stat 3 - Reviews */}
      <section className="text-center hover:scale-105 transition-all duration-300">
        <div className="mb-1 sm:mb-2 flex justify-center">
          <div className="text-base sm:text-3xl drop-shadow-[0_0_4px_rgba(168,85,247,0.6)] sm:drop-shadow-[0_0_6px_rgba(168,85,247,0.8)]" style={{ color: '#a855f7' }}>
            <HiOutlineChat />
          </div>
        </div>
        <div className="text-sm sm:text-2xl font-bold text-white mb-0.5 sm:mb-1">
          {reviewsAnimated}
        </div>
        <p className="text-xs sm:text-sm text-gray-400 leading-tight">User Reviews</p>
      </section>
    </motion.div>
  )
}
