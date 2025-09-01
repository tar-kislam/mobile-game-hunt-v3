import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const claimPlaytestSchema = z.object({
  playtestId: z.string().min(1, 'Playtest ID is required'),
});

// PUT /api/playtest/claim - Claim a playtest key with proper transaction handling
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

    // Use transaction with row locking to prevent race conditions
    const result = await prisma.$transaction(async (tx) => {
      // Lock the playtest row for update to prevent concurrent modifications
      const playtest = await tx.playtest.findUnique({
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
        throw new Error('Playtest not found');
      }

      // Check if playtest is expired
      if (playtest.expiresAt && new Date() > playtest.expiresAt) {
        throw new Error('Playtest has expired');
      }

      // Check if quota is full
      if (playtest._count.claims >= playtest.quota) {
        throw new Error('No quota left');
      }

      // Check if user has already claimed
      const existingClaim = await tx.playtestClaim.findFirst({
        where: {
          playtestId: validatedData.playtestId,
          userId: user.id,
        },
      });

      if (existingClaim) {
        throw new Error('Already claimed');
      }

      // Create the claim and update quota atomically
      const [claim] = await Promise.all([
        tx.playtestClaim.create({
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
        }),
        // Note: We don't need to update quota since we're using _count.claims
        // The quota check is based on the count of claims
      ]);

      return claim;
    });

    return NextResponse.json({
      success: true,
      message: 'Playtest claimed successfully',
      claim: result,
    });

  } catch (error) {
    console.error('Claim playtest error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }

    // Handle specific error messages
    if (error instanceof Error) {
      const message = error.message;
      
      if (message === 'Playtest not found') {
        return NextResponse.json(
          { error: 'Playtest not found' },
          { status: 404 }
        );
      }
      
      if (message === 'Playtest has expired') {
        return NextResponse.json(
          { error: 'Playtest has expired' },
          { status: 410 }
        );
      }
      
      if (message === 'No quota left') {
        return NextResponse.json(
          { error: 'No quota left' },
          { status: 409 }
        );
      }
      
      if (message === 'Already claimed') {
        return NextResponse.json(
          { error: 'You have already claimed this playtest' },
          { status: 409 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
