import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod'
import { rateLimit } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'ip:unknown'
    const rl = await rateLimit(`metrics:post:${ip}`, 120, 60)
    if (!rl.allowed) return NextResponse.json({ error: 'Rate limit' }, { status: 429 })
    const session = await getServerSession(authOptions);
    const schema = z.object({
      gameId: z.string().min(1),
      type: z.enum(['view','click','play','download','share']),
      referrer: z.string().url().optional()
    })
    const parsed = schema.safeParse(await request.json())
    if (!parsed.success) return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    const { gameId, type, referrer } = parsed.data

    // Zod already validated fields

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
