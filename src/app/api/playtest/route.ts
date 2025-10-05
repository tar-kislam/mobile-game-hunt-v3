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
  console.log('=== Playtest creation request started ===');
  
  try {
    console.log('=== Playtest creation request ===');
    
    const session = await getServerSession(authOptions);
    console.log('Session:', session ? 'exists' : 'null');
    console.log('User email:', session?.user?.email);

    // Check for API key in headers
    const apiKey = request.headers.get('X-Playtest-API-Key');
    console.log('API Key provided:', apiKey ? 'Yes' : 'No');

    if (!session?.user?.email && !apiKey) {
      console.log('No session or API key provided');
      return NextResponse.json(
        { error: 'Authentication required - either session or API key' },
        { status: 401 }
      );
    }

    // Get user from database by email (same pattern as product creation)
    let user = null;
    if (session?.user?.email) {
      user = await prisma.user.findUnique({
        where: { email: session.user.email }
      });
      console.log('Database user:', user ? 'found' : 'not found');
      console.log('User ID:', user?.id);
    }

    if (!user && !apiKey) {
      console.log('User not found in database and no API key');
      return NextResponse.json(
        { error: 'User not found or invalid API key' },
        { status: 404 }
      );
    }

    let body;
    try {
      body = await request.json();
      console.log('Request body:', body);
    } catch (parseError) {
      console.error('Failed to parse request body:', parseError);
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }
    
    let validatedData;
    try {
      validatedData = createPlaytestSchema.parse(body);
      console.log('Validated data:', validatedData);
    } catch (validationError) {
      console.error('Validation error:', validationError);
      if (validationError instanceof z.ZodError) {
        return NextResponse.json(
          { error: 'Validation error', details: validationError.issues },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { error: 'Invalid request data' },
        { status: 400 }
      );
    }

    // Check if the game exists and user owns it (or API key is valid)
    const product = await prisma.product.findFirst({
      where: {
        id: validatedData.gameId,
        ...(user ? { userId: user.id } : {}), // Only check ownership if user exists
      },
    });

    console.log('Product found:', product ? 'yes' : 'no');
    console.log('Product title:', product?.title);

    if (!product) {
      console.log('Game not found or user does not own it');
      return NextResponse.json(
        { error: 'Game not found or access denied' },
        { status: 404 }
      );
    }

    // If API key is provided, validate it against the game
    if (apiKey && product) {
      // Here you could add additional API key validation logic
      // For now, we'll just log that the API key was used
      console.log('API key used for playtest creation');
    }

    // Check if playtest already exists for this game
    const existingPlaytest = await prisma.playtest.findFirst({
      where: { gameId: validatedData.gameId },
    });

    console.log('Existing playtest:', existingPlaytest ? 'found' : 'not found');

    if (existingPlaytest) {
      console.log('Playtest already exists');
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

    console.log('Playtest created successfully:', playtest.id);

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
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack');

    if (error instanceof z.ZodError) {
      console.log('Zod validation error details:', error.issues);
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }

    // Handle specific Prisma errors
    if (error && typeof error === 'object' && 'code' in error) {
      const prismaError = error as any;
      console.log('Prisma error code:', prismaError.code);
      console.log('Prisma error message:', prismaError.message);
      
      if (prismaError.code === 'P2002') {
        return NextResponse.json(
          { error: 'A playtest already exists for this game' },
          { status: 409 }
        );
      }
      
      if (prismaError.code === 'P2003') {
        return NextResponse.json(
          { error: 'Game not found or access denied' },
          { status: 404 }
        );
      }
    }

    // Handle specific error messages
    if (error instanceof Error) {
      const message = error.message;
      console.log('Error message:', message);
      
      if (message.includes('not found') || message.includes('Game not found')) {
        return NextResponse.json(
          { error: 'Game not found or access denied' },
          { status: 404 }
        );
      }
      
      if (message.includes('already exists')) {
        return NextResponse.json(
          { error: 'A playtest already exists for this game' },
          { status: 409 }
        );
      }
      
      if (message.includes('access denied')) {
        return NextResponse.json(
          { error: 'You do not have permission to create a playtest for this game' },
          { status: 403 }
        );
      }
    }

    // Always return a proper error object
    return NextResponse.json(
      { error: 'Failed to create playtest. Please try again.' },
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
