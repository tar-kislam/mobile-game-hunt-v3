import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// For now, this returns JSON. In the future, it could generate and return a ZIP file
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ gameId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { gameId } = await params;

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

    // For now, return JSON. In the future, this could generate a ZIP file
    // containing formatted documents, images, etc.
    return NextResponse.json({
      success: true,
      message: 'Press kit data retrieved successfully',
      pressKit,
      note: 'ZIP download functionality will be implemented in Phase 2',
    });

  } catch (error) {
    console.error('Download press kit error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
