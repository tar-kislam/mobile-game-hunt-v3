import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const followSchema = z.object({
  followerId: z.string().min(1),
  followingId: z.string().min(1)
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const body = await request.json()
    const parsed = followSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid payload. followerId and followingId are required.' },
        { status: 400 }
      )
    }

    const { followerId, followingId } = parsed.data

    // Prevent self-follow
    if (followerId === followingId) {
      return NextResponse.json({ error: 'Cannot follow yourself' }, { status: 400 })
    }

    // Check if user to follow exists
    const userToFollow = await prisma.user.findUnique({
      where: { id: followingId },
      select: { id: true, username: true, name: true }
    })

    if (!userToFollow) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
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

      return NextResponse.json({
        success: true,
        status: 'unfollowed'
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

      // Check for badges after successful follow
      try {
        const { checkAndAwardBadges } = await import('@/lib/badgeService')
        await checkAndAwardBadges(followerId) // Check badges for the follower
        await checkAndAwardBadges(followingId) // Check badges for the person being followed
      } catch (badgeError) {
        console.error('Error checking badges:', badgeError)
        // Don't fail the follow if badge checking fails
      }

      return NextResponse.json({
        success: true,
        status: 'followed'
      })
    }

  } catch (error) {
    console.error('Follow error:', error)
    return NextResponse.json(
      { error: 'Failed to follow user' },
      { status: 500 }
    )
  }
}