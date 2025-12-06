import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { subDays, startOfDay, endOfDay } from 'date-fns'

const DEFAULT_RANGE_DAYS = 30
const DEFAULT_PAGE_SIZE = 25

const toTextArray = (values: string[]) => {
  return Prisma.sql`ARRAY[${Prisma.join(values.map((value) => Prisma.sql`${value}`))}]::text[]`
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'EDITOR')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const searchParams = request.nextUrl.searchParams
    const fromParam = searchParams.get('from')
    const toParam = searchParams.get('to')
    const pageType = searchParams.get('pageType') || undefined
    const page = Number(searchParams.get('page') || '1')
    const pageSize = Math.min(Number(searchParams.get('pageSize') || DEFAULT_PAGE_SIZE), 100)

    const toDate = toParam ? endOfDay(new Date(toParam)) : endOfDay(new Date())
    const fromDate = fromParam ? startOfDay(new Date(fromParam)) : startOfDay(subDays(toDate, DEFAULT_RANGE_DAYS))

    const devUsers = await prisma.product.findMany({
      select: { userId: true },
      distinct: ['userId']
    })
    const developerIds = devUsers.map((entry) => entry.userId).filter(Boolean)

    if (developerIds.length === 0) {
      return NextResponse.json(emptyAnalyticsPayload())
    }

    const baseWhere = {
      userId: { in: developerIds },
      createdAt: { gte: fromDate, lte: toDate },
      ...(pageType ? { pageType } : {})
    }

    const totalVisits = await prisma.userActivityEvent.count({ where: baseWhere })
    const uniqueUsers = await prisma.userActivityEvent.findMany({
      where: baseWhere,
      select: { userId: true },
      distinct: ['userId']
    })

    const avgDurationAgg = await prisma.userActivityEvent.aggregate({
      _avg: { durationSeconds: true },
      where: baseWhere
    })

    // Convert developerIds to text array for SQL queries
    const developerIdsArray = toTextArray(developerIds)

    // Find most visited game (product detail pages only)
    // Only compute if pageType filter is 'all' or 'product' (or undefined)
    const mostVisitedGameRaw = !pageType || pageType === 'product'
      ? await prisma.$queryRaw<Array<{
          productId: string
          slug: string
          title: string
          visits: number
        }>>`
        WITH product_visits AS (
          SELECT 
            REGEXP_REPLACE(REGEXP_REPLACE(e."path", '^/product/', ''), '/.*$', '') AS slug,
            COUNT(*)::int AS visits
          FROM "UserActivityEvent" e
          WHERE e."userId" = ANY(${developerIdsArray})
            AND e."createdAt" BETWEEN ${fromDate} AND ${toDate}
            AND (e."pageType" = 'product' OR e."path" ~ '^/product/[^/]+/?$')
          GROUP BY slug
          HAVING slug != ''
        )
        SELECT 
          p.id AS "productId",
          p.slug,
          p.title,
          pv.visits
        FROM product_visits pv
        JOIN "Product" p ON p.slug = pv.slug
        ORDER BY pv.visits DESC
        LIMIT 1
      `
      : []
    const mostVisitedGame = mostVisitedGameRaw[0] || null

    const visitsOverTime = await prisma.$queryRaw<{ date: string; visits: number }[]>`
      SELECT to_char(date_trunc('day', "createdAt"), 'YYYY-MM-DD') AS date,
             COUNT(*)::int AS visits
      FROM "UserActivityEvent"
      WHERE "userId" = ANY(${developerIdsArray})
        AND "createdAt" BETWEEN ${fromDate} AND ${toDate}
        ${pageType ? Prisma.sql`AND "pageType" = ${pageType}` : Prisma.empty}
      GROUP BY 1
      ORDER BY 1
    `

    const topPages = await prisma.$queryRaw<{ path: string; pageType: string | null; visits: number; avgDurationSeconds: number }[]>`
      SELECT "path",
             COALESCE("pageType", 'other') AS "pageType",
             COUNT(*)::int AS visits,
             AVG("durationSeconds")::float AS "avgDurationSeconds"
      FROM "UserActivityEvent"
      WHERE "userId" = ANY(${developerIdsArray})
        AND "createdAt" BETWEEN ${fromDate} AND ${toDate}
        ${pageType ? Prisma.sql`AND "pageType" = ${pageType}` : Prisma.empty}
      GROUP BY "path", "pageType"
      ORDER BY visits DESC
      LIMIT 10
    `

    const userStats = await prisma.$queryRaw<
      { userId: string; email: string; name: string | null; totalVisits: number; avgDurationSeconds: number; lastSeenAt: Date }[]
    >`
      SELECT u.id        AS "userId",
             u.email     AS email,
             u.name      AS name,
             COUNT(*)::int AS "totalVisits",
             AVG(e."durationSeconds")::float AS "avgDurationSeconds",
             MAX(e."createdAt") AS "lastSeenAt"
      FROM "UserActivityEvent" e
      JOIN "User" u ON u.id = e."userId"
      WHERE e."userId" = ANY(${developerIdsArray})
        AND e."createdAt" BETWEEN ${fromDate} AND ${toDate}
        ${pageType ? Prisma.sql`AND e."pageType" = ${pageType}` : Prisma.empty}
      GROUP BY u.id
      ORDER BY "totalVisits" DESC
      LIMIT ${pageSize} OFFSET ${(Math.max(page, 1) - 1) * pageSize}
    `

    const pageUserIds = userStats.map((user) => user.userId)

    const userTopPages = pageUserIds.length
      ? await prisma.$queryRaw<{ userId: string; path: string; visits: number }[]>`
        WITH selected_users AS (
          SELECT unnest(${toTextArray(pageUserIds)}) AS id
        )
        SELECT "userId",
               "path",
               visits
        FROM (
          SELECT e."userId",
                 e."path",
                 COUNT(*)::int AS visits,
                 ROW_NUMBER() OVER (PARTITION BY e."userId" ORDER BY COUNT(*) DESC) AS row_rank
          FROM "UserActivityEvent" e
          WHERE e."userId" IN (SELECT id FROM selected_users)
            AND e."createdAt" BETWEEN ${fromDate} AND ${toDate}
            ${pageType ? Prisma.sql`AND e."pageType" = ${pageType}` : Prisma.empty}
          GROUP BY e."userId", e."path"
        ) ranked
        WHERE row_rank <= 3
        ORDER BY "userId", visits DESC
      `
      : []

    const userTopPagesMap = userTopPages.reduce<Record<string, Array<{ path: string; visits: number }>>>((acc, item) => {
      if (!acc[item.userId]) acc[item.userId] = []
      acc[item.userId].push({ path: item.path, visits: Number(item.visits) })
      return acc
    }, {})

    // Fetch submitted games for each user
    const userSubmittedGames = pageUserIds.length
      ? await prisma.product.findMany({
          where: {
            userId: { in: pageUserIds }
          },
          select: {
            id: true,
            title: true,
            slug: true,
            userId: true
          }
        })
      : []

    const userSubmittedGamesMap = userSubmittedGames.reduce<Record<string, Array<{ id: string; title: string; slug: string }>>>((acc, product) => {
      if (!acc[product.userId]) acc[product.userId] = []
      acc[product.userId].push({ id: product.id, title: product.title, slug: product.slug })
      return acc
    }, {})

    return NextResponse.json({
      summary: {
        totalVisits,
        uniqueUsers: uniqueUsers.length,
        avgDurationSeconds: avgDurationAgg._avg.durationSeconds ?? 0,
        mostVisitedGame
      },
      visitsOverTime,
      topPages,
      pagination: {
        page,
        pageSize,
        totalUsers: uniqueUsers.length
      },
      users: userStats.map((user) => ({
        ...user,
        lastSeenAt: user.lastSeenAt?.toISOString?.() ?? null,
        topPages: userTopPagesMap[user.userId] || [],
        submittedGames: userSubmittedGamesMap[user.userId] || []
      }))
    })
  } catch (error) {
    console.error('[EDITORIAL][USER_ANALYTICS] failed', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

const emptyAnalyticsPayload = () => ({
  summary: {
    totalVisits: 0,
    uniqueUsers: 0,
    avgDurationSeconds: 0,
    mostVisitedGame: null
  },
  visitsOverTime: [],
  topPages: [],
  pagination: {
    page: 1,
    pageSize: DEFAULT_PAGE_SIZE,
    totalUsers: 0
  },
  users: []
})

