import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { generateQuestRecommendations } from "@/lib/quest/recommendations"

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in to use Quest.' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { answers } = body

    if (!answers || !Array.isArray(answers)) {
      return NextResponse.json(
        { error: 'Invalid request: answers array required' },
        { status: 400 }
      )
    }

    const results = await generateQuestRecommendations(answers)
    return NextResponse.json({ results })
  } catch (error) {
    console.error('[QUEST] Error generating recommendations:', error)
    return NextResponse.json(
      { error: 'Failed to generate recommendations' },
      { status: 500 }
    )
  }
}

