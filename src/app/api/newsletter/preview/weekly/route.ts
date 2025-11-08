import { NextRequest, NextResponse } from 'next/server'
import { render } from '@react-email/render'
import WeeklyTop5Email from '@/emails/WeeklyTop5Email'
import { getWeeklyTopGames } from '@/lib/newsletter'

export async function GET(req: NextRequest) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://mobilegamehunt.com'
    const games = await getWeeklyTopGames()
    const email = 'preview@example.com'

    const html = await render(
      WeeklyTop5Email({
        games,
        unsubscribeUrl: `${baseUrl}/unsubscribe?email=${encodeURIComponent(email)}`,
        baseUrl,
      })
    )

    return new NextResponse(html, {
      status: 200,
      headers: { 'Content-Type': 'text/html; charset=utf-8' }
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}


