import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { subDays, startOfDay, endOfDay } from 'date-fns'

const DEFAULT_RANGE_DAYS = 30
const DEFAULT_PAGE_SIZE = 25

const toTextArray = (values: string[]) => {
  if (!values || values.length === 0) {
    return Prisma.sql`ARRAY[]::text[]`
  }
  // Filter out null/undefined/empty values and ensure they're strings
  const validValues = values.filter((v): v is string => typeof v === 'string' && v.length > 0)
  
  if (validValues.length === 0) {
    return Prisma.sql`ARRAY[]::text[]`
  }
  
  // Use Prisma.join with properly parameterized values
  // Each value is passed as a parameter to prevent SQL injection
  return Prisma.sql`ARRAY[${Prisma.join(validValues.map((value) => Prisma.sql`${value}`))}]::text[]`
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

    // Validate and parse dates
    let toDate: Date
    let fromDate: Date
    
    try {
      toDate = toParam ? endOfDay(new Date(toParam)) : endOfDay(new Date())
      fromDate = fromParam ? startOfDay(new Date(fromParam)) : startOfDay(subDays(toDate, DEFAULT_RANGE_DAYS))
      
      if (isNaN(toDate.getTime()) || isNaN(fromDate.getTime())) {
        return NextResponse.json({ error: 'Invalid date format' }, { status: 400 })
      }
    } catch (dateError) {
      console.error('[EDITORIAL][USER_ANALYTICS] Date parsing error:', dateError)
      return NextResponse.json({ error: 'Invalid date parameters' }, { status: 400 })
    }

    // Fetch developer user IDs
    let devUsers
    try {
      devUsers = await prisma.product.findMany({
        select: { userId: true },
        distinct: ['userId']
      })
    } catch (error) {
      console.error('[EDITORIAL][USER_ANALYTICS] Error fetching dev users:', error)
      throw error
    }
    
    const developerIds = devUsers.map((entry) => entry.userId).filter(Boolean) as string[]

    if (developerIds.length === 0) {
      console.log('[EDITORIAL][USER_ANALYTICS] No developer users found, returning empty payload')
      return NextResponse.json(emptyAnalyticsPayload())
    }

    const baseWhere = {
      userId: { in: developerIds },
      createdAt: { gte: fromDate, lte: toDate },
      ...(pageType ? { pageType } : {})
    }

    // Convert developerIds to text array for SQL queries
    // Ensure we have valid string IDs
    const validDeveloperIds = developerIds.filter((id): id is string => typeof id === 'string' && id.length > 0)
    
    if (validDeveloperIds.length === 0) {
      console.log('[EDITORIAL][USER_ANALYTICS] No valid developer IDs, returning empty payload')
      return NextResponse.json(emptyAnalyticsPayload())
    }

    let developerIdsArray
    try {
      developerIdsArray = toTextArray(validDeveloperIds)
    } catch (error) {
      console.error('[EDITORIAL][USER_ANALYTICS] Error creating developerIdsArray:', error, { developerIds, validDeveloperIds })
      throw error
    }

    // Execute queries with individual error handling
    let totalVisits: number
    let uniqueUsers: Array<{ userId: string | null }>
    let avgDurationAgg: { _avg: { durationSeconds: number | null } }

    try {
      totalVisits = await prisma.userActivityEvent.count({ where: baseWhere })
    } catch (error) {
      console.error('[EDITORIAL][USER_ANALYTICS] Error counting total visits:', error)
      throw error
    }

    try {
      uniqueUsers = await prisma.userActivityEvent.findMany({
        where: baseWhere,
        select: { userId: true },
        distinct: ['userId']
      })
    } catch (error) {
      console.error('[EDITORIAL][USER_ANALYTICS] Error fetching unique users:', error)
      throw error
    }

    try {
      avgDurationAgg = await prisma.userActivityEvent.aggregate({
        _avg: { durationSeconds: true },
        where: baseWhere
      })
    } catch (error) {
      console.error('[EDITORIAL][USER_ANALYTICS] Error aggregating duration:', error)
      throw error
    }

    // Find most visited game (product detail pages only)
    // Only compute if pageType filter is 'all' or 'product' (or undefined)
    let mostVisitedGameRaw: Array<{
      productId: string
      slug: string
      title: string
      visits: number
    }> = []
    
    if (!pageType || pageType === 'product') {
      try {
        // Use split_part instead of REGEXP_REPLACE for better compatibility
        // Extract slug from path like '/product/slug-name' -> 'slug-name'
        mostVisitedGameRaw = await prisma.$queryRaw<Array<{
          productId: string
          slug: string
          title: string
          visits: number
        }>>`
          WITH product_visits AS (
            SELECT 
              TRIM(BOTH '/' FROM split_part(split_part(e."path", '/product/', 2), '/', 1)) AS slug,
              COUNT(*)::int AS visits
            FROM "UserActivityEvent" e
            WHERE e."userId" = ANY(${developerIdsArray})
              AND e."createdAt" >= ${fromDate}
              AND e."createdAt" <= ${toDate}
              AND e."path" LIKE '/product/%'
              AND (e."pageType" = 'product' OR e."path" ~ '^/product/[^/]+/?$')
            GROUP BY slug
            HAVING slug != '' AND slug IS NOT NULL
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
      } catch (error) {
        console.error('[EDITORIAL][USER_ANALYTICS] Error fetching most visited game:', error)
        if (error instanceof Error) {
          console.error('[EDITORIAL][USER_ANALYTICS] Error name:', error.name)
          console.error('[EDITORIAL][USER_ANALYTICS] Error message:', error.message)
          console.error('[EDITORIAL][USER_ANALYTICS] Error stack:', error.stack)
        }
        if (error && typeof error === 'object' && 'code' in error) {
          console.error('[EDITORIAL][USER_ANALYTICS] Prisma error code:', (error as any).code)
          console.error('[EDITORIAL][USER_ANALYTICS] Prisma error meta:', JSON.stringify((error as any).meta, null, 2))
        }
        // Continue without most visited game data
        mostVisitedGameRaw = []
      }
    }
    
    const mostVisitedGame = mostVisitedGameRaw[0] || null

    let visitsOverTime: { date: string; visits: number }[]
    try {
      visitsOverTime = await prisma.$queryRaw<{ date: string; visits: number }[]>`
        SELECT to_char(date_trunc('day', "createdAt"), 'YYYY-MM-DD') AS date,
               COUNT(*)::int AS visits
        FROM "UserActivityEvent"
        WHERE "userId" = ANY(${developerIdsArray})
          AND "createdAt" >= ${fromDate}
          AND "createdAt" <= ${toDate}
          ${pageType ? Prisma.sql`AND "pageType" = ${pageType}` : Prisma.empty}
        GROUP BY 1
        ORDER BY 1
      `
    } catch (error) {
      console.error('[EDITORIAL][USER_ANALYTICS] Error fetching visits over time:', error)
      if (error instanceof Error) {
        console.error('[EDITORIAL][USER_ANALYTICS] VisitsOverTime error details:', error.message)
      }
      visitsOverTime = []
    }

    let topPages: { path: string; pageType: string | null; visits: number; avgDurationSeconds: number }[]
    try {
      topPages = await prisma.$queryRaw<{ path: string; pageType: string | null; visits: number; avgDurationSeconds: number }[]>`
        SELECT "path",
               COALESCE("pageType", 'other') AS "pageType",
               COUNT(*)::int AS visits,
               AVG("durationSeconds")::float AS "avgDurationSeconds"
        FROM "UserActivityEvent"
        WHERE "userId" = ANY(${developerIdsArray})
          AND "createdAt" >= ${fromDate}
          AND "createdAt" <= ${toDate}
          ${pageType ? Prisma.sql`AND "pageType" = ${pageType}` : Prisma.empty}
        GROUP BY "path", "pageType"
        ORDER BY visits DESC
        LIMIT 10
      `
    } catch (error) {
      console.error('[EDITORIAL][USER_ANALYTICS] Error fetching top pages:', error)
      if (error instanceof Error) {
        console.error('[EDITORIAL][USER_ANALYTICS] TopPages error details:', error.message)
      }
      topPages = []
    }

    let userStats: { userId: string; email: string; name: string | null; totalVisits: number; avgDurationSeconds: number; lastSeenAt: Date }[]
    try {
      userStats = await prisma.$queryRaw<
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
          AND e."createdAt" >= ${fromDate}
          AND e."createdAt" <= ${toDate}
          ${pageType ? Prisma.sql`AND e."pageType" = ${pageType}` : Prisma.empty}
        GROUP BY u.id
        ORDER BY "totalVisits" DESC
        LIMIT ${pageSize} OFFSET ${(Math.max(page, 1) - 1) * pageSize}
      `
    } catch (error) {
      console.error('[EDITORIAL][USER_ANALYTICS] Error fetching user stats:', error)
      if (error instanceof Error) {
        console.error('[EDITORIAL][USER_ANALYTICS] UserStats error name:', error.name)
        console.error('[EDITORIAL][USER_ANALYTICS] UserStats error message:', error.message)
      }
      if (error && typeof error === 'object' && 'code' in error) {
        console.error('[EDITORIAL][USER_ANALYTICS] UserStats Prisma error code:', (error as any).code)
        console.error('[EDITORIAL][USER_ANALYTICS] UserStats Prisma error meta:', JSON.stringify((error as any).meta, null, 2))
      }
      throw error
    }

    const pageUserIds = userStats.map((user) => user.userId).filter(Boolean) as string[]

    let userTopPages: { userId: string; path: string; visits: number }[] = []
    if (pageUserIds.length > 0) {
      try {
        const pageUserIdsArray = toTextArray(pageUserIds)
        userTopPages = await prisma.$queryRaw<{ userId: string; path: string; visits: number }[]>`
          WITH selected_users AS (
            SELECT unnest(${pageUserIdsArray}) AS id
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
              AND e."createdAt" >= ${fromDate}
              AND e."createdAt" <= ${toDate}
              ${pageType ? Prisma.sql`AND e."pageType" = ${pageType}` : Prisma.empty}
            GROUP BY e."userId", e."path"
          ) ranked
          WHERE row_rank <= 3
          ORDER BY "userId", visits DESC
        `
      } catch (error) {
        console.error('[EDITORIAL][USER_ANALYTICS] Error fetching user top pages:', error)
        if (error instanceof Error) {
          console.error('[EDITORIAL][USER_ANALYTICS] UserTopPages error details:', error.message)
        }
        // Continue without user top pages data
        userTopPages = []
      }
    }

    const userTopPagesMap = userTopPages.reduce<Record<string, Array<{ path: string; visits: number }>>>((acc, item) => {
      if (!acc[item.userId]) acc[item.userId] = []
      acc[item.userId].push({ path: item.path, visits: Number(item.visits) })
      return acc
    }, {})

    // Fetch submitted games for each user
    let userSubmittedGames: Array<{ id: string; title: string; slug: string; userId: string }> = []
    if (pageUserIds.length > 0) {
      try {
        userSubmittedGames = await prisma.product.findMany({
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
      } catch (error) {
        console.error('[EDITORIAL][USER_ANALYTICS] Error fetching submitted games:', error)
        // Continue without submitted games data
        userSubmittedGames = []
      }
    }

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
    
    // Log detailed error information
    if (error instanceof Error) {
      console.error('[EDITORIAL][USER_ANALYTICS] Error name:', error.name)
      console.error('[EDITORIAL][USER_ANALYTICS] Error message:', error.message)
      console.error('[EDITORIAL][USER_ANALYTICS] Error stack:', error.stack)
    }
    
    // Check for Prisma errors
    if (error && typeof error === 'object' && 'code' in error) {
      console.error('[EDITORIAL][USER_ANALYTICS] Prisma error code:', (error as any).code)
      console.error('[EDITORIAL][USER_ANALYTICS] Prisma error meta:', (error as any).meta)
    }
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : String(error)) : undefined
      },
      { status: 500 }
    )
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

