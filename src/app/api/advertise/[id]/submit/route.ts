import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// POST /api/advertise/[id]/submit - Submit campaign for review
export async function POST(_req: Request, context: any) {
  const params = (context?.params || {}) as { id: string }
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Check if campaign exists and belongs to user
    const campaign = await prisma.advertiseCampaign.findFirst({
      where: {
        id: params.id,
        userId: session.user.id
      }
    })

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
    }

    // Validate campaign data before submission
    const validationErrors = []

    // Validate required fields
    if (!campaign.goal) {
      validationErrors.push('Campaign goal is required')
    }

    if (!campaign.budget || campaign.budget <= 0) {
      validationErrors.push('Valid budget is required')
    }

    if (!campaign.startDate || !campaign.endDate) {
      validationErrors.push('Campaign dates are required')
    }

    // Validate audience
    const audience = campaign.audience as any
    if (!audience || !audience.countries || audience.countries.length === 0) {
      validationErrors.push('At least one target country is required')
    }

    if (!audience || !audience.ageRange || audience.ageRange.length === 0) {
      validationErrors.push('At least one age range is required')
    }

    // Validate media
    const media = campaign.media as any
    if (!media || !media.files || media.files.length === 0) {
      validationErrors.push('At least one media upload is required')
    }

    if (validationErrors.length > 0) {
      return NextResponse.json({ 
        error: 'Validation failed',
        details: validationErrors 
      }, { status: 400 })
    }

    // Update campaign status to SUBMITTED
    const updatedCampaign = await prisma.advertiseCampaign.update({
      where: {
        id: params.id
      },
      data: {
        status: 'SUBMITTED',
        updatedAt: new Date()
      }
    })

    return NextResponse.json({ 
      success: true, 
      campaign: updatedCampaign,
      message: 'Campaign submitted successfully for review'
    })
  } catch (error) {
    console.error('Error submitting campaign:', error)
    return NextResponse.json({ error: 'Failed to submit campaign' }, { status: 500 })
  }
}
