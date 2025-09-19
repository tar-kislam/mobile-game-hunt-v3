import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const markMultipleReadSchema = z.object({
  notificationIds: z.array(z.string()).min(1),
});

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = markMultipleReadSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ 
        error: 'Invalid payload', 
        details: parsed.error.errors 
      }, { status: 400 });
    }

    const { notificationIds } = parsed.data;

    // Mark multiple notifications as read for the current user
    const result = await prisma.notification.updateMany({
      where: {
        id: {
          in: notificationIds
        },
        userId: session.user.id,
        read: false // Only update unread notifications
      },
      data: {
        read: true
      }
    });

    return NextResponse.json({
      success: true,
      updatedCount: result.count,
      message: `Marked ${result.count} notifications as read`
    });

  } catch (error) {
    console.error('Error marking multiple notifications as read:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
