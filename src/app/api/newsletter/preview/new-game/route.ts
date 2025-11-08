import { NextRequest, NextResponse } from 'next/server'
import { render } from '@react-email/render'
import NewGameEmail from '@/emails/NewGameEmail'

export async function GET(req: NextRequest) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://mobilegamehunt.com'
    const { searchParams } = new URL(req.url)
    const title = searchParams.get('title') || 'Sample Game Title'
    const pitch = searchParams.get('pitch') || 'A short pitch describing why this new game is exciting to play.'
    const image = searchParams.get('image') || `${baseUrl}/logo/mgh-main.png`
    const link = searchParams.get('link') || `${baseUrl}`
    const email = searchParams.get('email') || 'preview@example.com'

    const html = await render(
      NewGameEmail({
        title,
        pitch,
        image,
        link,
        unsubscribeUrl: `${baseUrl}/unsubscribe?email=${encodeURIComponent(email)}`,
        baseUrl
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


