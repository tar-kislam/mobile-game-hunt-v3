import { prisma } from '@/lib/prisma'

const VIEW_TYPES = [
  'INTERNAL',
  'view',
  'IOS',
  'ANDROID',
  'STORE',
  'PRE_REGISTER',
  'DISCORD',
  'WEBSITE',
  'TIKTOK',
  'STEAM'
] as const

type ViewType = (typeof VIEW_TYPES)[number]

/**
 * Calculates total views for a product using the same logic as the dashboard analytics.
 * Currently sums the last 30 days of internal (page views) and external clicks.
 */
export async function getProductViewSummary(gameId: string, days = 30) {
  const since = new Date()
  since.setDate(since.getDate() - days)

  const metrics = await prisma.metric.groupBy({
    by: ['timestamp', 'type'],
    where: {
      gameId,
      timestamp: {
        gte: since
      },
      type: {
        in: VIEW_TYPES as unknown as ViewType[]
      }
    },
    _count: {
      timestamp: true
    }
  })

  const totalViews = metrics.reduce((sum, item) => sum + item._count.timestamp, 0)

  return {
    totalViews,
    since
  }
}


