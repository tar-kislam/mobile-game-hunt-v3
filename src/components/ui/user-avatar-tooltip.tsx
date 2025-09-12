"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Progress } from "@/components/ui/progress"
import { UserBadges, LevelBadge } from "@/components/ui/user-badges"
import Link from "next/link"
import useSWR from 'swr'

interface UserAvatarTooltipProps {
  userId: string
  userName: string | null
  userImage: string | null
  className?: string
  size?: "sm" | "md" | "lg"
}

export function UserAvatarTooltip({ 
  userId, 
  userName, 
  userImage, 
  className = "",
  size = "md"
}: UserAvatarTooltipProps) {
  const fetcher = (url: string) => fetch(url).then(r => r.json())
  
  // Fetch XP data
  const { data: xpData } = useSWR(`/api/user/${userId}/xp`, fetcher)
  
  // Fetch badges data
  const { data: badgesData } = useSWR('/api/badges', fetcher)
  
  // Get user's badges
  const userBadges = badgesData?.users?.find((u: any) => u.userId === userId)?.badges || []

  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10", 
    lg: "h-12 w-12"
  }

  const avatarSize = sizeClasses[size]

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link href={`/profile/${userId}`}>
            <Avatar className={`${avatarSize} cursor-pointer hover:ring-2 hover:ring-purple-500/50 transition-all duration-200 ${className}`}>
              <AvatarImage src={userImage || ''} />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                {userName?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
          </Link>
        </TooltipTrigger>
        <TooltipContent 
          side="bottom" 
          className="bg-gray-900 border-gray-700 text-white p-4 w-64"
          sideOffset={8}
        >
          <div className="space-y-3">
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
                {xpData && <LevelBadge level={xpData.level} className="mt-1" />}
              </div>
            </div>

            {/* XP Progress */}
            {xpData && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-300">Experience Points</span>
                  <span className="text-purple-300 font-medium">
                    {xpData.xp} / {(xpData.level * 100)} XP
                  </span>
                </div>
                <Progress 
                  value={xpData.xpProgress} 
                  className="h-2 bg-gray-700 rounded-full"
                />
                <div className="text-xs text-gray-400 text-center">
                  {xpData.xpToNextLevel} XP to Level {xpData.level + 1}
                </div>
              </div>
            )}

            {/* Badges */}
            {userBadges.length > 0 && (
              <div className="space-y-2">
                <div className="text-xs text-gray-400">Earned Badges</div>
                <UserBadges badges={userBadges} />
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
