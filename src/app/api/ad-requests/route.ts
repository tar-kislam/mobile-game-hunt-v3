import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/ad-requests - Get ad requests
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    const adRequests = await prisma.adRequest.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    const totalCount = await prisma.adRequest.count()

    return NextResponse.json({
      data: adRequests,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching ad requests:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/ad-requests - Create ad request
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { 
      campaignName, 
      budget, 
      duration, 
      targetAudience, 
      objectives, 
      notes,
      promotions,
      totalPrice,
      userEmail
    } = body

    const adRequest = await prisma.adRequest.create({
      data: {
        campaignName,
        budget: parseFloat(budget) || 0,
        duration: String(parseInt(duration) || 0),
        targetAudience,
        objectives,
        notes,
        promotions,
        totalPrice: parseFloat(totalPrice) || 0,
        userEmail,
        userId: session.user.id,
        status: 'PENDING'
      }
    })

    return NextResponse.json({ data: adRequest }, { status: 201 })
  } catch (error) {
    console.error('Error creating ad request:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}