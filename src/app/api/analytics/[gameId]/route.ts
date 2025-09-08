import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ gameId: string }> }
) {
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

    const { gameId } = await params

    // Verify the game belongs to the user
    const game = await prisma.product.findFirst({
      where: { 
        id: gameId,
        userId: user.id 
      },
      select: { id: true, title: true }
    })

    if (!game) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 })
    }

    // Return deterministic dummy analytics for "Puzzle Master"
    if (game.title === 'Puzzle Master') {
      const today = new Date()
      const makeSeries = (key: 'votes' | 'followers') => {
        const arr: Array<{ date: string; [k: string]: number }> = []
        for (let i = 29; i >= 0; i--) {
          const d = new Date(today)
          d.setDate(today.getDate() - i)
          const base = 10 + Math.round(8 * Math.sin((i / 30) * Math.PI * 2))
          arr.push({ date: d.toISOString().split('T')[0], [key]: Math.max(0, base + (key === 'votes' ? 2 : 4)) })
        }
        return arr
      }

      const votesOverTimeArray = makeSeries('votes') as Array<{ date: string; votes: number }>
      const followersOverTimeArray = makeSeries('followers') as Array<{ date: string; followers: number }>

      const clicksByType = [
        { type: 'IOS', value: 340, color: getPlatformColor('IOS') },
        { type: 'ANDROID', value: 410, color: getPlatformColor('ANDROID') },
        { type: 'STEAM', value: 120, color: getPlatformColor('STEAM') },
        { type: 'DISCORD', value: 90, color: getPlatformColor('DISCORD') },
        { type: 'WEB', value: 260, color: getPlatformColor('WEB') },
      ]

      const internalVsExternal = [
        { type: 'Internal', value: 950, color: '#8B5CF6' },
        { type: 'External', value: 270, color: '#10B981' },
      ]

      const geoStatsArray = [
        { country: 'United States', count: 420 },
        { country: 'United Kingdom', count: 180 },
        { country: 'Germany', count: 150 },
        { country: 'France', count: 120 },
        { country: 'Japan', count: 110 },
        { country: 'Canada', count: 95 },
        { country: 'Australia', count: 80 },
      ]

      const languageStatsArray = [
        { type: 'en', value: 720, color: getLanguageColor('en') },
        { type: 'de', value: 140, color: getLanguageColor('de') },
        { type: 'fr', value: 130, color: getLanguageColor('fr') },
        { type: 'ja', value: 110, color: getLanguageColor('ja') },
        { type: 'es', value: 95, color: getLanguageColor('es') },
      ]

      const deviceStatsArray = [
        { type: 'ios', value: 520, color: getDeviceColor('ios') },
        { type: 'android', value: 610, color: getDeviceColor('android') },
        { type: 'web', value: 260, color: getDeviceColor('web') },
        { type: 'desktop', value: 140, color: getDeviceColor('desktop') },
      ]

      const trafficTimelineArray = Array.from({ length: 24 }, (_, hour) => ({
        hour: `${hour}:00`,
        traffic: 20 + Math.round(30 * Math.abs(Math.sin((hour / 24) * Math.PI * 2)))
      }))

      const totalVotes = votesOverTimeArray.reduce((a, c) => a + c.votes, 0)
      const totalFollows = followersOverTimeArray.reduce((a, c) => a + c.followers, 0)
      const totalClicks = clicksByType.reduce((a, c) => a + c.value, 0) + internalVsExternal[0].value
      const totalViews = totalClicks + 500
      const engagementRate = totalViews > 0 ? Math.round(((totalVotes + totalFollows) / totalViews) * 10000) / 100 : 0

      const topClickedLink = clicksByType.slice().sort((a, b) => b.value - a.value)[0]
      const peakTrafficHour = trafficTimelineArray.reduce((max, cur) => (cur.traffic > max.traffic ? cur : max))

      return NextResponse.json({
        game: { id: game.id, title: game.title },
        overview: {
          totalViews,
          totalVotes,
          totalFollows,
          totalClicks,
          engagementRate,
        },
        charts: {
          votesOverTime: votesOverTimeArray,
          followersGrowth: followersOverTimeArray,
          clicksByType,
          internalVsExternal,
          geoStats: geoStatsArray,
          languagePreferences: languageStatsArray,
          deviceSplit: deviceStatsArray,
          trafficTimeline: trafficTimelineArray,
        },
        insights: {
          topClickedLink: topClickedLink ? { type: topClickedLink.name, count: topClickedLink.value } : null,
          topCountry: geoStatsArray[0] || null,
          peakTrafficHour,
        },
      })
    }

    // Get all metrics for this specific game
    const metrics = await prisma.metric.findMany({
      where: { gameId },
      select: {
        type: true,
        timestamp: true,
        userAgent: true,
        ipAddress: true,
        referrer: true
      }
    })

    // Get votes for this game
    const votes = await prisma.vote.findMany({
      where: { productId: gameId },
      select: { createdAt: true }
    })

    // Get follows for this game
    const follows = await prisma.follow.findMany({
      where: { gameId },
      select: { createdAt: true }
    })

    // Get views for this game (from metrics table - using INTERNAL type as views)
    const views = await prisma.metric.findMany({
      where: { 
        gameId,
        type: 'INTERNAL'
      },
      select: { 
        timestamp: true
      }
    })

    // Process clicks by type
    const clicksByType = metrics.reduce((acc, metric) => {
      const type = metric.type
      acc[type] = (acc[type] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Process clicks by platform
    const platformClicks = Object.entries(clicksByType)
      .filter(([type]) => ['IOS', 'ANDROID', 'STEAM', 'WEB', 'DISCORD'].includes(type))
      .map(([type, count]) => ({
        name: type,
        value: count,
        color: getPlatformColor(type)
      }))

    // Process internal vs external clicks
    const internalClicks = clicksByType['INTERNAL'] || 0
    const externalClicks = Object.entries(clicksByType)
      .filter(([type]) => type !== 'INTERNAL')
      .reduce((sum, [, count]) => sum + count, 0)

    const internalVsExternal = [
      { name: 'Internal', value: internalClicks, color: '#8B5CF6' },
      { name: 'External', value: externalClicks, color: '#10B981' }
    ]

    // Process votes over time (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const votesOverTime = votes
      .filter(vote => vote.createdAt >= thirtyDaysAgo)
      .reduce((acc, vote) => {
        const date = vote.createdAt.toISOString().split('T')[0]
        acc[date] = (acc[date] || 0) + 1
        return acc
      }, {} as Record<string, number>)

    // Fill in missing dates with 0 votes
    const votesOverTimeArray = []
    for (let i = 0; i < 30; i++) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      votesOverTimeArray.unshift({
        date: dateStr,
        votes: votesOverTime[dateStr] || 0
      })
    }

    // Process followers growth (last 30 days)
    const followersOverTime = follows
      .filter(follow => follow.createdAt >= thirtyDaysAgo)
      .reduce((acc, follow) => {
        const date = follow.createdAt.toISOString().split('T')[0]
        acc[date] = (acc[date] || 0) + 1
        return acc
      }, {} as Record<string, number>)

    // Fill in missing dates with 0 follows
    const followersOverTimeArray = []
    for (let i = 0; i < 30; i++) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      followersOverTimeArray.unshift({
        date: dateStr,
        followers: followersOverTime[dateStr] || 0
      })
    }

    // Process geo stats (from referrer/IP - simplified)
    const geoStats = metrics
      .map(metric => {
        // Simple country detection based on referrer domain
        if (metric.referrer) {
          if (metric.referrer.includes('.us') || metric.referrer.includes('google.com')) return 'United States'
          if (metric.referrer.includes('.uk') || metric.referrer.includes('google.co.uk')) return 'United Kingdom'
          if (metric.referrer.includes('.de') || metric.referrer.includes('google.de')) return 'Germany'
          if (metric.referrer.includes('.fr') || metric.referrer.includes('google.fr')) return 'France'
          if (metric.referrer.includes('.jp') || metric.referrer.includes('google.co.jp')) return 'Japan'
          if (metric.referrer.includes('.ca') || metric.referrer.includes('google.ca')) return 'Canada'
          if (metric.referrer.includes('.au') || metric.referrer.includes('google.com.au')) return 'Australia'
        }
        return 'Unknown'
      })
      .reduce((acc, country) => {
        acc[country] = (acc[country] || 0) + 1
        return acc
      }, {} as Record<string, number>)

    const geoStatsArray = Object.entries(geoStats)
      .map(([country, count]) => ({ country, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10) // Top 10 countries

    // Process language preferences (from userAgent - simplified)
    const languageStats = metrics
      .map(metric => {
        // Simple language detection based on userAgent
        if (metric.userAgent) {
          if (metric.userAgent.includes('en-US') || metric.userAgent.includes('en-GB')) return 'en'
          if (metric.userAgent.includes('es-ES') || metric.userAgent.includes('es-MX')) return 'es'
          if (metric.userAgent.includes('fr-FR') || metric.userAgent.includes('fr-CA')) return 'fr'
          if (metric.userAgent.includes('de-DE')) return 'de'
          if (metric.userAgent.includes('it-IT')) return 'it'
          if (metric.userAgent.includes('pt-BR') || metric.userAgent.includes('pt-PT')) return 'pt'
          if (metric.userAgent.includes('ru-RU')) return 'ru'
          if (metric.userAgent.includes('ja-JP')) return 'ja'
          if (metric.userAgent.includes('ko-KR')) return 'ko'
          if (metric.userAgent.includes('zh-CN') || metric.userAgent.includes('zh-TW')) return 'zh'
        }
        return 'en' // Default to English
      })
      .reduce((acc, language) => {
        acc[language] = (acc[language] || 0) + 1
        return acc
      }, {} as Record<string, number>)

    const languageStatsArray = Object.entries(languageStats)
      .map(([language, count]) => ({
        name: language,
        value: count,
        color: getLanguageColor(language)
      }))

    // Process device/platform split (from userAgent)
    const deviceStats = metrics
      .map(metric => {
        // Simple device detection based on userAgent
        if (metric.userAgent) {
          if (metric.userAgent.includes('iPhone') || metric.userAgent.includes('iPad')) return 'ios'
          if (metric.userAgent.includes('Android')) return 'android'
          if (metric.userAgent.includes('Windows') || metric.userAgent.includes('Macintosh')) return 'desktop'
          if (metric.userAgent.includes('Mobile')) return 'mobile'
          if (metric.userAgent.includes('Tablet')) return 'tablet'
        }
        return 'web' // Default to web
      })
      .reduce((acc, device) => {
        acc[device] = (acc[device] || 0) + 1
        return acc
      }, {} as Record<string, number>)

    const deviceStatsArray = Object.entries(deviceStats)
      .map(([device, count]) => ({
        name: device,
        value: count,
        color: getDeviceColor(device)
      }))

    // Process traffic timeline (hourly distribution)
    const trafficTimeline = metrics
      .map(metric => new Date(metric.timestamp).getHours())
      .reduce((acc, hour) => {
        acc[hour] = (acc[hour] || 0) + 1
        return acc
      }, {} as Record<number, number>)

    const trafficTimelineArray = Array.from({ length: 24 }, (_, hour) => ({
      hour: `${hour}:00`,
      traffic: trafficTimeline[hour] || 0
    }))

    // Calculate engagement rate
    const totalViews = views.length
    const totalVotes = votes.length
    const totalFollows = follows.length
    const engagementRate = totalViews > 0 ? ((totalVotes + totalFollows) / totalViews * 100) : 0

    // Find top clicked link
    const topClickedLink = Object.entries(clicksByType)
      .filter(([type]) => type !== 'INTERNAL')
      .sort(([, a], [, b]) => b - a)[0]

    return NextResponse.json({
      game: {
        id: game.id,
        title: game.title
      },
      overview: {
        totalViews,
        totalVotes,
        totalFollows,
        totalClicks: metrics.length,
        engagementRate: Math.round(engagementRate * 100) / 100
      },
      charts: {
        votesOverTime: votesOverTimeArray,
        followersGrowth: followersOverTimeArray,
        clicksByType: platformClicks,
        internalVsExternal: internalVsExternal,
        geoStats: geoStatsArray,
        languagePreferences: languageStatsArray,
        deviceSplit: deviceStatsArray,
        trafficTimeline: trafficTimelineArray
      },
      insights: {
        topClickedLink: topClickedLink ? {
          type: topClickedLink[0],
          count: topClickedLink[1]
        } : null,
        topCountry: geoStatsArray[0] || null,
        peakTrafficHour: trafficTimelineArray.reduce((max, current) => 
          current.traffic > max.traffic ? current : max
        )
      }
    })
  } catch (error) {
    console.error('Error fetching game analytics:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function getPlatformColor(platform: string): string {
  const colors: { [key: string]: string } = {
    'IOS': '#10B981',
    'ANDROID': '#3B82F6',
    'STEAM': '#F59E0B',
    'WEB': '#8B5CF6',
    'DISCORD': '#6366F1'
  }
  return colors[platform.toUpperCase()] || '#6B7280'
}

function getLanguageColor(language: string): string {
  const colors: { [key: string]: string } = {
    'en': '#3B82F6',
    'es': '#10B981',
    'fr': '#8B5CF6',
    'de': '#F59E0B',
    'it': '#EF4444',
    'pt': '#6366F1',
    'ru': '#EC4899',
    'ja': '#14B8A6',
    'ko': '#F97316',
    'zh': '#84CC16'
  }
  return colors[language.toLowerCase()] || '#6B7280'
}

function getDeviceColor(device: string): string {
  const colors: { [key: string]: string } = {
    'ios': '#10B981',
    'android': '#3B82F6',
    'web': '#8B5CF6',
    'desktop': '#F59E0B',
    'mobile': '#EF4444',
    'tablet': '#6366F1'
  }
  return colors[device.toLowerCase()] || '#6B7280'
}
