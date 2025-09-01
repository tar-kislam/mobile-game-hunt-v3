import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { gameId } = await request.json();

    if (!gameId) {
      return NextResponse.json(
        { error: 'Game ID is required' },
        { status: 400 }
      );
    }

    // Check if game exists
    const game = await prisma.product.findUnique({
      where: { id: gameId },
      select: { id: true }
    });

    if (!game) {
      return NextResponse.json(
        { error: 'Game not found' },
        { status: 404 }
      );
    }

    // Check if already following
    const existingFollow = await prisma.follow.findFirst({
      where: {
        userId: session.user.id,
        gameId
      }
    });

    if (existingFollow) {
      // Unfollow
      await prisma.follow.delete({
        where: { id: existingFollow.id }
      });

      // Decrease follow count
      await prisma.product.update({
        where: { id: gameId },
        data: {
          follows: {
            decrement: 1
          }
        }
      });

      return NextResponse.json({ 
        success: true, 
        following: false,
        message: 'Unfollowed successfully'
      });
    } else {
      // Follow
      await prisma.follow.create({
        data: {
          userId: session.user.id,
          gameId
        }
      });

      // Increase follow count
      await prisma.product.update({
        where: { id: gameId },
        data: {
          follows: {
            increment: 1
          }
        }
      });

      return NextResponse.json({ 
        success: true, 
        following: true,
        message: 'Following successfully'
      });
    }

  } catch (error) {
    console.error('Follow API error:', error);
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
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const gameId = searchParams.get('gameId');

    if (!gameId) {
      return NextResponse.json(
        { error: 'Game ID is required' },
        { status: 400 }
      );
    }

    // Check if user is following this game
    const follow = await prisma.follow.findFirst({
      where: {
        userId: session.user.id,
        gameId
      }
    });

    return NextResponse.json({ 
      following: !!follow 
    });

  } catch (error) {
    console.error('Follow status API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
