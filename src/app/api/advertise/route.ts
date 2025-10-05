import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// POST /api/advertise - Create new draft campaign
export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { goal, budget, startDate, endDate, audience, media, notes } = body

    // Check if user already has a draft campaign
    const existingDraft = await prisma.advertiseCampaign.findFirst({
      where: {
        userId: session.user.id,
        status: 'DRAFT'
      }
    })

    if (existingDraft) {
      return NextResponse.json({ 
        error: 'User already has a draft campaign',
        campaign: existingDraft 
      }, { status: 409 })
    }

    // Create new draft campaign
    const campaign = await prisma.advertiseCampaign.create({
      data: {
        userId: session.user.id,
        goal: goal || '',
        budget: budget ? parseInt(budget) : 0,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        audience: audience || {},
        media: media || {},
        notes: notes || '',
        status: 'DRAFT',
        contactEmail: session.user.email || ''
      }
    })

    return NextResponse.json({ 
      success: true, 
      campaign: campaign 
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating campaign:', error)
    return NextResponse.json({ error: 'Failed to create campaign' }, { status: 500 })
  }
}

// GET /api/advertise - Get user's campaigns
export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const campaigns = await prisma.advertiseCampaign.findMany({
      where: {
        userId: session.user.id
      },
      orderBy: {
        updatedAt: 'desc'
      }
    })

    return NextResponse.json({ campaigns })
  } catch (error) {
    console.error('Error fetching campaigns:', error)
    return NextResponse.json({ error: 'Failed to fetch campaigns' }, { status: 500 })
  }
}
