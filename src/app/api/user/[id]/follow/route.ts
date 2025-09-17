import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: followingId } = await params
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const followerId = session.user.id

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
      return NextResponse.json({ error: 'Already following this user' }, { status: 400 })
    }

    // Create follow relationship
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
            message: `${follower.name || follower.username || 'Someone'} started following you!`,
            type: 'follow'
          }
        })
      }
    } catch (notificationError) {
      console.error('Error creating follow notification:', notificationError)
      // Don't fail the follow if notification fails
    }

    return NextResponse.json({
      message: 'Successfully followed user',
      following: true
    })

  } catch (error) {
    console.error('Follow error:', error)
    return NextResponse.json(
      { error: 'Failed to follow user' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: followingId } = await params
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const followerId = session.user.id

    // Find and delete the follow relationship
    const follow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId,
          followingId
        }
      }
    })

    if (!follow) {
      return NextResponse.json({ error: 'Not following this user' }, { status: 400 })
    }

    await prisma.follow.delete({
      where: {
        id: follow.id
      }
    })

    return NextResponse.json({
      message: 'Successfully unfollowed user',
      following: false
    })

  } catch (error) {
    console.error('Unfollow error:', error)
    return NextResponse.json(
      { error: 'Failed to unfollow user' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: followingId } = await params
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ following: false })
    }

    const followerId = session.user.id

    // Check if following
    const follow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId,
          followingId
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

