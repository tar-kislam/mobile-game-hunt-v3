import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '5');
    const userId = searchParams.get('userId') || session.user.id;

    // Get users that the current user is following
    const following = await prisma.follow.findMany({
      where: { followerId: userId },
      select: { followingId: true }
    });

    const followingIds = following.map(f => f.followingId);

    if (followingIds.length === 0) {
      // If user follows no one, suggest popular users
      const popularUsers = await prisma.user.findMany({
        where: {
          id: { not: userId }, // Don't suggest self
          username: { not: null }
        },
        select: {
          id: true,
          username: true,
          name: true,
          image: true,
          _count: {
            select: {
              followers: true // Count followers
            }
          }
        },
        orderBy: {
          followers: {
            _count: 'desc'
          }
        },
        take: limit
      });

      return NextResponse.json({
        recommendations: popularUsers.map(user => ({
          id: user.id,
          username: user.username,
          name: user.name,
          image: user.image,
          followersCount: user._count.followers,
          reason: 'Popular users'
        }))
      });
    }

    // Find users that are followed by the people the current user follows
    const mutualConnections = await prisma.follow.findMany({
      where: {
        followerId: { in: followingIds },
        followingId: { 
          notIn: [...followingIds, userId] // Don't suggest already followed or self
        }
      },
      select: {
        followingId: true,
        followerId: true
      }
    });

    // Count how many mutual connections each user has
    const mutualCounts = mutualConnections.reduce((acc, connection) => {
      const userId = connection.followingId;
      acc[userId] = (acc[userId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Get user details for recommendations
    const recommendedUserIds = Object.keys(mutualCounts)
      .sort((a, b) => mutualCounts[b] - mutualCounts[a])
      .slice(0, limit);

    if (recommendedUserIds.length === 0) {
      // Fallback to popular users if no mutual connections
      const popularUsers = await prisma.user.findMany({
        where: {
          id: { 
            notIn: [...followingIds, userId]
          },
          username: { not: null }
        },
        select: {
          id: true,
          username: true,
          name: true,
          image: true,
          _count: {
            select: {
              followers: true
            }
          }
        },
        orderBy: {
          followers: {
            _count: 'desc'
          }
        },
        take: limit
      });

      return NextResponse.json({
        recommendations: popularUsers.map(user => ({
          id: user.id,
          username: user.username,
          name: user.name,
          image: user.image,
          followersCount: user._count.followers,
          reason: 'Popular users'
        }))
      });
    }

    const recommendedUsers = await prisma.user.findMany({
      where: {
        id: { in: recommendedUserIds }
      },
      select: {
        id: true,
        username: true,
        name: true,
        image: true,
        _count: {
          select: {
            followers: true
          }
        }
      }
    });

    const recommendations = recommendedUsers.map(user => ({
      id: user.id,
      username: user.username,
      name: user.name,
      image: user.image,
      followersCount: user._count.followUsers,
      mutualConnections: mutualCounts[user.id],
      reason: `${mutualCounts[user.id]} mutual connection${mutualCounts[user.id] > 1 ? 's' : ''}`
    }));

    return NextResponse.json({
      recommendations: recommendations.sort((a, b) => b.mutualConnections - a.mutualConnections)
    });

  } catch (error) {
    console.error('Error fetching recommendations:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
