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

type BadgeType = 'WISE_OWL' | 'FIRE_DRAGON' | 'CLEVER_FOX' | 'GENTLE_PANDA' | 'SWIFT_PUMA' | 'EXPLORER' | 'RISING_STAR' | 'PIONEER' | 'FIRST_LAUNCH'

interface BadgeInfo {
  type: BadgeType
  name: string
  description: string
  emoji: string
  color: string
}

const BADGE_CONFIG: Record<BadgeType, BadgeInfo> = {
  WISE_OWL: {
    type: 'WISE_OWL',
    name: 'Wise Owl',
    description: 'Master of wisdom and knowledge sharing',
    emoji: '🦉',
    color: 'text-yellow-500'
  },
  FIRE_DRAGON: {
    type: 'FIRE_DRAGON',
    name: 'Fire Dragon',
    description: 'Creator of legendary games and adventures',
    emoji: '🐉',
    color: 'text-red-500'
  },
  CLEVER_FOX: {
    type: 'CLEVER_FOX',
    name: 'Clever Fox',
    description: 'Sharp-eyed discoverer of hidden gems',
    emoji: '🦊',
    color: 'text-orange-500'
  },
  GENTLE_PANDA: {
    type: 'GENTLE_PANDA',
    name: 'Gentle Panda',
    description: 'Beloved creator with a caring heart',
    emoji: '🐼',
    color: 'text-green-500'
  },
  SWIFT_PUMA: {
    type: 'SWIFT_PUMA',
    name: 'Swift Puma',
    description: 'Fast follower of exciting adventures',
    emoji: '🐆',
    color: 'text-purple-500'
  },
  EXPLORER: {
    type: 'EXPLORER',
    name: 'Explorer',
    description: 'Adventurer who discovers new connections',
    emoji: '🧭',
    color: 'text-blue-500'
  },
  RISING_STAR: {
    type: 'RISING_STAR',
    name: 'Rising Star',
    description: 'Shining beacon that attracts followers',
    emoji: '⭐',
    color: 'text-yellow-400'
  },
  PIONEER: {
    type: 'PIONEER',
    name: 'Pioneer',
    description: 'One of the first 1000 users to join the platform',
    emoji: '🛡️',
    color: 'text-indigo-500'
  },
  FIRST_LAUNCH: {
    type: 'FIRST_LAUNCH',
    name: 'First Launch',
    description: 'Successfully published your first game',
    emoji: '🎯',
    color: 'text-yellow-500'
  }
}

interface UserBadgeProps {
  badge: BadgeType
  className?: string
  isCompleted?: boolean
}

export function UserBadge({ badge, className = "", isCompleted = false }: UserBadgeProps) {
  const badgeInfo = BADGE_CONFIG[badge]

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={`inline-flex items-center justify-center w-7 h-7 rounded-full transition-all duration-200 hover:scale-110 ${
            isCompleted 
              ? 'bg-gradient-to-br from-[#1a1a1a]/70 to-[#2c2c2c]/70 backdrop-blur-[10px] border border-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_0_20px_rgba(147,51,234,0.3)] hover:border-purple-400/30' 
              : 'bg-gray-800/80 border border-gray-600 hover:border-gray-500'
          } ${className}`}>
            <span className={`text-sm ${isCompleted ? 'scale-110 drop-shadow-[0_0_8px_rgba(255,215,0,0.6),0_2px_4px_rgba(0,0,0,0.3)]' : ''}`}>{badgeInfo.emoji}</span>
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="bg-gray-900 border-gray-700 text-white z-[9999]">
          <div className="text-center">
            <div className="font-semibold text-sm">{badgeInfo.name}</div>
            <div className="text-xs text-gray-300 mt-1">{badgeInfo.description}</div>
            {isCompleted && (
              <div className="flex items-center justify-center gap-1 mt-1">
                <Trophy className="h-3 w-3 text-[#FFD700]" />
                <span className="text-xs text-[#FFD700] font-medium">Completed</span>
              </div>
            )}
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
    <div className={`flex items-center gap-2 flex-wrap ${className}`}>
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
