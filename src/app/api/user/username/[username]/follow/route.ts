import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const followerId = session.user.id

    // Find user to follow by username
    const userToFollow = await prisma.user.findUnique({
      where: { username },
      select: { id: true, username: true, name: true }
    })

    if (!userToFollow) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const followingId = userToFollow.id

    // Prevent self-follow
    if (followerId === followingId) {
      return NextResponse.json({ error: 'Cannot follow yourself' }, { status: 400 })
    }

    // Check if already following
    const existingFollow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId,
          followingId
        }
      }
    })

    if (existingFollow) {
      // Unfollow (toggle logic)
      await prisma.follow.delete({
        where: {
          id: existingFollow.id
        }
      })

      // Get updated followers count
      const followersCount = await prisma.follow.count({
        where: { followingId }
      })

      return NextResponse.json({
        success: true,
        status: 'unfollowed',
        followersCount
      })
    } else {
      // Follow
      await prisma.follow.create({
        data: {
          followerId,
          followingId
        }
      })

      // Send follow notification
      try {
        const follower = await prisma.user.findUnique({
          where: { id: followerId },
          select: { username: true, name: true }
        })

        if (follower) {
          await prisma.notification.create({
            data: {
              userId: followingId,
              message: `${follower.name || follower.username || 'Someone'} started following you 🎮`,
              type: 'follow'
            }
          })
        }
      } catch (notificationError) {
        console.error('Error creating follow notification:', notificationError)
        // Don't fail the follow if notification fails
      }

      // Get updated followers count
      const followersCount = await prisma.follow.count({
        where: { followingId }
      })

      // Check for badges after successful follow
      try {
        const { checkAndAwardBadges } = await import('@/lib/badgeService')
        const newlyAwardedBadges = await checkAndAwardBadges(followerId) // Check badges for the follower
        await checkAndAwardBadges(followingId) // Check badges for the person being followed
        
        // Return newly awarded badges for frontend notification
        return NextResponse.json({
          success: true,
          status: 'followed',
          followersCount,
          newlyAwardedBadges
        })
      } catch (badgeError) {
        console.error('Error checking badges:', badgeError)
        // Don't fail the follow if badge checking fails
        return NextResponse.json({
          success: true,
          status: 'followed',
          followersCount
        })
      }
    }

  } catch (error) {
    console.error('Follow error:', error)
    return NextResponse.json(
      { error: 'Failed to follow user' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ following: false })
    }

    const followerId = session.user.id

    // Find user by username
    const user = await prisma.user.findUnique({
      where: { username },
      select: { id: true }
    })

    if (!user) {
      return NextResponse.json({ following: false })
    }

    // Check if following
    const follow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId,
          followingId: user.id
        }
      }
    })

    return NextResponse.json({
      following: !!follow
    })

  } catch (error) {
    console.error('Follow status check error:', error)
    return NextResponse.json({ following: false })
  }
}



