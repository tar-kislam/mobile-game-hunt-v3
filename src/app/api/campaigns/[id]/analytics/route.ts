import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Normalize Next 15 route context typing

// GET /api/campaigns/[id]/analytics - Get campaign performance analytics
export async function GET(req: Request, context: any) {
  const params = (context?.params || {}) as { id: string }
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Check if campaign exists and belongs to user
    const campaign = await prisma.advertiseCampaign.findFirst({
      where: {
        id: params.id,
        userId: session.user.id
      }
    })

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
    }

    // Get campaign metrics (placeholder - would integrate with Google Analytics)
    const analytics = {
      campaignId: params.id,
      campaignName: campaign.goal,
      status: campaign.status,
      startDate: campaign.startDate,
      endDate: campaign.endDate,
      budget: campaign.budget,
      
      // Placeholder metrics - would come from Google Analytics
      metrics: {
        impressions: Math.floor(Math.random() * 10000) + 1000, // Random for demo
        clicks: Math.floor(Math.random() * 1000) + 100,
        conversions: Math.floor(Math.random() * 100) + 10,
        ctr: 0, // Click-through rate
        cpm: 0, // Cost per mille (impression)
        cpc: 0, // Cost per click
        cpa: 0, // Cost per acquisition
        spend: 0, // Actual spend
        remaining: campaign.budget
      },
      
      // Audience breakdown
      audience: {
        countries: (campaign.audience as any)?.countries || [],
        ageGroups: (campaign.audience as any)?.ageRange || [],
        interests: (campaign.audience as any)?.interests || []
      },
      
      // Performance over time (placeholder data)
      performanceOverTime: Array.from({ length: 7 }, (_, i) => ({
        date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        impressions: Math.floor(Math.random() * 1000) + 100,
        clicks: Math.floor(Math.random() * 100) + 10,
        conversions: Math.floor(Math.random() * 10) + 1
      })),
      
      // Device breakdown
      deviceBreakdown: {
        mobile: Math.floor(Math.random() * 60) + 40, // 40-100%
        desktop: Math.floor(Math.random() * 40) + 10, // 10-50%
        tablet: Math.floor(Math.random() * 20) + 5 // 5-25%
      },
      
      // Integration status
      integration: {
        googleAnalytics: {
          connected: false, // Would be true when GA4 is integrated
          accountId: null,
          propertyId: null,
          lastSync: null
        },
        tracking: {
          impressions: 'pending', // Would track actual impressions
          clicks: 'pending', // Would track actual clicks
          conversions: 'pending' // Would track actual conversions
        }
      }
    }

    // Calculate derived metrics
    if (analytics.metrics.impressions > 0) {
      analytics.metrics.ctr = (analytics.metrics.clicks / analytics.metrics.impressions) * 100
    }
    
    if (analytics.metrics.impressions > 0) {
      analytics.metrics.cpm = (analytics.metrics.spend / analytics.metrics.impressions) * 1000
    }
    
    if (analytics.metrics.clicks > 0) {
      analytics.metrics.cpc = analytics.metrics.spend / analytics.metrics.clicks
    }
    
    if (analytics.metrics.conversions > 0) {
      analytics.metrics.cpa = analytics.metrics.spend / analytics.metrics.conversions
    }

    return NextResponse.json({ analytics })
  } catch (error) {
    console.error('Error fetching campaign analytics:', error)
    return NextResponse.json({ error: 'Failed to fetch campaign analytics' }, { status: 500 })
  }
}

// POST /api/campaigns/[id]/analytics/track - Track campaign event
export async function POST(req: Request, context: any) {
  const params = (context?.params || {}) as { id: string }
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { event, data } = body

    // Check if campaign exists and belongs to user
    const campaign = await prisma.advertiseCampaign.findFirst({
      where: {
        id: params.id,
        userId: session.user.id
      }
    })

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
    }

    // Track event in database (placeholder - would integrate with GA4)
    const metric = await prisma.metric.create({
      data: {
        productId: '', // Campaign tracking would need a separate metric type
        userId: session.user.id,
        type: `campaign_${event}` as any,
        metadata: {
          campaignId: params.id,
          event,
          data,
          timestamp: new Date().toISOString()
        }
      }
    })

    // In a real implementation, this would also send to Google Analytics
    // gtag('event', event, {
    //   campaign_id: params.id,
    //   ...data
    // })

    return NextResponse.json({ 
      success: true,
      metric,
      message: 'Event tracked successfully'
    })
  } catch (error) {
    console.error('Error tracking campaign event:', error)
    return NextResponse.json({ error: 'Failed to track event' }, { status: 500 })
  }
}
