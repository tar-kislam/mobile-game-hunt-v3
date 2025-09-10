import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { toggleLikeSchema } from '@/lib/validations/community'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = toggleLikeSchema.parse(body)
    const { postId } = validatedData

    // Check if post exists
    const post = await prisma.post.findUnique({
      where: { id: postId }
    })

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    // Check if user already liked this post
    const existingLike = await prisma.like.findUnique({
      where: {
        userId_postId: {
          userId: session.user.id,
          postId: postId
        }
      }
    })

    if (existingLike) {
      // Unlike the post
      await prisma.like.delete({
        where: {
          userId_postId: {
            userId: session.user.id,
            postId: postId
          }
        }
      })

      // Create notification for post author (if not the same user)
      if (post.userId !== session.user.id) {
        await prisma.notification.create({
          data: {
            userId: post.userId,
            type: 'like',
            postId: postId,
            message: `${session.user.name || 'Someone'} unliked your post`,
            isRead: false
          }
        })
      }

      return NextResponse.json({ 
        liked: false, 
        message: 'Post unliked successfully' 
      })
    } else {
      // Like the post
      await prisma.like.create({
        data: {
          userId: session.user.id,
          postId: postId
        }
      })

      // Create notification for post author (if not the same user)
      if (post.userId !== session.user.id) {
        await prisma.notification.create({
          data: {
            userId: post.userId,
            type: 'like',
            postId: postId,
            message: `${session.user.name || 'Someone'} liked your post`,
            isRead: false
          }
        })
      }

      return NextResponse.json({ 
        liked: true, 
        message: 'Post liked successfully' 
      })
    }
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Validation error', details: error.message }, { status: 400 })
    }
    console.error('Error toggling like:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
