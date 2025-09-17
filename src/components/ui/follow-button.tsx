"use client"

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { UserPlusIcon, UserMinusIcon, LoaderIcon } from 'lucide-react'
import { toast } from 'sonner'

interface FollowButtonProps {
  userId?: string
  username?: string
  className?: string
}

export function FollowButton({ userId, username, className }: FollowButtonProps) {
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

    setLoading(true)

    try {
      const endpoint = userId 
        ? `/api/user/${userId}/follow`
        : `/api/user/username/${username}/follow`

      const response = await fetch(endpoint, {
        method: isFollowing ? 'DELETE' : 'POST'
      })

      let data: any = null
      try {
        data = await response.json()
      } catch (_) {}

      if (!response.ok) {
        const message = data?.error || (response.status === 401 ? 'Please sign in to follow users' : 'Failed to update follow status')
        toast.error(message)
        return
      }

      setIsFollowing(data.following)
      toast.success(data.message)
    } catch (error) {
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
    <Button
      onClick={handleFollowToggle}
      disabled={loading}
      variant={isFollowing ? "outline" : "default"}
      className={`
        ${isFollowing 
          ? 'border-purple-500/50 text-purple-400 hover:bg-purple-500/10' 
          : 'bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white border-0'
        }
        transition-all duration-200 shadow-lg hover:shadow-xl
        ${className}
      `}
    >
      {loading ? (
        <LoaderIcon className="h-4 w-4 animate-spin mr-2" />
      ) : isFollowing ? (
        <UserMinusIcon className="h-4 w-4 mr-2" />
      ) : (
        <UserPlusIcon className="h-4 w-4 mr-2" />
      )}
      {loading ? 'Loading...' : isFollowing ? 'Unfollow' : 'Follow'}
    </Button>
  )
}
