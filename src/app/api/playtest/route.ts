import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const createPlaytestSchema = z.object({
  gameId: z.string().min(1, 'Game ID is required'),
  quota: z.number().min(1, 'Quota must be at least 1').max(10000, 'Quota cannot exceed 10,000'),
  expiresAt: z.string().optional(),
});

const claimPlaytestSchema = z.object({
  playtestId: z.string().min(1, 'Playtest ID is required'),
});

// POST /api/playtest - Create a new playtest (game owner only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get user from database by email (same pattern as product creation)
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const validatedData = createPlaytestSchema.parse(body);

    // Check if the game exists and user owns it
    const product = await prisma.product.findFirst({
      where: {
        id: validatedData.gameId,
        userId: user.id,
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Game not found or access denied' },
        { status: 404 }
      );
    }

    // Check if playtest already exists for this game
    const existingPlaytest = await prisma.playtest.findFirst({
      where: { gameId: validatedData.gameId },
    });

    if (existingPlaytest) {
      return NextResponse.json(
        { error: 'Playtest already exists for this game' },
        { status: 409 }
      );
    }

    // Create new playtest
    const playtest = await prisma.playtest.create({
      data: {
        gameId: validatedData.gameId,
        quota: validatedData.quota,
        expiresAt: validatedData.expiresAt ? new Date(validatedData.expiresAt) : null,
      },
      include: {
        product: {
          select: {
            title: true,
            tagline: true,
            image: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Playtest created successfully',
      playtest,
    });
  } catch (error) {
    console.error('=== Create playtest error ===');
    console.error('Error type:', typeof error);
    console.error('Error name:', error instanceof Error ? error.name : 'Unknown');
    console.error('Error message:', error instanceof Error ? error.message : 'Unknown error');
    console.error('Full error:', error);

    if (error instanceof z.ZodError) {
      console.log('Zod validation error details:', error.issues);
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET /api/playtest - Get playtest info
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get user from database by email
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
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

    const playtest = await prisma.playtest.findFirst({
      where: { gameId },
      include: {
        product: {
          select: {
            title: true,
            tagline: true,
            image: true,
          },
        },
        claims: {
          select: {
            id: true,
            claimedAt: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        _count: {
          select: {
            claims: true,
          },
        },
      },
    });

    if (!playtest) {
      return NextResponse.json(
        { error: 'Playtest not found' },
        { status: 404 }
      );
    }

    // Check if current user has already claimed
    const userClaim = playtest.claims.find(claim => claim.user.id === user.id);
    const hasClaimed = !!userClaim;

    // Check if playtest is expired
    const isExpired = playtest.expiresAt ? new Date() > playtest.expiresAt : false;

    // Check if quota is full
    const isQuotaFull = playtest._count.claims >= playtest.quota;

    return NextResponse.json({
      success: true,
      playtest: {
        ...playtest,
        hasClaimed,
        isExpired,
        isQuotaFull,
        remainingQuota: playtest.quota - playtest._count.claims,
      },
    });
  } catch (error) {
    console.error('Get playtest error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
