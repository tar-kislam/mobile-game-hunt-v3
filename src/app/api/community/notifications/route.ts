import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { notificationsQuerySchema } from '@/lib/validations/community'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const validatedQuery = notificationsQuerySchema.parse({
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
      unreadOnly: searchParams.get('unreadOnly'),
    })

    const page = parseInt(validatedQuery.page)
    const limit = parseInt(validatedQuery.limit)
    const skip = (page - 1) * limit
    const unreadOnly = validatedQuery.unreadOnly === 'true'

    // Build where clause
    const where: any = {
      userId: session.user.id
    }

    if (unreadOnly) {
      where.read = false
    }

    // Get notifications with related data
    const notifications = await prisma.notification.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip,
      take: limit
    })

    // Enrich notifications with actor and post/comment data
    const enrichedNotifications = await Promise.all(
      notifications.map(async (notification) => {
        const enriched: any = {
          ...notification,
          actor: null,
          post: null,
          comment: null
        }

        // Get actor info if actorId exists
        if (notification.actorId) {
          const actor = await prisma.user.findUnique({
            where: { id: notification.actorId },
            select: { id: true, name: true, username: true, image: true }
          })
          enriched.actor = actor
        }

        // Get post preview if postId exists
        if (notification.postId) {
          const post = await prisma.post.findUnique({
            where: { id: notification.postId },
            select: {
              id: true,
              content: true,
              createdAt: true
            }
          })
          enriched.post = post
        }

        // Get comment preview if commentId exists
        if (notification.commentId) {
          const comment = await prisma.postComment.findUnique({
            where: { id: notification.commentId },
            select: {
              id: true,
              content: true,
              createdAt: true
            }
          })
          enriched.comment = comment
        }

        return enriched
      })
    )

    const total = await prisma.notification.count({ where })

    // Get unread count
    const unreadCount = await prisma.notification.count({
      where: {
        userId: session.user.id,
        read: false
      }
    })

    return NextResponse.json({
      notifications: enrichedNotifications,
      unreadCount,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Validation error', details: error.message }, { status: 400 })
    }
    console.error('Error fetching notifications:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { notificationIds, markAllAsRead } = body

    if (markAllAsRead) {
      // Mark all notifications as read
      await prisma.notification.updateMany({
        where: {
          userId: session.user.id,
          read: false
        },
        data: {
          read: true
        }
      })

      return NextResponse.json({ message: 'All notifications marked as read' })
    }

    if (notificationIds && Array.isArray(notificationIds)) {
      // Mark specific notifications as read
      await prisma.notification.updateMany({
        where: {
          id: {
            in: notificationIds
          },
          userId: session.user.id
        },
        data: {
          read: true
        }
      })

      return NextResponse.json({ message: 'Notifications marked as read' })
    }

    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  } catch (error) {
    console.error('Error updating notifications:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
