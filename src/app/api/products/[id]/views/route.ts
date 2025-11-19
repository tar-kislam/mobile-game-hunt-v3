import { NextRequest, NextResponse } from 'next/server'
import { getProductViewSummary } from '@/lib/metrics/getProductViews'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { totalViews, since } = await getProductViewSummary(id)

    return NextResponse.json({ 
      totalViews,
      since,
      gameId: id
    })
  } catch (error) {
    console.error('Error fetching view count:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

