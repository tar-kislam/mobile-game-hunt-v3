import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { goal, placements, package: packageType, budget, gameId, gameName } = body

    // Validate required fields
    if (!goal || !placements || !packageType || !budget || !gameId || !gameName) {
      return NextResponse.json({ 
        error: 'Missing required fields: goal, placements, package, budget, gameId, gameName' 
      }, { status: 400 })
    }

    const campaign = await prisma.campaign.create({
      data: {
        userId: session.user.id,
        gameId,
        gameName,
        goal,
        placements,
        package: packageType,
        budget: parseInt(budget)
      }
    })

    return NextResponse.json({ campaign })
  } catch (error) {
    console.error('Error creating campaign:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: 'Failed to create campaign', details: errorMessage }, { status: 500 })
  }
}

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const campaigns = await prisma.campaign.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            username: true,
            image: true
          }
        }
      },
      orderBy: {
        submittedAt: 'desc'
      }
    })

    return NextResponse.json({ campaigns })
  } catch (error) {
    console.error('Error fetching campaigns:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: 'Failed to fetch campaigns', details: errorMessage }, { status: 500 })
  }
}