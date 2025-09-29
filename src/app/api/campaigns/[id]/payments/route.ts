import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

interface RouteParams {
  params: {
    id: string
  }
}

// POST /api/campaigns/[id]/payments - Create payment for campaign
export async function POST(req: Request, { params }: RouteParams) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { amount, currency = 'USD', paymentMethod = 'stripe' } = body

    // Check if campaign exists and belongs to user
    const campaign = await prisma.advertiseCampaign.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
        status: 'APPROVED' // Only allow payments for approved campaigns
      }
    })

    if (!campaign) {
      return NextResponse.json({ 
        error: 'Campaign not found or not approved for payment' 
      }, { status: 404 })
    }

    // Check if payment already exists for this campaign
    const existingPayment = await prisma.campaignPayment.findFirst({
      where: {
        campaignId: params.id,
        status: {
          in: ['PENDING', 'PROCESSING', 'COMPLETED']
        }
      }
    })

    if (existingPayment) {
      return NextResponse.json({ 
        error: 'Payment already exists for this campaign',
        payment: existingPayment
      }, { status: 409 })
    }

    // Create payment record (placeholder - no actual payment processing)
    const payment = await prisma.campaignPayment.create({
      data: {
        campaignId: params.id,
        userId: session.user.id,
        amount: amount || campaign.budget, // Use campaign budget if no amount specified
        currency,
        status: 'PENDING',
        paymentMethod,
        metadata: {
          placeholder: true,
          message: 'Payment integration coming soon',
          timestamp: new Date().toISOString()
        }
      }
    })

    return NextResponse.json({ 
      success: true,
      payment,
      message: 'Payment integration coming soon. This is a placeholder.'
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating payment:', error)
    return NextResponse.json({ error: 'Failed to create payment' }, { status: 500 })
  }
}

// GET /api/campaigns/[id]/payments - Get payments for campaign
export async function GET(req: Request, { params }: RouteParams) {
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

    // Get payments for this campaign
    const payments = await prisma.campaignPayment.findMany({
      where: {
        campaignId: params.id
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ payments })
  } catch (error) {
    console.error('Error fetching payments:', error)
    return NextResponse.json({ error: 'Failed to fetch payments' }, { status: 500 })
  }
}
