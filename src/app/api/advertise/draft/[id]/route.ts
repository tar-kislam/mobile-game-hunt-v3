import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { CampaignStatus } from '@prisma/client'

export async function PATCH(req: Request, context: any) {
  const params = (context?.params || {}) as { id: string }
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    // Handle both old and new field names
    const goal = body.goal
    const placements = body.placements || []
    const packageType = body.packageType || body.metadata?.packageType
    const budget = body.budget || body.totalPrice || 0
    const gameId = body.gameId
    const gameName = body.gameName || body.metadata?.gameName

    // Verify the campaign belongs to the user
    const campaign = await prisma.advertiseCampaign.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
        status: CampaignStatus.PENDING
      }
    })

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
    }

    // Update the draft
    const updatedCampaign = await prisma.advertiseCampaign.update({
      where: { id: params.id },
      data: {
        goal,
        totalPrice: budget,
        placements,
        gameId,
        contactEmail: gameName, // Using contactEmail field temporarily
        notes: JSON.stringify({ packageType, gameName }) // Store extra data in notes
      }
    })

    return NextResponse.json({ campaign: updatedCampaign })
  } catch (error) {
    console.error('Error updating draft:', error)
    return NextResponse.json({ error: 'Failed to update draft' }, { status: 500 })
  }
}

export async function POST(req: Request, context: any) {
  const params = (context?.params || {}) as { id: string }
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Verify the campaign belongs to the user
    const campaign = await prisma.advertiseCampaign.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
        status: CampaignStatus.PENDING
      }
    })

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
    }

    // Validate required fields
    if (!campaign.goal || !campaign.totalPrice || !campaign.gameId || !campaign.placements?.length) {
      return NextResponse.json({ 
        error: 'Missing required fields: goal, placements, budget, and gameId are required' 
      }, { status: 400 })
    }

    // Submit the campaign
    const submittedCampaign = await prisma.advertiseCampaign.update({
      where: { id: params.id },
      data: {
        status: CampaignStatus.APPROVED
      }
    })

    return NextResponse.json({ 
      campaign: submittedCampaign,
      message: 'Campaign submitted successfully'
    })
  } catch (error) {
    console.error('Error submitting campaign:', error)
    return NextResponse.json({ error: 'Failed to submit campaign' }, { status: 500 })
  }
}
