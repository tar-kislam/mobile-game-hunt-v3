"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { motion } from 'framer-motion'
import { 
  TrendingUpIcon, 
  EyeIcon, 
  MousePointerClickIcon, 
  TargetIcon,
  DollarSignIcon,
  CalendarIcon,
  GlobeIcon,
  SmartphoneIcon,
  MonitorIcon,
  TabletIcon
} from 'lucide-react'

interface CampaignAnalytics {
  campaignId: string
  campaignName: string
  status: string
  startDate: string
  endDate: string
  budget: number
  metrics: {
    impressions: number
    clicks: number
    conversions: number
    ctr: number
    cpm: number
    cpc: number
    cpa: number
    spend: number
    remaining: number
  }
  audience: {
    countries: string[]
    ageGroups: string[]
    interests: string[]
  }
  performanceOverTime: Array<{
    date: string
    impressions: number
    clicks: number
    conversions: number
  }>
  deviceBreakdown: {
    mobile: number
    desktop: number
    tablet: number
  }
  integration: {
    googleAnalytics: {
      connected: boolean
      accountId: string | null
      propertyId: string | null
      lastSync: string | null
    }
    tracking: {
      impressions: string
      clicks: string
      conversions: string
    }
  }
}

interface CampaignPerformanceDashboardProps {
  campaignId: string
}

export default function CampaignPerformanceDashboard({ campaignId }: CampaignPerformanceDashboardProps) {
  const [analytics, setAnalytics] = useState<CampaignAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchAnalytics()
  }, [campaignId])

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(`/api/campaigns/${campaignId}/analytics`)
      if (response.ok) {
        const data = await response.json()
        setAnalytics(data.analytics)
      } else {
        setError('Failed to fetch analytics')
      }
    } catch (err) {
      setError('Error loading analytics')
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-700 rounded w-1/2 mb-2"></div>
                  <div className="h-8 bg-gray-700 rounded w-3/4"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error || !analytics) {
    return (
      <Card className="bg-gray-800/50 border-gray-700">
        <CardContent className="p-6 text-center">
          <p className="text-gray-400">{error || 'No analytics data available'}</p>
          <Button onClick={fetchAnalytics} className="mt-4">
            Retry
          </Button>
        </CardContent>
      </Card>
    )
  }

  const budgetUsed = analytics.metrics.spend
  const budgetRemaining = analytics.metrics.remaining
  const budgetProgress = (budgetUsed / analytics.budget) * 100

  return (
    <div className="space-y-6">
      {/* Campaign Header */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-xl text-white">{analytics.campaignName}</CardTitle>
              <div className="flex items-center gap-4 mt-2">
                <Badge 
                  variant={analytics.status === 'ACTIVE' ? 'default' : 'secondary'}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  {analytics.status}
                </Badge>
                <div className="flex items-center gap-1 text-gray-400 text-sm">
                  <CalendarIcon className="h-4 w-4" />
                  {new Date(analytics.startDate).toLocaleDateString()} - {new Date(analytics.endDate).toLocaleDateString()}
                </div>
              </div>
            </div>
            <Button 
              onClick={fetchAnalytics}
              variant="outline"
              size="sm"
              className="border-gray-600 text-gray-300 hover:text-white"
            >
              Refresh
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Impressions</p>
                <p className="text-2xl font-bold text-white">{formatNumber(analytics.metrics.impressions)}</p>
              </div>
              <EyeIcon className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Clicks</p>
                <p className="text-2xl font-bold text-white">{formatNumber(analytics.metrics.clicks)}</p>
                <p className="text-xs text-green-400">CTR: {analytics.metrics.ctr.toFixed(2)}%</p>
              </div>
              <MousePointerClickIcon className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Conversions</p>
                <p className="text-2xl font-bold text-white">{formatNumber(analytics.metrics.conversions)}</p>
                <p className="text-xs text-purple-400">CPA: {formatCurrency(analytics.metrics.cpa)}</p>
              </div>
              <TargetIcon className="h-8 w-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Spend</p>
                <p className="text-2xl font-bold text-white">{formatCurrency(analytics.metrics.spend)}</p>
                <p className="text-xs text-orange-400">CPC: {formatCurrency(analytics.metrics.cpc)}</p>
              </div>
              <DollarSignIcon className="h-8 w-8 text-orange-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Budget Progress */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-lg text-white">Budget Progress</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Used: {formatCurrency(budgetUsed)}</span>
              <span className="text-gray-400">Remaining: {formatCurrency(budgetRemaining)}</span>
            </div>
            <Progress value={budgetProgress} className="h-2" />
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-400">Total Budget: {formatCurrency(analytics.budget)}</span>
              <span className="text-white font-medium">{budgetProgress.toFixed(1)}% used</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Device Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-lg text-white">Device Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <SmartphoneIcon className="h-5 w-5 text-blue-400" />
                  <span className="text-gray-300">Mobile</span>
                </div>
                <span className="text-white font-medium">{analytics.deviceBreakdown.mobile}%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MonitorIcon className="h-5 w-5 text-green-400" />
                  <span className="text-gray-300">Desktop</span>
                </div>
                <span className="text-white font-medium">{analytics.deviceBreakdown.desktop}%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TabletIcon className="h-5 w-5 text-purple-400" />
                  <span className="text-gray-300">Tablet</span>
                </div>
                <span className="text-white font-medium">{analytics.deviceBreakdown.tablet}%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-lg text-white">Target Audience</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-400 mb-2">Countries</p>
                <div className="flex flex-wrap gap-1">
                  {analytics.audience.countries.slice(0, 3).map((country, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {country}
                    </Badge>
                  ))}
                  {analytics.audience.countries.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{analytics.audience.countries.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-400 mb-2">Age Groups</p>
                <div className="flex flex-wrap gap-1">
                  {analytics.audience.ageGroups.slice(0, 2).map((age, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {age}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Integration Status */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-lg text-white">Integration Status</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GlobeIcon className="h-5 w-5 text-blue-400" />
                <span className="text-gray-300">Google Analytics</span>
              </div>
              <Badge variant={analytics.integration.googleAnalytics.connected ? 'default' : 'secondary'}>
                {analytics.integration.googleAnalytics.connected ? 'Connected' : 'Not Connected'}
              </Badge>
            </div>
            <div className="text-sm text-gray-400">
              {analytics.integration.googleAnalytics.connected 
                ? `Last sync: ${analytics.integration.googleAnalytics.lastSync || 'Never'}`
                : 'Connect Google Analytics to track real performance data'
              }
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
