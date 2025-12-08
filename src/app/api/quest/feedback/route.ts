import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

/**
 * POST /api/quest/feedback
 * 
 * Store user feedback on Quest recommendations for future tuning
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in to provide feedback.' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { gameId, reason, matchRank, gameTitle, notes } = body

    if (!gameId || !reason) {
      return NextResponse.json(
        { error: 'Missing required fields: gameId and reason' },
        { status: 400 }
      )
    }

    // Validate reason
    const validReasons = ['NOT_MY_STYLE', 'WRONG_PLATFORM', 'NOT_INTERESTED', 'OTHER']
    if (!validReasons.includes(reason)) {
      return NextResponse.json(
        { error: `Invalid reason. Must be one of: ${validReasons.join(', ')}` },
        { status: 400 }
      )
    }

    // Get game title if not provided
    let finalGameTitle = gameTitle
    if (!finalGameTitle && gameId) {
      try {
        const game = await prisma.product.findUnique({
          where: { id: gameId },
          select: { title: true }
        })
        if (game) {
          finalGameTitle = game.title
        }
      } catch (error) {
        console.warn('[QUEST_FEEDBACK] Could not fetch game title:', error)
      }
    }

    // Store feedback in database
    try {
      const feedback = await prisma.questFeedback.create({
        data: {
          userId: session.user.id,
          gameId: gameId || null,
          gameTitle: finalGameTitle || null,
          matchRank: matchRank || null,
          reason,
          notes: notes || null,
        }
      })

      console.log('[QUEST_FEEDBACK] Stored feedback:', {
        id: feedback.id,
        userId: session.user.id,
        gameId,
        reason,
        matchRank,
      })

      return NextResponse.json({ 
        success: true,
        message: 'Thank you for your feedback! This helps us improve Quest recommendations.'
      })
    } catch (dbError: any) {
      // If QuestFeedback model doesn't exist yet, log and return success
      if (dbError?.code === 'P2021' || dbError?.message?.includes('does not exist')) {
        console.warn('[QUEST_FEEDBACK] QuestFeedback table not found, logging instead:', {
          userId: session.user.id,
          gameId,
          reason,
          matchRank,
          timestamp: new Date().toISOString(),
        })
        return NextResponse.json({ 
          success: true,
          message: 'Thank you for your feedback! This helps us improve Quest recommendations.'
        })
      }
      throw dbError
    }
  } catch (error) {
    console.error('[QUEST] Error storing feedback:', error)
    return NextResponse.json(
      { error: 'Failed to store feedback' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/quest/feedback
 * 
 * Fetch Quest feedback for editorial dashboard (admin only)
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication and admin role
    const session = await getServerSession(authOptions)
    if (!session || !session.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const reason = searchParams.get('reason')

    // Build where clause
    const where: any = {}
    if (reason) {
      where.reason = reason
    }

    try {
      const feedback = await prisma.questFeedback.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              username: true,
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: limit,
      })

      return NextResponse.json({ feedback })
    } catch (dbError: any) {
      // If QuestFeedback model doesn't exist yet, return empty array
      if (dbError?.code === 'P2021' || dbError?.message?.includes('does not exist')) {
        return NextResponse.json({ feedback: [] })
      }
      throw dbError
    }
  } catch (error) {
    console.error('[QUEST] Error fetching feedback:', error)
    return NextResponse.json(
      { error: 'Failed to fetch feedback' },
      { status: 500 }
    )
  }
}

