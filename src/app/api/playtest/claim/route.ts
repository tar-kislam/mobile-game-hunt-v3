import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const claimPlaytestSchema = z.object({
  playtestId: z.string().min(1, 'Playtest ID is required'),
});

// PUT /api/playtest/claim - Claim a playtest key
export async function PUT(request: NextRequest) {
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

    const body = await request.json();
    const validatedData = claimPlaytestSchema.parse(body);

    // Check if playtest exists
    const playtest = await prisma.playtest.findUnique({
      where: { id: validatedData.playtestId },
      include: {
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

    // Check if playtest is expired
    if (playtest.expiresAt && new Date() > playtest.expiresAt) {
      return NextResponse.json(
        { error: 'Playtest has expired' },
        { status: 410 }
      );
    }

    // Check if quota is full
    if (playtest._count.claims >= playtest.quota) {
      return NextResponse.json(
        { error: 'Playtest quota is full' },
        { status: 410 }
      );
    }

    // Check if user has already claimed
    const existingClaim = await prisma.playtestClaim.findFirst({
      where: {
        playtestId: validatedData.playtestId,
        userId: user.id,
      },
    });

    if (existingClaim) {
      return NextResponse.json(
        { error: 'You have already claimed this playtest' },
        { status: 409 }
      );
    }

    // Create the claim
    const claim = await prisma.playtestClaim.create({
      data: {
        playtestId: validatedData.playtestId,
        userId: user.id,
      },
      include: {
        playtest: {
          include: {
            product: {
              select: {
                title: true,
                tagline: true,
                image: true,
              },
            },
          },
        },
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Playtest claimed successfully',
      claim,
    });
  } catch (error) {
    console.error('Claim playtest error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
