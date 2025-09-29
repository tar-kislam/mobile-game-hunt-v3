import { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://mobilegamehunt.com'

  // Static pages
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/products`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/leaderboard`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/community`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/calendar`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/submit`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
  ]

  // Dynamic product pages
  const products = await prisma.product.findMany({
    where: {
      status: 'PUBLISHED'
    },
    select: {
      slug: true,
      updatedAt: true,
    },
    take: 1000, // Limit to prevent timeout
  })

  const productPages = products.map((product) => ({
    url: `${baseUrl}/product/${product.slug}`,
    lastModified: product.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  // User profile pages
  const users = await prisma.user.findMany({
    where: {
      username: {
        not: null
      }
    },
    select: {
      username: true,
      updatedAt: true,
    },
    take: 1000,
  })

  const userPages = users.map((user) => ({
    url: `${baseUrl}/${user.username}`,
    lastModified: user.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }))

  const sitemap = [...staticPages, ...productPages, ...userPages]
  
  return new Response(JSON.stringify(sitemap), {
    headers: { 'Content-Type': 'application/json' },
  })
}