"use client"

import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { 
  Trophy, 
  Target, 
  Compass, 
  Hammer,
  Star
} from "lucide-react"

type BadgeType = 'EARLY_HUNTER' | 'TOP_VOTER' | 'EXPLORER' | 'BUILDER'

interface BadgeInfo {
  type: BadgeType
  name: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  color: string
}

const BADGE_CONFIG: Record<BadgeType, BadgeInfo> = {
  EARLY_HUNTER: {
    type: 'EARLY_HUNTER',
    name: 'Early Hunter',
    description: 'One of the first users to join the platform',
    icon: Target,
    color: 'text-yellow-500'
  },
  TOP_VOTER: {
    type: 'TOP_VOTER',
    name: 'Top Voter',
    description: 'Consistently votes on quality games',
    icon: Trophy,
    color: 'text-purple-500'
  },
  EXPLORER: {
    type: 'EXPLORER',
    name: 'Explorer',
    description: 'Discovers and shares new games',
    icon: Compass,
    color: 'text-blue-500'
  },
  BUILDER: {
    type: 'BUILDER',
    name: 'Builder',
    description: 'Creates and submits games to the platform',
    icon: Hammer,
    color: 'text-green-500'
  }
}

interface UserBadgeProps {
  badge: BadgeType
  className?: string
}

export function UserBadge({ badge, className = "" }: UserBadgeProps) {
  const badgeInfo = BADGE_CONFIG[badge]
  const IconComponent = badgeInfo.icon

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={`inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-800 border border-gray-600 hover:border-gray-500 transition-colors ${className}`}>
            <IconComponent className={`h-3 w-3 ${badgeInfo.color}`} />
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="bg-gray-900 border-gray-700 text-white">
          <div className="text-center">
            <div className="font-semibold text-sm">{badgeInfo.name}</div>
            <div className="text-xs text-gray-300 mt-1">{badgeInfo.description}</div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

interface UserBadgesProps {
  badges: BadgeType[]
  className?: string
}

export function UserBadges({ badges, className = "" }: UserBadgesProps) {
  if (!badges || badges.length === 0) {
    return null
  }

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {badges.map((badge) => (
        <UserBadge key={badge} badge={badge} />
      ))}
    </div>
  )
}

interface LevelBadgeProps {
  level: number
  className?: string
}

export function LevelBadge({ level, className = "" }: LevelBadgeProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge 
            variant="secondary" 
            className={`bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-purple-300 border-purple-500/30 rounded-full px-2 py-1 text-xs ${className}`}
          >
            <Star className="h-3 w-3 mr-1" />
            Level {level}
          </Badge>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="bg-gray-900 border-gray-700 text-white">
          <div className="text-center">
            <div className="font-semibold text-sm">Level {level}</div>
            <div className="text-xs text-gray-300 mt-1">Your current level based on XP</div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
