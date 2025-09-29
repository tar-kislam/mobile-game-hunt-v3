"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Progress } from "@/components/ui/progress"
import { UserBadges, LevelBadge } from "@/components/ui/user-badges"
import { Trophy } from "lucide-react"
import Link from "next/link"
import useSWR from 'swr'
import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { calculateLevelProgress } from "@/lib/xpCalculator"
import { useXP } from "@/hooks/useXP"

interface UserAvatarTooltipProps {
  userId: string
  userName: string | null
  userImage: string | null
  userUsername?: string | null
  className?: string
  size?: "sm" | "md" | "lg"
}

export function UserAvatarTooltip({ 
  userId, 
  userName, 
  userImage, 
  userUsername,
  className = "",
  size = "md"
}: UserAvatarTooltipProps) {
  const { data: session } = useSession()
  const [isHovered, setIsHovered] = useState(false)
  const fetcher = (url: string) => fetch(url).then(r => r.json())
  
  // Use centralized XP hook for synchronized data
  const { xpData, levelProgress } = useXP(userId)
  
  // Fetch badges data for the specific user
  const { data: userBadges, mutate: mutateBadges } = useSWR(`/api/user/${userId}/badges`, fetcher)

  // Listen for badge updates
  useEffect(() => {
    const handleBadgeUpdate = () => {
      mutateBadges()
    }

    window.addEventListener('badge-updated', handleBadgeUpdate)
    return () => window.removeEventListener('badge-updated', handleBadgeUpdate)
  }, [mutateBadges])

  // Determine profile link - use username-based routing if available
  const profileLink = session?.user?.id === userId 
    ? '/profile' 
    : userUsername 
      ? `/@${userUsername}` 
      : `/${userId}`

  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10", 
    lg: "h-12 w-12"
  }

  const avatarSize = sizeClasses[size]

  return (
    <TooltipProvider>
      <Tooltip open={isHovered} onOpenChange={setIsHovered}>
        <TooltipTrigger asChild>
          <Link href={profileLink}>
            <Avatar 
              className={`${avatarSize} cursor-pointer hover:ring-2 hover:ring-purple-500/50 transition-all duration-200 ${className}`}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              <AvatarImage src={userImage || ''} />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                {userName?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
          </Link>
        </TooltipTrigger>
        <TooltipContent 
          side="bottom" 
          className="bg-gray-900/95 backdrop-blur-sm border-gray-700 text-white p-4 w-72 z-[9999] overflow-visible"
          sideOffset={8}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div 
            className="space-y-3"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {/* User Info */}
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={userImage || ''} />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-sm">
                  {userName?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="font-semibold text-sm">{userName || 'Anonymous'}</div>
                {levelProgress && <LevelBadge level={levelProgress.level} className="mt-1" />}
              </div>
            </div>

            {/* XP Progress */}
            {levelProgress && (() => {
              const progressPercentage = Math.round((levelProgress.currentXP / levelProgress.requiredXP) * 100)
              
              return (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-300">Experience Points</span>
                    <span className="text-purple-300 font-medium">
                      {levelProgress.currentXP} / {levelProgress.requiredXP} XP
                    </span>
                  </div>
                  <Progress 
                    value={progressPercentage} 
                    className="h-2 bg-gray-700 rounded-full"
                  />
                  <div className="text-xs text-gray-400 text-center">
                    {levelProgress.remainingXP} XP to Level {levelProgress.level + 1}
                  </div>
                </div>
              )
            })()}

            {/* Badges */}
            {userBadges && userBadges.length > 0 && (
              <div className="space-y-2">
                <div className="text-xs text-gray-400 font-medium">Earned Badges</div>
                <div className="flex items-center gap-2 flex-wrap overflow-visible">
                  {userBadges.map((badge: any) => {
                    const isCompleted = badge.isCompleted || (!badge.locked && badge.progress?.pct >= 100)
                    
                    return (
                      <div 
                        key={badge.code}
                        className={`w-8 h-8 flex items-center justify-center rounded-full transition-all duration-200 hover:scale-110 cursor-pointer shadow-lg group relative ${
                          isCompleted 
                            ? 'bg-gradient-to-br from-[#1a1a1a]/70 to-[#2c2c2c]/70 backdrop-blur-[10px] border border-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_0_20px_rgba(147,51,234,0.3)] hover:border-purple-400/30' 
                            : 'bg-gradient-to-br from-purple-600/20 to-blue-600/20 border border-purple-500/30 hover:border-purple-400/60 hover:shadow-purple-500/25'
                        }`}
                        title={`${badge.title}: ${badge.description}`}
                      >
                        <span className={`text-sm ${isCompleted ? 'scale-110 drop-shadow-[0_0_8px_rgba(255,215,0,0.6),0_2px_4px_rgba(0,0,0,0.3)]' : ''}`}>{badge.emoji}</span>
                        {/* Badge tooltip */}
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900/95 backdrop-blur-sm border border-gray-600 rounded-lg text-white text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-[99999] shadow-2xl">
                          <div className="font-semibold">{badge.title}</div>
                          <div className="text-gray-300">{badge.description}</div>
                          {isCompleted && (
                            <div className="flex items-center justify-center gap-1 mt-1">
                              <Trophy className="h-3 w-3 text-[#FFD700]" />
                              <span className="text-xs text-[#FFD700] font-medium">Completed</span>
                            </div>
                          )}
                          {/* Arrow */}
                          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-600"></div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
            
            {/* Click to view profile */}
            <div className="text-xs text-gray-400 text-center pt-2 border-t border-gray-700">
              Click to view full profile
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
