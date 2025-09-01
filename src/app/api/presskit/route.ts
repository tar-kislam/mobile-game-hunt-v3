import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const pressKitSchema = z.object({
  gameId: z.string().min(1, 'Game ID is required'),
  headline: z.string().min(1, 'Headline is required'),
  about: z.string().min(1, 'About section is required'),
  features: z.array(z.string()).min(1, 'At least one feature is required'),
  media: z.array(z.string()).default([]),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = pressKitSchema.parse(body);

    // Check if the game exists and user owns it
    const product = await prisma.product.findFirst({
      where: {
        id: validatedData.gameId,
        userId: session.user.id,
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Game not found or access denied' },
        { status: 404 }
      );
    }

    // Check if press kit already exists
    const existingPressKit = await prisma.pressKit.findUnique({
      where: { gameId: validatedData.gameId },
    });

    let pressKit;

    if (existingPressKit) {
      // Update existing press kit
      pressKit = await prisma.pressKit.update({
        where: { gameId: validatedData.gameId },
        data: {
          headline: validatedData.headline,
          about: validatedData.about,
          features: validatedData.features,
          media: validatedData.media,
          updatedAt: new Date(),
        },
        include: {
          product: {
            select: {
              title: true,
              tagline: true,
              image: true,
              platforms: true,
            },
          },
        },
      });
    } else {
      // Create new press kit
      pressKit = await prisma.pressKit.create({
        data: {
          gameId: validatedData.gameId,
          headline: validatedData.headline,
          about: validatedData.about,
          features: validatedData.features,
          media: validatedData.media,
        },
        include: {
          product: {
            select: {
              title: true,
              tagline: true,
              image: true,
              platforms: true,
            },
          },
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: existingPressKit ? 'Press kit updated successfully' : 'Press kit created successfully',
      pressKit,
    });
  } catch (error) {
    console.error('Press kit error:', error);

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

    // Check if user owns the game or if it's published
    const product = await prisma.product.findFirst({
      where: {
        id: gameId,
        OR: [
          { userId: session.user.id },
          { status: 'PUBLISHED' },
        ],
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Game not found or access denied' },
        { status: 404 }
      );
    }

    const pressKit = await prisma.pressKit.findUnique({
      where: { gameId },
      include: {
        product: {
          select: {
            title: true,
            tagline: true,
            image: true,
            platforms: true,
            description: true,
            url: true,
            appStoreUrl: true,
            playStoreUrl: true,
            socialLinks: true,
            releaseAt: true,
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!pressKit) {
      return NextResponse.json(
        { error: 'Press kit not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      pressKit,
    });
  } catch (error) {
    console.error('Get press kit error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
