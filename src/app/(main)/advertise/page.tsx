"use client"

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { toast } from 'sonner'

// Import new components
import Intro from '@/components/advertise/Intro'
import Wizard from '@/components/advertise/Wizard'
import Guest from '@/components/advertise/Guest'

interface CampaignData {
  goal: string
  placements: string[]
  packageType: string
  budget: number
  gameId: string
  gameName?: string
}

export default function AdvertisePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  // State management
  const [showIntro, setShowIntro] = useState(true)
  const [showWizard, setShowWizard] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  
  // Campaign data
  const [campaignData, setCampaignData] = useState<CampaignData>({
    goal: '',
    placements: [],
    packageType: '',
    budget: 0,
    gameId: '',
    gameName: ''
  })
  
  // Ref to track the latest campaign data for cache/save
  const campaignDataRef = useRef(campaignData)
  
  // Update ref whenever campaignData changes
  useEffect(() => {
    campaignDataRef.current = campaignData
  }, [campaignData])

  // Load from localStorage on mount (client-side cache only)
  useEffect(() => {
    if (status === 'loading') return
    try {
      const cached = typeof window !== 'undefined' ? localStorage.getItem('mgh_advertise_draft') : null
      if (cached) {
        const parsed = JSON.parse(cached)
        setCampaignData((prev) => ({ ...prev, ...parsed }))
      }
    } catch (err) {
      console.warn('Failed to read cached advertise draft', err)
    } finally {
      setIsLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status])

  const updateCampaignData = useCallback((field: string, value: any) => {
    setCampaignData(prev => ({ ...prev, [field]: value }))
  }, [])

  // Debounced cache to localStorage
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      try {
        if (typeof window !== 'undefined') {
          localStorage.setItem('mgh_advertise_draft', JSON.stringify(campaignDataRef.current))
        }
      } catch (err) {
        console.warn('Failed to cache advertise draft', err)
      }
    }, 600)
    return () => clearTimeout(timeoutId)
  }, [campaignData])

  // No server autosave; everything stays client-side until final submit

  const handleIntroComplete = () => {
    setShowIntro(false)
    setShowWizard(true)
  }

  const handleSubmit = async () => {
    const data = campaignDataRef.current
    
    // Validate required fields
    if (!data.goal) {
      toast.error('Please select an advertising goal')
      return
    }
    if (!data.placements || data.placements.length === 0) {
      toast.error('Please select at least one placement option')
      return
    }
    if (!data.packageType || !data.budget) {
      toast.error('Please select a package')
      return
    }
    if (!data.gameId) {
      toast.error('Please select a game')
      return
    }

    setIsSubmitting(true)
    
    try {
      console.log('Submitting campaign data:', data)
      console.log('Session user:', session?.user)
      
      // Submit campaign to the new campaigns API
      const response = await fetch('/api/campaigns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          goal: data.goal,
          placements: data.placements,
          package: data.packageType,
          budget: data.budget,
          gameId: data.gameId,
          gameName: data.gameName
        })
      })

      console.log('Campaign response status:', response.status)
      
      if (!response.ok) {
        let errorData
        try {
          const responseText = await response.text()
          console.log('Raw response text:', responseText)
          
          if (responseText) {
            errorData = JSON.parse(responseText)
          } else {
            errorData = { error: `HTTP ${response.status}: ${response.statusText}` }
          }
        } catch (e) {
          console.error('Failed to parse error response:', e)
          errorData = { error: `HTTP ${response.status}: ${response.statusText}` }
        }
        console.error('Campaign submission error:', errorData)
        throw new Error(errorData.error || 'Failed to submit campaign')
      }

      const result = await response.json()
      console.log('Campaign created successfully:', result.campaign)

      // Show success and redirect
      setShowWizard(false)
      setShowSuccess(true)
      toast.success('🎉 Your campaign has been submitted!')
      
      // Redirect to home page after a short delay
      setTimeout(() => {
        router.push('/')
      }, 3000)
    } catch (error) {
      console.error('Error submitting campaign:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      toast.error(`Failed to submit campaign: ${errorMessage}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleBackToDashboard = () => {
    router.push('/dashboard')
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen w-full bg-background">
      <AnimatePresence mode="wait">
        {!session ? (
          <motion.div
            key="guest"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="min-h-screen w-full flex items-center justify-center"
          >
            <Guest />
          </motion.div>
        ) : showIntro ? (
          <motion.div
            key="intro"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="min-h-screen w-full flex items-center justify-center"
          >
            <Intro 
              firstName={session.user?.name?.split(' ')[0] || 'User'}
              onComplete={handleIntroComplete}
            />
          </motion.div>
        ) : showWizard ? (
          <motion.div
            key="wizard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Wizard
              data={campaignData}
              updateData={updateCampaignData}
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
            />
          </motion.div>
        ) : showSuccess ? (
          <motion.div
            key="success"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="min-h-screen w-full flex items-center justify-center"
          >
            <div className="text-center space-y-6 max-w-2xl">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-6xl"
              >
                🎉
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <h1 className="text-3xl font-bold text-white mb-2">
                  Your campaign has been submitted!
                </h1>
                <p className="text-gray-400">
                  Our team will review your campaign and get back to you soon.
                  <br />
                  <span className="text-gray-500 text-sm">
                    You will receive an email notification once your campaign is approved.
                  </span>
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                <Button 
                  onClick={handleBackToDashboard}
                  className="rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  Back to Dashboard
                </Button>
              </motion.div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}