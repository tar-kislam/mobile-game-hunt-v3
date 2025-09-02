import { NextResponse } from 'next/server'

export function GET() {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const urls = ['/', '/products', '/leaderboard', '/calendar', '/trends', '/community', '/soft-launch']
  const lastmod = new Date().toISOString()
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `<url><loc>${base}${u}</loc><lastmod>${lastmod}</lastmod></url>`).join('\n')}
</urlset>`
  return new NextResponse(xml, { status: 200, headers: { 'Content-Type': 'application/xml' } })
}


