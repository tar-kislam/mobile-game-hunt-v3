import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  context: any
) {
  const params = (context?.params || {}) as { id: string }
  try {
    const { id: userId } = params;

    // Verify the user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, username: true, name: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get followers count
    const followersCount = await prisma.follow.count({
      where: { followingId: userId }
    });

    // Get following count
    const followingCount = await prisma.follow.count({
      where: { followerId: userId }
    });

    return NextResponse.json({
      userId,
      followersCount,
      followingCount,
      user: {
        id: user.id,
        username: user.username,
        name: user.name
      }
    });
  } catch (error) {
    console.error('Error fetching follow counts:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
