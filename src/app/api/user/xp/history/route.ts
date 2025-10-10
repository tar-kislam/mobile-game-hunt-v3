import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getUserXpHistory } from '@/lib/xp-system'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    const xpHistory = await getUserXpHistory(session.user.id, limit, offset)

    return NextResponse.json({ xpHistory })
  } catch (error) {
    console.error('Error fetching XP history:', error)
    return NextResponse.json(
      { error: 'Failed to fetch XP history' },
      { status: 500 }
    )
  }
}
