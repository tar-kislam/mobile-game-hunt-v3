import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

interface RouteParams {
  params: {
    id: string
  }
}

// GET /api/advertise/[id] - Get specific campaign
export async function GET(req: Request, { params }: RouteParams) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const campaign = await prisma.advertiseCampaign.findFirst({
      where: {
        id: params.id,
        userId: session.user.id
      }
    })

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
    }

    return NextResponse.json({ campaign })
  } catch (error) {
    console.error('Error fetching campaign:', error)
    return NextResponse.json({ error: 'Failed to fetch campaign' }, { status: 500 })
  }
}

// PATCH /api/advertise/[id] - Update campaign
export async function PATCH(req: Request, { params }: RouteParams) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { goal, budget, startDate, endDate, audience, media, notes } = body

    // Validate budget
    if (budget && (isNaN(parseInt(budget)) || parseInt(budget) <= 0)) {
      return NextResponse.json({ 
        error: 'Budget must be a positive number' 
      }, { status: 400 })
    }

    // Validate dates
    if (startDate && endDate) {
      const start = new Date(startDate)
      const end = new Date(endDate)
      if (start >= end) {
        return NextResponse.json({ 
          error: 'End date must be after start date' 
        }, { status: 400 })
      }
    }

    // Check if campaign exists and belongs to user
    const existingCampaign = await prisma.advertiseCampaign.findFirst({
      where: {
        id: params.id,
        userId: session.user.id
      }
    })

    if (!existingCampaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
    }

    // Update campaign
    const campaign = await prisma.advertiseCampaign.update({
      where: {
        id: params.id
      },
      data: {
        goal: goal !== undefined ? goal : existingCampaign.goal,
        budget: budget !== undefined ? parseInt(budget) : existingCampaign.budget,
        startDate: startDate ? new Date(startDate) : existingCampaign.startDate,
        endDate: endDate ? new Date(endDate) : existingCampaign.endDate,
        audience: audience !== undefined ? audience : existingCampaign.audience,
        media: media !== undefined ? media : existingCampaign.media,
        notes: notes !== undefined ? notes : existingCampaign.notes,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({ 
      success: true, 
      campaign: campaign 
    })
  } catch (error) {
    console.error('Error updating campaign:', error)
    return NextResponse.json({ error: 'Failed to update campaign' }, { status: 500 })
  }
}
