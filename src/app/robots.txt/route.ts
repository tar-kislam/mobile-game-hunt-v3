import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://mobilegamehunt.com'

  return {
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
}