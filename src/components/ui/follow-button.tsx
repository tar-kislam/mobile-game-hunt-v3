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

        // Proactively refresh XP UI immediately (avoid waiting for polling)
        if (typeof window !== 'undefined' && window.dispatchEvent && session?.user?.id) {
          window.dispatchEvent(new CustomEvent('xp-updated', {
            detail: { userId: session.user.id }
          }))
        }
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
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="relative"
    >
      {/* Outer glow ring */}
      <motion.div
        className="absolute -inset-1 rounded-full opacity-0"
        animate={{
          background: isFollowing 
            ? 'linear-gradient(45deg, rgba(168, 85, 247, 0.4), rgba(236, 72, 153, 0.4))'
            : 'linear-gradient(45deg, rgba(168, 85, 247, 0.6), rgba(6, 182, 212, 0.6))'
        }}
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      />
      
      <Button
        onClick={handleFollowToggle}
        disabled={loading}
        variant="ghost"
        className={`
          relative overflow-hidden rounded-full px-8 py-4 h-auto
          backdrop-blur-md border border-white/20
          ${isFollowing 
            ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 text-purple-300 hover:text-purple-200' 
            : 'bg-gradient-to-r from-purple-600/30 to-cyan-600/30 hover:from-purple-600/40 hover:to-cyan-600/40 text-white hover:text-white'
          }
          transition-all duration-300 ease-out
          hover:shadow-2xl hover:shadow-purple-500/25
          hover:border-white/30
          min-w-[140px] font-semibold text-base
          ${className}
        `}
      >
        {/* Animated background particles */}
        <motion.div
          className="absolute inset-0 rounded-full"
          animate={{
            background: isFollowing 
              ? 'radial-gradient(circle at 30% 20%, rgba(168, 85, 247, 0.1) 0%, transparent 50%), radial-gradient(circle at 70% 80%, rgba(236, 72, 153, 0.1) 0%, transparent 50%)'
              : 'radial-gradient(circle at 30% 20%, rgba(168, 85, 247, 0.15) 0%, transparent 50%), radial-gradient(circle at 70% 80%, rgba(6, 182, 212, 0.15) 0%, transparent 50%)'
          }}
          transition={{ duration: 0.5 }}
        />
        
        {/* Shimmer effect */}
        <motion.div
          className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/10 to-transparent"
          initial={{ x: '-100%' }}
          whileHover={{ x: '100%' }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
        />
        
        {/* Button content */}
        <motion.div 
          className="relative z-10 flex items-center justify-center gap-3"
          animate={loading ? { opacity: 0.8 } : { opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          {loading ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="flex items-center gap-3"
            >
              <LoaderIcon className="h-5 w-5" />
              <span className="font-semibold">Loading...</span>
            </motion.div>
          ) : (
            <motion.div
              className="flex items-center gap-3"
              initial={false}
              animate={{ 
                scale: 1,
                opacity: 1 
              }}
              transition={{ 
                type: "spring", 
                stiffness: 300, 
                damping: 20,
                duration: 0.4 
              }}
            >
              {isFollowing ? (
                <motion.div
                  whileHover={{ scale: 1.15, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 400, damping: 15 }}
                  className="p-1 rounded-full bg-purple-500/20"
                >
                  <UserMinusIcon className="h-5 w-5" />
                </motion.div>
              ) : (
                <motion.div
                  whileHover={{ scale: 1.15, rotate: -5 }}
                  transition={{ type: "spring", stiffness: 400, damping: 15 }}
                  className="p-1 rounded-full bg-gradient-to-r from-purple-500/20 to-cyan-500/20"
                >
                  <UserPlusIcon className="h-5 w-5" />
                </motion.div>
              )}
              <span className="font-semibold tracking-wide">
                {isFollowing ? 'Unfollow' : 'Follow'}
              </span>
            </motion.div>
          )}
        </motion.div>
      </Button>
    </motion.div>
  )
}
