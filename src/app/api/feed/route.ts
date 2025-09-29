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
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    // Get users that the current user follows
    const following = await prisma.follow.findMany({
      where: { followerId: session.user.id },
      select: { followingId: true }
    });

    const followingIds = following.map(f => f.followingId);

    if (followingIds.length === 0) {
      // If user follows no one, show popular games
      const popularGames = await prisma.product.findMany({
        where: {
          status: 'PUBLISHED'
        },
        select: {
          id: true,
          title: true,
          description: true,
          tagline: true,
          thumbnail: true,
          image: true,
          url: true,
          platforms: true,
          createdAt: true,
          user: {
            select: {
              id: true,
              username: true,
              name: true,
              image: true
            }
          },
          _count: {
            select: {
              votes: true,
              comments: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit
      });

      return NextResponse.json({
        feed: popularGames.map(game => ({
          id: game.id,
          title: game.title,
          description: game.description,
          tagline: game.tagline,
          thumbnail: game.thumbnail || game.image,
          url: game.url,
          platforms: game.platforms,
          createdAt: game.createdAt,
          user: game.user,
          votesCount: game._count.votes,
          commentsCount: game._count.comments,
          type: 'game',
          reason: 'Popular games'
        })),
        pagination: {
          page,
          limit,
          hasMore: popularGames.length === limit
        }
      });
    }

    // Get recent games from followed users
    const feedGames = await prisma.product.findMany({
      where: {
        userId: { in: followingIds },
        status: 'PUBLISHED'
      },
      select: {
        id: true,
        title: true,
        description: true,
        tagline: true,
        thumbnail: true,
        image: true,
        url: true,
        platforms: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            username: true,
            name: true,
            image: true
          }
        },
        _count: {
          select: {
            votes: true,
            comments: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip,
      take: limit
    });

    // Get recent comments from followed users
    const feedComments = await prisma.productComment.findMany({
      where: {
        userId: { in: followingIds }
      },
      select: {
        id: true,
        content: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            username: true,
            name: true,
            image: true
          }
        },
        product: {
          select: {
            id: true,
            title: true,
            thumbnail: true,
            image: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip,
      take: Math.floor(limit / 2) // Half the feed for comments
    });

    // Combine and sort by creation date
    const feedItems = [
      ...feedGames.map(game => ({
        id: game.id,
        title: game.title,
        description: game.description,
        tagline: game.tagline,
        thumbnail: game.thumbnail || game.image,
        url: game.url,
        platforms: game.platforms,
        createdAt: game.createdAt,
        user: game.user,
        votesCount: game._count.votes,
        commentsCount: game._count.comments,
        type: 'game' as const,
        reason: 'New game from followed user'
      })),
      ...feedComments.map(comment => ({
        id: `comment-${comment.id}`,
        title: `Commented on ${comment.product.title}`,
        description: comment.content,
        thumbnail: comment.product.thumbnail || comment.product.image,
        createdAt: comment.createdAt,
        user: comment.user,
        type: 'comment' as const,
        reason: 'New comment from followed user',
        productId: comment.product.id,
        productTitle: comment.product.title
      }))
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
     .slice(0, limit);

    return NextResponse.json({
      feed: feedItems,
      pagination: {
        page,
        limit,
        hasMore: feedItems.length === limit
      }
    });

  } catch (error) {
    console.error('Error fetching feed:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
