import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod'
import { rateLimit } from '@/lib/rate-limit'
import { detectGeoInfo } from '@/lib/geo-detection'

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'ip:unknown'
    const rl = await rateLimit(`metrics:post:${ip}`, 120, 60)
    if (!rl.allowed) return NextResponse.json({ error: 'Rate limit' }, { status: 429 })
    
    // Get session but don't require authentication for view tracking
    const session = await getServerSession(authOptions);
    const schema = z.object({
      gameId: z.string().min(1),
      type: z.enum(['view','click','play','download','share','IOS','ANDROID','STORE','PRE_REGISTER','DISCORD','WEBSITE','TIKTOK','STEAM','INTERNAL']),
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

    // Validate userId if provided
    let validUserId = null;
    if (session?.user?.id) {
      const userExists = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { id: true }
      });
      if (userExists) {
        validUserId = session.user.id;
      } else {
        console.warn(`User ID ${session.user.id} not found in database`);
      }
    }

    // Detect geo information
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown'
    const userAgent = request.headers.get('user-agent') || ''
    const geoInfo = detectGeoInfo(ipAddress, userAgent)

    // Create metric record
    const metric = await prisma.metric.create({
      data: {
        gameId,
        type,
        referrer: referrer || null,
        userId: validUserId, // Use validated userId or null
        userAgent: userAgent || null,
        ipAddress: ipAddress,
        country: geoInfo.country,
        language: geoInfo.language,
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

    // Treat 'view' and 'INTERNAL' as a view for total views aggregation
    if (type === 'view' || type === 'INTERNAL') {
      await prisma.product.update({
        where: { id: gameId },
        data: {
          clicks: {
            increment: 0
          }
        }
      })
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
