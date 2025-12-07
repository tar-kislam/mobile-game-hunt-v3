import { NextRequest, NextResponse } from "next/server"
import { generateQuestRecommendations } from "@/lib/quest/recommendations"

export async function POST(request: NextRequest) {
  try {
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

