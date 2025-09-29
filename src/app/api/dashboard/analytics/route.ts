import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get gameId from query params
    const { searchParams } = new URL(request.url)
    const gameId = searchParams.get('gameId')

    // Get all product IDs for the developer
    const userProducts = await prisma.product.findMany({
      where: { userId: user.id },
      select: { id: true }
    })

    const productIds = userProducts.map(p => p.id)

    if (productIds.length === 0) {
      return NextResponse.json({
        clicksByPlatform: [],
        clicksOverTime: [],
        votesVsFollows: [],
        internalClicks: [],
        externalClicks: []
      })
    }

    // Filter by specific gameId if provided, otherwise use all user's games
    const targetProductIds = gameId ? [gameId] : productIds

    // Verify the gameId belongs to the user
    if (gameId && !productIds.includes(gameId)) {
      return NextResponse.json({ error: 'Game not found or access denied' }, { status: 404 })
    }

    // Single optimized query for all metrics
    const allMetrics = await prisma.metric.groupBy({
      by: ['type'],
      where: {
        gameId: { in: targetProductIds }
      },
      _count: {
        type: true
      }
    })

    // Process metrics into categories
    const internalClicks = allMetrics.filter(m => 
      ['INTERNAL', 'view'].includes(m.type)
    )
    const externalClicks = allMetrics.filter(m => 
      ['IOS', 'ANDROID', 'STORE', 'PRE_REGISTER', 'DISCORD', 'WEBSITE', 'TIKTOK', 'STEAM'].includes(m.type)
    )
    const clicksByPlatform = allMetrics.filter(m => 
      ['IOS', 'ANDROID', 'STORE', 'PRE_REGISTER', 'DISCORD', 'WEBSITE', 'TIKTOK', 'STEAM'].includes(m.type)
    )

    // 4. Clicks Over Time by Category (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const clicksOverTimeByCategory = await prisma.metric.groupBy({
      by: ['timestamp', 'type'],
      where: {
        gameId: { in: targetProductIds },
        timestamp: {
          gte: thirtyDaysAgo
        },
        type: {
          in: ['INTERNAL', 'view', 'IOS', 'ANDROID', 'STORE', 'PRE_REGISTER', 'DISCORD', 'WEBSITE', 'TIKTOK', 'STEAM']
        }
      },
      _count: {
        timestamp: true
      }
    })

    // 3. Votes vs Follows by Game
    const votesByGame = await prisma.vote.groupBy({
      by: ['productId'],
      where: {
        productId: { in: targetProductIds }
      },
      _count: {
        productId: true
      }
    })

    const followsByGame = await prisma.gameFollow.groupBy({
      by: ['gameId'],
      where: {
        gameId: { in: targetProductIds }
      },
      _count: {
        gameId: true
      }
    })

    // Get product names for votes vs follows
    const productNames = await prisma.product.findMany({
      where: { id: { in: targetProductIds } },
      select: { id: true, title: true }
    })

    const productNameMap = new Map(productNames.map(p => [p.id, p.title]))

    // Process internal clicks - aggregate INTERNAL and view types
    const totalInternalClicks = internalClicks.reduce((sum, item) => sum + item._count.type, 0)
    const processedInternalClicks = totalInternalClicks > 0 ? [{
      name: 'Internal',
      value: totalInternalClicks,
      color: '#8B5CF6' // Purple for internal
    }] : []

    // Process external clicks - aggregate all external types into one "External" category
    const totalExternalClicks = externalClicks.reduce((sum, item) => sum + item._count.type, 0)
    const processedExternalClicks = totalExternalClicks > 0 ? [{
      name: 'External',
      value: totalExternalClicks,
      color: '#10B981' // Green for external
    }] : []

    // Process clicks by platform with correct mapping
    const processedClicksByPlatform = clicksByPlatform.map(item => ({
      name: getPlatformDisplayName(item.type),
      value: item._count.type,
      color: getPlatformColor(item.type)
    }))

    // Process clicks over time by category
    const clicksByDateAndCategory = new Map()
    
    // Initialize all dates in the last 30 days with 0 clicks for both categories
    for (let i = 0; i < 30; i++) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      clicksByDateAndCategory.set(dateStr, {
        date: dateStr,
        internal: 0,
        external: 0
      })
    }

    // Add actual click data by category
    clicksOverTimeByCategory.forEach(item => {
      const dateStr = item.timestamp.toISOString().split('T')[0]
      const existing = clicksByDateAndCategory.get(dateStr)
      
      if (existing) {
        if (['INTERNAL', 'view'].includes(item.type)) {
          existing.internal += item._count.timestamp
        } else if (['IOS', 'ANDROID', 'STORE', 'PRE_REGISTER', 'DISCORD', 'WEBSITE', 'TIKTOK', 'STEAM'].includes(item.type)) {
          existing.external += item._count.timestamp
        }
      }
    })

    // Convert to array and sort by date
    const processedClicksOverTime = Array.from(clicksByDateAndCategory.values())
      .sort((a, b) => a.date.localeCompare(b.date))

    // Process votes vs follows
    const votesVsFollowsMap = new Map()
    
    // Initialize with all target products
    targetProductIds.forEach(productId => {
      votesVsFollowsMap.set(productId, {
        name: productNameMap.get(productId) || 'Unknown',
        votes: 0,
        follows: 0
      })
    })

    // Add votes data
    votesByGame.forEach(item => {
      const existing = votesVsFollowsMap.get(item.productId)
      if (existing) {
        existing.votes = item._count.productId
      }
    })

    // Add follows data
    followsByGame.forEach(item => {
      const existing = votesVsFollowsMap.get(item.gameId)
      if (existing) {
        existing.follows = item._count.gameId
      }
    })

    const processedVotesVsFollows = Array.from(votesVsFollowsMap.values())

    // Audience Insights: compute Top Countries and Language Preferences
    const recentAudienceMetrics = await prisma.metric.findMany({
      where: { gameId: { in: targetProductIds } },
      select: { userAgent: true, referrer: true }
    })

    // Country detection (lightweight heuristic without external API)
    const countryCounts = recentAudienceMetrics
      .map((m) => {
        const ref = m.referrer || ''
        if (ref.includes('.us') || ref.includes('google.com')) return 'United States'
        if (ref.includes('.uk') || ref.includes('google.co.uk')) return 'United Kingdom'
        if (ref.includes('.de') || ref.includes('google.de')) return 'Germany'
        if (ref.includes('.fr') || ref.includes('google.fr')) return 'France'
        if (ref.includes('.jp') || ref.includes('google.co.jp')) return 'Japan'
        if (ref.includes('.tr') || ref.includes('google.com.tr')) return 'Turkey'
        if (ref.includes('.in') || ref.includes('google.co.in')) return 'India'
        if (ref.includes('.br') || ref.includes('google.com.br')) return 'Brazil'
        if (ref.includes('.ca') || ref.includes('google.ca')) return 'Canada'
        if (ref.includes('.au') || ref.includes('google.com.au')) return 'Australia'
        return 'Unknown'
      })
      .reduce((acc: Record<string, number>, c) => {
        acc[c] = (acc[c] || 0) + 1
        return acc
      }, {})

    const geoStatsArray = Object.entries(countryCounts)
      .map(([country, count]) => ({ country, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    // Language detection from userAgent
    const languageCounts = recentAudienceMetrics
      .map((m) => m.userAgent || '')
      .map((ua) => {
        if (ua.includes('en-')) return 'English'
        if (ua.includes('tr-')) return 'Turkish'
        if (ua.includes('de-')) return 'German'
        if (ua.includes('fr-')) return 'French'
        if (ua.includes('es-')) return 'Spanish'
        if (ua.includes('pt-')) return 'Portuguese'
        if (ua.includes('ru-')) return 'Russian'
        if (ua.includes('ja-')) return 'Japanese'
        if (ua.includes('ko-')) return 'Korean'
        if (ua.includes('zh-')) return 'Chinese'
        return 'English'
      })
      .reduce((acc: Record<string, number>, l) => {
        acc[l] = (acc[l] || 0) + 1
        return acc
      }, {})

    const languagePreferencesArray = Object.entries(languageCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10)

    // Totals for overview and engagement
    const totalViews = processedClicksOverTime.reduce((sum, d) => sum + d.internal + d.external, 0)
    const totalVotes = processedVotesVsFollows.reduce((sum, row) => sum + (row.votes || 0), 0)
    const totalFollows = processedVotesVsFollows.reduce((sum, row) => sum + (row.follows || 0), 0)
    const totalClicks = processedClicksByPlatform.reduce((sum, row) => sum + (row.value || 0), 0) + (processedInternalClicks[0]?.value || 0)
    const totalComments = 0
    const totalWishlist = 0
    const totalShares = (processedExternalClicks[0]?.value || 0)

    // Engagement Rate
    const engagements = totalVotes + totalFollows + totalClicks + totalComments + totalWishlist + totalShares
    const engagementRate = totalViews > 0 ? Math.round(((engagements / totalViews) * 100) * 10) / 10 : 0

    return NextResponse.json({
      internalClicks: processedInternalClicks,
      externalClicks: processedExternalClicks,
      clicksByPlatform: processedClicksByPlatform,
      clicksOverTime: processedClicksOverTime,
      votesVsFollows: processedVotesVsFollows,
      geoStats: geoStatsArray,
      languagePreferences: languagePreferencesArray,
      overviewTotals: {
        totalViews,
        totalVotes,
        totalFollows,
        totalClicks,
        engagementRate
      }
    })
  } catch (error) {
    console.error('Error fetching dashboard analytics:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function getPlatformDisplayName(type: string): string {
  const displayNames: { [key: string]: string } = {
    'IOS': 'App Store',
    'ANDROID': 'Google Play',
    'STORE': 'App Store',
    'PRE_REGISTER': 'Pre-register',
    'DISCORD': 'Discord',
    'WEBSITE': 'Website',
    'TIKTOK': 'TikTok',
    'STEAM': 'Steam'
  }
  return displayNames[type.toUpperCase()] || type
}

function getPlatformColor(platform: string): string {
  const colors: { [key: string]: string } = {
    'IOS': '#10B981',        // Green for App Store
    'ANDROID': '#3B82F6',    // Blue for Google Play
    'STORE': '#10B981',      // Green for App Store
    'PRE_REGISTER': '#8B5CF6', // Purple for Pre-register
    'DISCORD': '#8B5CF6',    // Purple for Discord
    'WEBSITE': '#F59E0B',    // Orange for Website
    'TIKTOK': '#EF4444',    // Red for TikTok
    'STEAM': '#6366F1'       // Indigo for Steam
  }
  return colors[platform.toUpperCase()] || '#6B7280'
}
