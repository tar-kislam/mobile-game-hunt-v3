"use client"

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { UserPlusIcon, UserMinusIcon, LoaderIcon } from 'lucide-react'
import { toast } from 'sonner'
import { motion } from 'framer-motion'

interface FollowButtonProps {
  userId?: string
  username?: string
  className?: string
  userDisplayName?: string
  onFollowChange?: (followersCount: number) => void
}

export function FollowButton({ userId, username, className, userDisplayName, onFollowChange }: FollowButtonProps) {
  const { data: session } = useSession()
  const [isFollowing, setIsFollowing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [checkingStatus, setCheckingStatus] = useState(true)

  // Check follow status on mount
  useEffect(() => {
    const checkFollowStatus = async () => {
      if (!session?.user?.id || (!userId && !username)) {
        setCheckingStatus(false)
        return
      }

      try {
        const endpoint = userId 
          ? `/api/user/${userId}/follow`
          : `/api/user/username/${username}/follow`
        
        const response = await fetch(endpoint)
        const data = await response.json()
        setIsFollowing(data.following || false)
      } catch (error) {
        console.error('Error checking follow status:', error)
      } finally {
        setCheckingStatus(false)
      }
    }

    checkFollowStatus()
  }, [session?.user?.id, userId, username])

  const handleFollowToggle = async () => {
    if (!session?.user?.id) {
      toast.error('Please sign in to follow users')
      return
    }

    if (!userId && !username) {
      toast.error('Invalid user')
      return
    }

    // Optimistic UI update
    const previousState = isFollowing
    setIsFollowing(!isFollowing)
    setLoading(true)

    try {
      const endpoint = userId 
        ? `/api/user/${userId}/follow`
        : `/api/user/username/${username}/follow`

      const response = await fetch(endpoint, {
        method: 'POST'
      })

      let data: any = null
      try {
        data = await response.json()
      } catch (_) {}

      if (!response.ok) {
        // Revert optimistic update on error
        setIsFollowing(previousState)
        const message = data?.error || (response.status === 401 ? 'Please sign in to follow users' : 'Failed to update follow status')
        toast.error(message)
        return
      }

      // Update state based on API response
      setIsFollowing(data.status === 'followed')
      
      // Update followers count if callback provided
      if (onFollowChange && typeof data.followersCount === 'number') {
        onFollowChange(data.followersCount)
      }
      
      // Handle badge notifications
      if (data.newlyAwardedBadges && data.newlyAwardedBadges.length > 0) {
        data.newlyAwardedBadges.forEach((badgeType: string) => {
          const badgeNames: Record<string, string> = {
            'EXPLORER': 'Explorer',
            'RISING_STAR': 'Rising Star',
            'PIONEER': 'Pioneer',
            'WISE_OWL': 'Wise Owl',
            'FIRE_DRAGON': 'Fire Dragon',
            'CLEVER_FOX': 'Clever Fox',
            'GENTLE_PANDA': 'Gentle Panda',
            'SWIFT_PUMA': 'Swift Puma'
          }
          
          const badgeXp: Record<string, number> = {
            'EXPLORER': 100,
            'RISING_STAR': 300,
            'PIONEER': 500,
            'WISE_OWL': 100,
            'FIRE_DRAGON': 200,
            'CLEVER_FOX': 150,
            'GENTLE_PANDA': 120,
            'SWIFT_PUMA': 80
          }
          
          const badgeName = badgeNames[badgeType] || badgeType
          const xpReward = badgeXp[badgeType] || 0
          
          toast.success(`🎉 ${badgeName} Badge unlocked! +${xpReward} XP earned`, {
            duration: 5000,
          })
        })
        
        // Dispatch event to refresh badges UI
        if (typeof window !== 'undefined' && window.dispatchEvent) {
          window.dispatchEvent(new CustomEvent('badge-updated'))
        }
      }
      
      // Show success message
      if (data.status === 'followed') {
        const displayName = userDisplayName || username || 'this user'
        toast.success(`You are now following ${displayName}! +5 XP earned 🚀`, {
          duration: 3500,
        })
      } else {
        const displayName = userDisplayName || username || 'this user'
        toast.success(`You unfollowed ${displayName} ❌`, {
          duration: 3000,
        })
      }
    } catch (error) {
      // Revert optimistic update on error
      setIsFollowing(previousState)
      console.error('Follow error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to update follow status')
    } finally {
      setLoading(false)
    }
  }

  // Hide while checking, or when viewing own profile; show for guests too
  if (
    checkingStatus ||
    (username && session?.user?.username && session.user.username === username) ||
    (userId && session?.user?.id === userId)
  ) {
    return null
  }

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      <Button
        onClick={handleFollowToggle}
        disabled={loading}
        variant={isFollowing ? "outline" : "default"}
        className={`
          ${isFollowing 
            ? 'border-purple-500/50 text-purple-400 hover:bg-purple-500/10 hover:border-purple-400/70 hover:text-purple-300 bg-purple-500/5' 
            : 'bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white border-0 hover:shadow-lg hover:shadow-purple-500/25'
          }
          transition-all duration-300 shadow-lg hover:shadow-xl
          relative overflow-hidden min-w-[120px]
          ${className}
        `}
      >
        {/* Glow effect overlay */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-cyan-400/20 opacity-0"
          whileHover={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        />
        
        {/* Button content */}
        <motion.div 
          className="relative z-10 flex items-center justify-center"
          animate={loading ? { opacity: 0.7 } : { opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          {loading ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="flex items-center"
            >
              <LoaderIcon className="h-4 w-4 mr-2" />
              <span className="font-medium">...</span>
            </motion.div>
          ) : (
            <motion.div
              className="flex items-center"
              initial={false}
              animate={{ 
                scale: 1,
                opacity: 1 
              }}
              transition={{ 
                type: "spring", 
                stiffness: 400, 
                damping: 17,
                duration: 0.3 
              }}
            >
              {isFollowing ? (
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <UserMinusIcon className="h-4 w-4 mr-2" />
                </motion.div>
              ) : (
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <UserPlusIcon className="h-4 w-4 mr-2" />
                </motion.div>
              )}
              <span className="font-medium">
                {isFollowing ? 'Unfollow' : 'Follow'}
              </span>
            </motion.div>
          )}
        </motion.div>
      </Button>
    </motion.div>
  )
}
