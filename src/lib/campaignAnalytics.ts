// Campaign Analytics Integration
// This file provides utilities for integrating campaign tracking with Google Analytics

interface CampaignEvent {
  campaignId: string
  event: 'impression' | 'click' | 'conversion' | 'view'
  metadata?: Record<string, any>
}

interface CampaignMetrics {
  impressions: number
  clicks: number
  conversions: number
  views: number
  ctr: number
  conversionRate: number
}

// Google Analytics 4 Event Tracking
export const trackCampaignEvent = (event: CampaignEvent) => {
  // Check if gtag is available (Google Analytics)
  if (typeof window !== 'undefined' && (window as any).gtag) {
    const gtag = (window as any).gtag
    
    // Track campaign-specific events
    gtag('event', event.event, {
      campaign_id: event.campaignId,
      custom_parameter_campaign_type: 'advertising',
      ...event.metadata
    })

    // Track to custom dimension for campaign analysis
    gtag('event', 'campaign_interaction', {
      campaign_id: event.campaignId,
      interaction_type: event.event,
      ...event.metadata
    })
  }

  // Also track in our internal system
  trackInternalEvent(event)
}

// Internal event tracking (our database)
export const trackInternalEvent = async (event: CampaignEvent) => {
  try {
    await fetch('/api/campaigns/analytics/track', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(event)
    })
  } catch (error) {
    console.error('Failed to track internal event:', error)
  }
}

// Campaign performance tracking
export const trackCampaignImpression = (campaignId: string, placement?: string) => {
  trackCampaignEvent({
    campaignId,
    event: 'impression',
    metadata: {
      placement: placement || 'unknown',
      timestamp: new Date().toISOString()
    }
  })
}

export const trackCampaignClick = (campaignId: string, target?: string) => {
  trackCampaignEvent({
    campaignId,
    event: 'click',
    metadata: {
      target: target || 'unknown',
      timestamp: new Date().toISOString()
    }
  })
}

export const trackCampaignConversion = (campaignId: string, conversionType?: string) => {
  trackCampaignEvent({
    campaignId,
    event: 'conversion',
    metadata: {
      conversion_type: conversionType || 'general',
      timestamp: new Date().toISOString()
    }
  })
}

export const trackCampaignView = (campaignId: string, viewType?: string) => {
  trackCampaignEvent({
    campaignId,
    event: 'view',
    metadata: {
      view_type: viewType || 'page',
      timestamp: new Date().toISOString()
    }
  })
}

// Calculate campaign metrics
export const calculateCampaignMetrics = (data: any[]): CampaignMetrics => {
  const impressions = data.filter(d => d.event === 'impression').length
  const clicks = data.filter(d => d.event === 'click').length
  const conversions = data.filter(d => d.event === 'conversion').length
  const views = data.filter(d => d.event === 'view').length

  return {
    impressions,
    clicks,
    conversions,
    views,
    ctr: impressions > 0 ? (clicks / impressions) * 100 : 0,
    conversionRate: clicks > 0 ? (conversions / clicks) * 100 : 0
  }
}

// Google Analytics 4 Enhanced Ecommerce for Campaigns
export const trackCampaignPurchase = (campaignId: string, value: number, currency = 'USD') => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    const gtag = (window as any).gtag
    
    gtag('event', 'purchase', {
      transaction_id: `campaign_${campaignId}_${Date.now()}`,
      value: value,
      currency: currency,
      campaign_id: campaignId,
      items: [{
        item_id: campaignId,
        item_name: `Campaign ${campaignId}`,
        category: 'Advertising',
        quantity: 1,
        price: value
      }]
    })
  }
}

// Campaign funnel tracking
export const trackCampaignFunnel = (campaignId: string, step: string, stepNumber: number) => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    const gtag = (window as any).gtag
    
    gtag('event', 'campaign_funnel_step', {
      campaign_id: campaignId,
      funnel_step: step,
      step_number: stepNumber,
      timestamp: new Date().toISOString()
    })
  }
}

// Audience tracking for campaigns
export const trackCampaignAudience = (campaignId: string, audienceData: {
  country?: string
  ageGroup?: string
  interests?: string[]
  device?: string
}) => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    const gtag = (window as any).gtag
    
    gtag('event', 'campaign_audience_engagement', {
      campaign_id: campaignId,
      audience_country: audienceData.country,
      audience_age_group: audienceData.ageGroup,
      audience_interests: audienceData.interests?.join(','),
      audience_device: audienceData.device,
      timestamp: new Date().toISOString()
    })
  }
}

// Real-time campaign monitoring
export const initializeCampaignTracking = (campaignId: string) => {
  // Track page view for campaign
  trackCampaignView(campaignId, 'campaign_page')
  
  // Set up periodic impression tracking (if on a campaign page)
  if (typeof window !== 'undefined') {
    const interval = setInterval(() => {
      trackCampaignImpression(campaignId, 'page_visible')
    }, 30000) // Every 30 seconds
    
    // Clean up on page unload
    window.addEventListener('beforeunload', () => {
      clearInterval(interval)
    })
  }
}

// Export types for TypeScript
export type { CampaignEvent, CampaignMetrics }
