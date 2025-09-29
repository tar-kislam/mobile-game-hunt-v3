"use client"

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import CampaignPerformanceDashboard from '@/components/campaign/CampaignPerformanceDashboard'
import PaymentPlaceholder from '@/components/campaign/PaymentPlaceholder'
import { motion } from 'framer-motion'
import { ArrowLeftIcon, CreditCardIcon, BarChart3Icon } from 'lucide-react'
import Link from 'next/link'

interface Campaign {
  id: string
  goal: string
  budget: number
  status: string
  startDate: string
  endDate: string
  createdAt: string
}

interface CampaignPageProps {
  params: {
    id: string
  }
}

export default function CampaignPage({ params }: CampaignPageProps) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (status !== 'loading') {
      fetchCampaign()
    }
  }, [status, params.id])

  const fetchCampaign = async () => {
    try {
      const response = await fetch(`/api/advertise/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setCampaign(data.campaign)
      } else {
        setError('Campaign not found')
      }
    } catch (err) {
      setError('Error loading campaign')
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  if (!session) {
    router.push('/auth/signin')
    return null
  }

  if (error || !campaign) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center">
        <Card className="bg-gray-800/50 border-gray-700 max-w-md">
          <CardContent className="p-6 text-center">
            <p className="text-gray-400 mb-4">{error || 'Campaign not found'}</p>
            <Button asChild variant="outline">
              <Link href="/dashboard">
                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button asChild variant="outline" size="sm">
              <Link href="/dashboard">
                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
            <Badge 
              variant={campaign.status === 'ACTIVE' ? 'default' : 'secondary'}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {campaign.status}
            </Badge>
          </div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl font-bold text-white mb-2">Campaign Management</h1>
            <p className="text-gray-400">
              {campaign.goal} • {formatCurrency(campaign.budget)} • 
              {new Date(campaign.startDate).toLocaleDateString()} - {new Date(campaign.endDate).toLocaleDateString()}
            </p>
          </motion.div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="analytics" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-gray-800 border-gray-700">
            <TabsTrigger value="analytics" className="data-[state=active]:bg-purple-600">
              <BarChart3Icon className="h-4 w-4 mr-2" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="payments" className="data-[state=active]:bg-purple-600">
              <CreditCardIcon className="h-4 w-4 mr-2" />
              Payments
            </TabsTrigger>
          </TabsList>

          <TabsContent value="analytics" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <CampaignPerformanceDashboard campaignId={campaign.id} />
            </motion.div>
          </TabsContent>

          <TabsContent value="payments" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="flex justify-center"
            >
              <PaymentPlaceholder 
                campaignId={campaign.id}
                campaignName={campaign.goal}
                amount={campaign.budget}
              />
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
