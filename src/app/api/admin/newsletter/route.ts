import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Fetch all newsletter subscribers
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Guard against missing NewsletterSubscription model
    if (!(prisma as any).newsletterSubscription) {
      return NextResponse.json([])
    }

    const subscribers = await (prisma as any).newsletterSubscription.findMany({
      select: {
        id: true,
        email: true,
        createdAt: true,
        isActive: true
      },
      where: {
        isActive: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Transform data to match expected format
    const transformedSubscribers = subscribers.map((subscriber: any) => ({
      id: subscriber.id,
      email: subscriber.email,
      createdAt: subscriber.createdAt.toISOString()
    }))

    return NextResponse.json(transformedSubscribers)
  } catch (error) {
    console.error('Error fetching newsletter subscribers:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
