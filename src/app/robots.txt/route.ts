import { MetadataRoute } from 'next'

export function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://mobilegamehunt.com'
  const robots = {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/dashboard',
          '/notifications',
          '/api/',
          '/admin/',
          '/_next/',
          '/submit/new',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
  return new Response(JSON.stringify(robots), {
    headers: { 'Content-Type': 'application/json' },
  })
}