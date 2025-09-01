import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const { gameId, type, referrer } = await request.json();

    // Validate required fields
    if (!gameId || !type) {
      return NextResponse.json(
        { error: 'Missing required fields: gameId and type' },
        { status: 400 }
      );
    }

    // Validate type
    const validTypes = ['view', 'click', 'play', 'download', 'share'];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: 'Invalid type. Must be one of: view, click, play, download, share' },
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

    // Create metric record
    const metric = await prisma.metric.create({
      data: {
        gameId,
        type,
        referrer: referrer || null,
        userId: session?.user?.id || null,
        userAgent: request.headers.get('user-agent') || null,
        ipAddress: request.headers.get('x-forwarded-for') || 
                   request.headers.get('x-real-ip') || 
                   'unknown',
        timestamp: new Date()
      }
    });

    // Update game stats if needed
    if (type === 'click' || type === 'play') {
      await prisma.product.update({
        where: { id: gameId },
        data: {
          clicks: {
            increment: 1
          }
        }
      });
    }

    return NextResponse.json({ 
      success: true, 
      metricId: metric.id,
      message: `${type} metric recorded successfully`
    });

  } catch (error) {
    console.error('Metrics API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
