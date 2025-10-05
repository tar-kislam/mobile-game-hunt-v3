import { MetadataRoute } from 'next'

export function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://mobilegamehunt.com'
  
  const robotsText = `User-agent: *
Allow: /
Disallow: /dashboard
Disallow: /notifications
Disallow: /profile/
Disallow: /editorial-dashboard
Disallow: /feed
Disallow: /api/
Disallow: /admin/
Disallow: /_next/
Disallow: /submit/

Sitemap: ${baseUrl}/sitemap.xml`

  return new Response(robotsText, {
    headers: { 
      'Content-Type': 'text/plain',
    },
  })
}