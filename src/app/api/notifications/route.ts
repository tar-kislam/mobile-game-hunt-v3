import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const notificationSchema = z.object({
  userId: z.string().min(1),
  type: z.enum(['follow', 'comment', 'vote', 'mention', 'system', 'LEVEL_UP', 'badge', 'xp', 'level_up']),
  fromUserId: z.string().min(1).optional(),
  message: z.string().min(1).optional(),
  productId: z.string().min(1).optional(),
  title: z.string().optional(),
  meta: z.any().optional(),
  link: z.string().optional(),
  icon: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = notificationSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ 
        error: 'Invalid payload', 
        details: parsed.error.issues 
      }, { status: 400 });
    }

    const { userId, type, fromUserId, message, productId, title, meta, link, icon } = parsed.data;

    // Verify the user exists
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, username: true, name: true }
    });

    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Generate message based on type if not provided
    let notificationMessage = message;
    if (!notificationMessage && fromUserId) {
      const fromUser = await prisma.user.findUnique({
        where: { id: fromUserId },
        select: { username: true, name: true }
      });

      if (fromUser) {
        const displayName = fromUser.name || fromUser.username || 'Someone';
        
        switch (type) {
          case 'follow':
            notificationMessage = `${displayName} started following you`;
            break;
          case 'comment':
            notificationMessage = `${displayName} commented on your game 💬`;
            break;
          case 'vote':
            notificationMessage = `${displayName} voted on your game ⭐`;
            break;
          case 'mention':
            notificationMessage = `${displayName} mentioned you in a comment 📝`;
            break;
          case 'badge':
            notificationMessage = `🎖️ Congratulations! You earned a new badge!`;
            break;
          case 'xp':
            notificationMessage = `⚡️ You gained XP from an activity!`;
            break;
          case 'level_up':
          case 'LEVEL_UP':
            notificationMessage = `🏆 Level Up! You reached a new level! 🚀`;
            break;
          case 'system':
            notificationMessage = `🔔 System notification`;
            break;
          default:
            notificationMessage = `${displayName} interacted with your content 🔔`;
        }
      }
    }

    if (!notificationMessage) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Create the notification
    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        message: notificationMessage,
        title: title || null,
        meta: meta || null,
        link: link || null,
        icon: icon || null,
      },
    });

    return NextResponse.json({
      success: true,
      notification: {
        id: notification.id,
        userId: notification.userId,
        type: notification.type,
        message: notification.message,
        read: notification.read,
        createdAt: notification.createdAt,
      },
    });
  } catch (error) {
    console.error('Notification creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    const notifications = await prisma.notification.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    });

    const totalNotifications = await prisma.notification.count({
      where: { userId: session.user.id },
    });

    const unreadCount = await prisma.notification.count({
      where: { 
        userId: session.user.id,
        read: false 
      },
    });

    return NextResponse.json({
      notifications,
      pagination: {
        page,
        limit,
        total: totalNotifications,
        pages: Math.ceil(totalNotifications / limit),
      },
      unreadCount,
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}