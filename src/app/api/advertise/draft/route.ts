import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { CampaignStatus } from '@prisma/client'

export async function POST(req: Request) {
  console.log('POST /api/advertise/draft called')
  
  const session = await getServerSession(authOptions)
  console.log('Session:', session?.user?.id ? 'Authenticated' : 'Not authenticated')
  
  if (!session?.user?.id) {
    console.log('Returning 401 Unauthorized')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    console.log('Request body:', body)
    
    // Handle both old and new field names
    const goal = body.goal
    const placements = body.placements || []
    const packageType = body.packageType || body.metadata?.packageType
    const budget = body.budget || body.totalPrice || 0
    const gameId = body.gameId
    const gameName = body.gameName || body.metadata?.gameName
    
    console.log('Parsed data:', { goal, placements, packageType, budget, gameId, gameName })

    // Check if user already has a draft campaign
    // Use DRAFT status for drafts (previously PENDING caused 500s + duplicate drafts)
    const existingDraft = await prisma.advertiseCampaign.findFirst({
      where: {
        userId: session.user.id,
        status: CampaignStatus.DRAFT
      }
    })

    let campaign
    if (existingDraft) {
      // Update existing draft
      campaign = await prisma.advertiseCampaign.update({
        where: { id: existingDraft.id },
        data: {
          // Persist even when fields are not completed yet (autosave)
          goal: goal ?? '',
          budget: budget,
          placements,
          notes: JSON.stringify({ packageType, gameName, gameId }), // Store extra data in notes
          updatedAt: new Date()
        }
      })
    } else {
      // Create new draft
      campaign = await prisma.advertiseCampaign.create({
        data: {
          userId: session.user.id,
          // Allow empty goal during draft creation
          goal: goal ?? '',
          budget: budget,
          placements,
          status: CampaignStatus.DRAFT,
          notes: JSON.stringify({ packageType, gameName, gameId }), // Store extra data in notes
          // Legacy fields for backward compatibility
          totalPrice: budget,
          durationType: 'monthly'
        }
      })
    }

    console.log('Campaign saved successfully:', campaign.id)
    return NextResponse.json({ campaign })
  } catch (error) {
    console.error('Error saving draft:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('Error details:', errorMessage)
    return NextResponse.json({ error: 'Failed to save draft', details: errorMessage }, { status: 500 })
  }
}

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const draft = await prisma.advertiseCampaign.findFirst({
      where: {
        userId: session.user.id,
        status: CampaignStatus.DRAFT
      }
    })

    return NextResponse.json({ draft })
  } catch (error) {
    console.error('Error fetching draft:', error)
    return NextResponse.json({ error: 'Failed to fetch draft' }, { status: 500 })
  }
}
