import { NextRequest, NextResponse } from 'next/server'
import { getXpLeaderboard } from '@/lib/xp-system'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')

    const leaderboard = await getXpLeaderboard(limit)

    return NextResponse.json({ leaderboard })
  } catch (error) {
    console.error('Error fetching XP leaderboard:', error)
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard' },
      { status: 500 }
    )
  }
}
