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

    const followsByGame = await prisma.follow.groupBy({
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

    return NextResponse.json({
      internalClicks: processedInternalClicks,
      externalClicks: processedExternalClicks,
      clicksByPlatform: processedClicksByPlatform,
      clicksOverTime: processedClicksOverTime,
      votesVsFollows: processedVotesVsFollows
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
