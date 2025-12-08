"use client"

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Download, GamepadIcon, Mail, Star, MessageCircle, TrendingUp, Users, List, Share2, Trash2, TestTube, BarChart3, Shield, MessageSquare } from 'lucide-react'
import { SocialPlatformIcon } from '@/components/ui/social-platform-icons'
import { UserAnalyticsDashboard } from '@/components/editorial/user-analytics-dashboard'
import { SecurityMonitoringDashboard } from '@/components/editorial/security-monitoring-dashboard'
import { toast } from 'sonner'
import DarkVeil from '@/components/DarkVeil'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog'

interface Product {
  id: string
  title: string
  upvotes: number
  comments: number
  rating: number | null
  editorial_boost: boolean
  editorial_override: boolean
  _count: {
    votes: number
    comments: number
  }
}

interface NewsletterSubscriber {
  id: string
  email: string
  createdAt: string
}

interface User {
  id: string
  email: string
  createdAt: string
}

type ActiveSection = 'games' | 'newsletter' | 'campaigns' | 'users' | 'submitted-games' | 'test' | 'user-analytics' | 'security-monitoring' | 'quest-feedback'

type TestCampaignType = 'social-promo' | 'welcome' | 'weekly' | 'latest' | 'feedback'

interface TestRecipient {
  id: string
  email: string
  createdAt: string
}

interface Campaign {
  id: string
  gameId: string
  gameName: string
  goal: string
  placements: string[]
  package: string
  budget: number
  submittedAt: string
  user: {
    id: string
    name: string | null
    email: string
    username: string | null
    image: string | null
  }
}

interface SubmittedGame {
  id: string
  title: string
  tagline: string | null
  slug: string
  socialLinks: {
    website: string | null
    discord: string | null
    twitter: string | null
    tiktok: string | null
    instagram: string | null
    reddit: string | null
    facebook: string | null
    linkedin: string | null
    youtube: string | null
  }
  storeLinks: {
    ios: string | null
    android: string | null
    website: string | null
  }
}

export default function EditorialDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [activeSection, setActiveSection] = useState<ActiveSection>('games')
  const [products, setProducts] = useState<Product[]>([])
  const [newsletterSubscribers, setNewsletterSubscribers] = useState<NewsletterSubscriber[]>([])
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [submittedGames, setSubmittedGames] = useState<SubmittedGame[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [campaignPlacement, setCampaignPlacement] = useState<'ALL' | string>('ALL')
  const [gamesPage, setGamesPage] = useState(1)
  const [newsletterPage, setNewsletterPage] = useState(1)
  const [campaignsPage, setCampaignsPage] = useState(1)
  const [usersPage, setUsersPage] = useState(1)
  const [submittedGamesPage, setSubmittedGamesPage] = useState(1)
  const [bulkEmailLoading, setBulkEmailLoading] = useState(false)
  const [weeklySending, setWeeklySending] = useState(false)
  const [latestSending, setLatestSending] = useState(false)
  const [usersFeedbackSending, setUsersFeedbackSending] = useState(false)
  const [socialPromoDialogOpen, setSocialPromoDialogOpen] = useState(false)
  const [socialPromoSending, setSocialPromoSending] = useState(false)
  const [newsletterSocialDialogOpen, setNewsletterSocialDialogOpen] = useState(false)
  const [newsletterSocialSending, setNewsletterSocialSending] = useState(false)
  const [newsletterDeleteTarget, setNewsletterDeleteTarget] = useState<NewsletterSubscriber | null>(null)
  const [newsletterDeleteLoading, setNewsletterDeleteLoading] = useState(false)
  const [newsletterDeleteError, setNewsletterDeleteError] = useState<string | null>(null)
  const [userDeleteTarget, setUserDeleteTarget] = useState<User | null>(null)
  const [userDeleteLoading, setUserDeleteLoading] = useState(false)
  const [userDeleteError, setUserDeleteError] = useState<string | null>(null)
  const [testRecipients, setTestRecipients] = useState<TestRecipient[]>([])
  const [selectedTestRecipients, setSelectedTestRecipients] = useState<string[]>([])
  const [testRecipientsLoading, setTestRecipientsLoading] = useState(false)
  const [testRecipientsError, setTestRecipientsError] = useState<string | null>(null)
  const [testCampaignLoading, setTestCampaignLoading] = useState<TestCampaignType | null>(null)
  const [testEmail, setTestEmail] = useState('')
  const [testEmailLoading, setTestEmailLoading] = useState(false)
  const [questFeedback, setQuestFeedback] = useState<any[]>([])
  const [questFeedbackLoading, setQuestFeedbackLoading] = useState(false)
  const [questFeedbackFilter, setQuestFeedbackFilter] = useState<string>('')
  const safeNewsletterSubscribers = Array.isArray(newsletterSubscribers) ? newsletterSubscribers : []
  const ITEMS_PER_PAGE = 10
  const testSelectionCount = selectedTestRecipients.length
  const isTestActionDisabled = testSelectionCount === 0 || testCampaignLoading !== null

  const fetchTestRecipients = useCallback(async () => {
    try {
      setTestRecipientsLoading(true)
      setTestRecipientsError(null)
      const res = await fetch('/api/admin/newsletter/test')
      if (!res.ok) {
        throw new Error('Failed to fetch test emails')
      }
      const data = await res.json()
      setTestRecipients(Array.isArray(data) ? data : [])
      setSelectedTestRecipients((prev) => {
        const allowed = new Set((Array.isArray(data) ? data : []).map((item: TestRecipient) => item.email))
        return prev.filter((email) => allowed.has(email))
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load test emails'
      setTestRecipientsError(message)
      toast.error(message)
    } finally {
      setTestRecipientsLoading(false)
    }
  }, [])

  const toggleTestRecipient = (email: string) => {
    setSelectedTestRecipients((prev) =>
      prev.includes(email) ? prev.filter((item) => item !== email) : [...prev, email]
    )
  }

  const handleSelectAllTestRecipients = () => {
    setSelectedTestRecipients(testRecipients.map((recipient) => recipient.email))
  }

  const handleClearTestRecipients = () => {
    setSelectedTestRecipients([])
  }

  const runTestCampaign = useCallback(
    async (campaign: TestCampaignType) => {
      if (selectedTestRecipients.length === 0) {
        toast.error('Please select at least one test email')
        return
      }

      const payload = { emails: selectedTestRecipients }
      let endpoint = ''
      let successMessage = ''

      switch (campaign) {
        case 'social-promo':
          endpoint = '/api/editorial/emails/send-social-promo'
          successMessage = 'Social promo email sent to selected test recipients'
          break
        case 'welcome':
          endpoint = '/api/admin/newsletter/bulk-welcome'
          successMessage = 'Welcome emails sent to selected test recipients'
          break
        case 'weekly':
          endpoint = '/api/newsletter/test-weekly'
          successMessage = 'Weekly Top 5 sent to selected test recipients'
          break
        case 'latest':
          endpoint = '/api/newsletter/send-latest'
          successMessage = 'Latest game email sent to selected test recipients'
          break
        case 'feedback':
          endpoint = '/api/admin/users/feedback-email'
          successMessage = 'Feedback email sent to selected test recipients'
          break
      }

      try {
        setTestCampaignLoading(campaign)
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(
            campaign === 'social-promo'
              ? { target: 'custom', emails: selectedTestRecipients }
              : payload
          )
        })

        const data = await response.json().catch(() => ({}))

        if (!response.ok || data?.success === false || data?.ok === false) {
          throw new Error(data?.error || data?.message || 'Failed to send campaign')
        }

        toast.success(successMessage)
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to run test campaign'
        toast.error(message)
      } finally {
        setTestCampaignLoading(null)
      }
    },
    [selectedTestRecipients]
  )

  // Filter products based on search term
  const filteredProducts = products.filter(product =>
    product.title.toLowerCase().includes(searchTerm.toLowerCase())
  )
  const totalGamesPages = Math.max(1, Math.ceil(filteredProducts.length / ITEMS_PER_PAGE))
  const paginatedProducts = filteredProducts.slice((gamesPage - 1) * ITEMS_PER_PAGE, gamesPage * ITEMS_PER_PAGE)
  const totalNewsletterPages = Math.max(1, Math.ceil(safeNewsletterSubscribers.length / ITEMS_PER_PAGE))
  const paginatedNewsletter = safeNewsletterSubscribers.slice((newsletterPage - 1) * ITEMS_PER_PAGE, newsletterPage * ITEMS_PER_PAGE)
  const totalCampaignPages = Math.max(1, Math.ceil(campaigns.length / ITEMS_PER_PAGE))
  const paginatedCampaigns = campaigns.slice((campaignsPage - 1) * ITEMS_PER_PAGE, campaignsPage * ITEMS_PER_PAGE)
  const totalUsersPages = Math.max(1, Math.ceil(users.length / ITEMS_PER_PAGE))
  const paginatedUsers = users.slice((usersPage - 1) * ITEMS_PER_PAGE, usersPage * ITEMS_PER_PAGE)
  const totalSubmittedGamesPages = Math.max(1, Math.ceil(submittedGames.length / ITEMS_PER_PAGE))
  const paginatedSubmittedGames = submittedGames.slice((submittedGamesPage - 1) * ITEMS_PER_PAGE, submittedGamesPage * ITEMS_PER_PAGE)

  // Check admin access
  useEffect(() => {
    if (status === 'loading') return
    
    if (status === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=/editorial-dashboard')
      return
    }

    if (session?.user?.role !== 'ADMIN') {
      router.push('/403')
      return
    }
  }, [session, status, router])

  // Fetch data
  useEffect(() => {
    if (session?.user?.role !== 'ADMIN') return
    
    const fetchData = async () => {
      try {
        setLoading(true)
        const [gamesRes, newsletterRes, campaignsRes, usersRes, submittedGamesRes] = await Promise.all([
          fetch('/api/admin/games'),
          fetch('/api/admin/newsletter'),
          fetch('/api/campaigns'),
          fetch('/api/admin/users'),
          fetch('/api/admin/submitted-games')
        ])

        if (gamesRes.ok) {
          const gamesData = await gamesRes.json()
          setProducts(gamesData)
        } else {
          toast.error('Failed to load games data')
        }

        if (newsletterRes.ok) {
          const newsletterData = await newsletterRes.json()
          setNewsletterSubscribers(newsletterData)
        } else {
          toast.error('Failed to load newsletter data')
        }

        if (campaignsRes.ok) {
          const campaignsData = await campaignsRes.json()
          setCampaigns(campaignsData.campaigns || [])
        } else {
          toast.error('Failed to load campaigns')
        }

        if (usersRes.ok) {
          const usersData = await usersRes.json()
          setUsers(usersData)
        } else {
          toast.error('Failed to load users data')
        }

        if (submittedGamesRes.ok) {
          const submittedGamesData = await submittedGamesRes.json()
          setSubmittedGames(submittedGamesData)
        } else {
          toast.error('Failed to load submitted games')
        }
      } catch (error) {
        toast.error('Failed to load data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [session])

  useEffect(() => {
    if (session?.user?.role === 'ADMIN') {
      fetchTestRecipients()
    }
  }, [session, fetchTestRecipients])

  // Fetch Quest feedback
  const fetchQuestFeedback = useCallback(async () => {
    if (session?.user?.role !== 'ADMIN') return
    
    try {
      setQuestFeedbackLoading(true)
      const url = questFeedbackFilter 
        ? `/api/quest/feedback?reason=${questFeedbackFilter}`
        : '/api/quest/feedback'
      const res = await fetch(url)
      if (!res.ok) {
        throw new Error('Failed to fetch Quest feedback')
      }
      const data = await res.json()
      setQuestFeedback(Array.isArray(data.feedback) ? data.feedback : [])
    } catch (error) {
      console.error('Error fetching Quest feedback:', error)
      toast.error('Failed to load Quest feedback')
    } finally {
      setQuestFeedbackLoading(false)
    }
  }, [session, questFeedbackFilter])

  useEffect(() => {
    if (activeSection === 'quest-feedback' && session?.user?.role === 'ADMIN') {
      fetchQuestFeedback()
    }
  }, [activeSection, session, fetchQuestFeedback])

  const handleEditorialToggle = async (gameId: string, field: 'editorial_boost' | 'editorial_override', value: boolean) => {
    try {
      setSaving(gameId)
      const response = await fetch(`/api/admin/games/${gameId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          [field]: value
        })
      })

      if (response.ok) {
        const result = await response.json()
        setProducts(prev => prev.map(p => 
          p.id === gameId ? { ...p, [field]: value } : p
        ))
        toast.success(`${field === 'editorial_boost' ? 'Editorial Boost' : 'Editorial Override'} updated successfully`)
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || 'Failed to update setting')
      }
    } catch (error) {
      console.error('Error updating setting:', error)
      toast.error('Failed to update setting')
    } finally {
      setSaving(null)
    }
  }

  const handleDownloadCSV = () => {
    try {
      // Create CSV header
      const csvHeader = 'Email,Signup Date\n'
      
      // Convert newsletter subscribers data to CSV rows
      const csvRows = safeNewsletterSubscribers.map(subscriber => {
        const email = subscriber.email
        const signupDate = new Date(subscriber.createdAt).toLocaleDateString('de-DE') // Format as DD.MM.YYYY
        return `${email},${signupDate}`
      }).join('\n')
      
      // Combine header and rows
      const csvContent = csvHeader + csvRows
      
      // Create and trigger download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'newsletter-subscribers.csv'
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      toast.success('CSV downloaded successfully')
    } catch (error) {
      console.error('Error downloading CSV:', error)
      toast.error('Failed to download CSV')
    }
  }

  const handleDownloadUsersCSV = () => {
    try {
      // Create CSV header
      const csvHeader = 'Email,Signup Date\n'
      
      // Convert users data to CSV rows
      const csvRows = users.map(user => {
        const email = user.email
        const signupDate = new Date(user.createdAt).toLocaleDateString('de-DE') // Format as DD.MM.YYYY
        return `${email},${signupDate}`
      }).join('\n')
      
      // Combine header and rows
      const csvContent = csvHeader + csvRows
      
      // Create and trigger download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'users.csv'
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      toast.success('CSV downloaded successfully')
    } catch (error) {
      console.error('Error downloading CSV:', error)
      toast.error('Failed to download CSV')
    }
  }

  const handleCancelNewsletterDelete = () => {
    if (newsletterDeleteLoading) return
    setNewsletterDeleteTarget(null)
    setNewsletterDeleteError(null)
  }

  const handleCancelUserDelete = () => {
    if (userDeleteLoading) return
    setUserDeleteTarget(null)
    setUserDeleteError(null)
  }

  const removeNewsletterFromState = (id: string) => {
    setNewsletterSubscribers(prev => {
      const updated = prev.filter(subscriber => subscriber.id !== id)
      setNewsletterPage(currentPage => {
        const totalPages =
          updated.length === 0 ? 1 : Math.max(1, Math.ceil(updated.length / ITEMS_PER_PAGE))
        return Math.min(currentPage, totalPages)
      })
      return updated
    })
  }

  const removeUserFromState = (id: string) => {
    setUsers(prev => {
      const updated = prev.filter(user => user.id !== id)
      setUsersPage(currentPage => {
        const totalPages =
          updated.length === 0 ? 1 : Math.max(1, Math.ceil(updated.length / ITEMS_PER_PAGE))
        return Math.min(currentPage, totalPages)
      })
      return updated
    })
  }

  const handleConfirmNewsletterDelete = async () => {
    if (!newsletterDeleteTarget) return
    setNewsletterDeleteError(null)
    setNewsletterDeleteLoading(true)
    const targetId = newsletterDeleteTarget.id
    try {
      const response = await fetch(`/api/admin/newsletter/${targetId}`, {
        method: 'DELETE'
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok || !data?.success) {
        throw new Error(data?.error || 'Failed to delete subscriber')
      }
      removeNewsletterFromState(targetId)
      toast.success('Subscriber deleted successfully.')
      setNewsletterDeleteTarget(null)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete subscriber'
      setNewsletterDeleteError(message)
    } finally {
      setNewsletterDeleteLoading(false)
    }
  }

  const handleConfirmUserDelete = async () => {
    if (!userDeleteTarget) return
    setUserDeleteError(null)
    setUserDeleteLoading(true)
    const targetId = userDeleteTarget.id
    try {
      const response = await fetch(`/api/admin/users/${targetId}`, {
        method: 'DELETE'
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok || !data?.success) {
        throw new Error(data?.error || 'Failed to delete user')
      }
      removeUserFromState(targetId)
      toast.success('User deleted successfully.')
      setUserDeleteTarget(null)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete user'
      setUserDeleteError(message)
    } finally {
      setUserDeleteLoading(false)
    }
  }

  const handleBulkWelcomeEmail = async () => {
    if (bulkEmailLoading) return
    
    const confirmed = window.confirm(
      `Are you sure you want to send welcome emails to all ${safeNewsletterSubscribers.length} active subscribers?\n\nThis action cannot be undone.`
    )
    
    if (!confirmed) return

    try {
      setBulkEmailLoading(true)
      toast.info('Starting bulk welcome email campaign...')
      
      const response = await fetch('/api/admin/newsletter/bulk-welcome', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const result = await response.json()

      if (response.ok && result.success) {
        toast.success(
          `Bulk email campaign completed! Sent: ${result.results.sent}/${result.results.total} emails`
        )
        
        if (result.results.failed > 0) {
          console.warn('Some emails failed:', result.results.errors)
          toast.warning(`${result.results.failed} emails failed to send. Check console for details.`)
        }
      } else {
        toast.error(result.error || 'Failed to send bulk welcome emails')
        console.error('Bulk email error:', result)
      }
    } catch (error) {
      console.error('Error sending bulk welcome emails:', error)
      toast.error('Failed to send bulk welcome emails')
    } finally {
      setBulkEmailLoading(false)
    }
  }

  const sendSocialPromoEmailMutation = async (target: 'users' | 'newsletter') => {
    try {
      const response = await fetch('/api/editorial/emails/send-social-promo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target })
      })
      const data = await response.json()
      if (!response.ok || !data?.success) {
        throw new Error(data?.error || 'Failed to send emails')
      }
      toast.success(`Social promo emails sent to ${target === 'users' ? 'all users' : 'newsletter subscribers'}`)
    } catch (error) {
      console.error('[SOCIAL PROMO EMAIL] send error', error)
      toast.error(error instanceof Error ? error.message : 'Failed to send social promo emails')
      throw error
    }
  }

  const handleSendUsersSocialPromo = async () => {
    if (socialPromoSending) return
    setSocialPromoDialogOpen(false)
    try {
      setSocialPromoSending(true)
      await sendSocialPromoEmailMutation('users')
    } catch {
      // toast already handled
    } finally {
      setSocialPromoSending(false)
    }
  }

  const handleSendNewsletterSocialPromo = async () => {
    if (newsletterSocialSending) return
    setNewsletterSocialDialogOpen(false)
    try {
      setNewsletterSocialSending(true)
      await sendSocialPromoEmailMutation('newsletter')
    } catch {
      // toast already handled
    } finally {
      setNewsletterSocialSending(false)
    }
  }

  const handleSendWeeklyTop5 = async () => {
    if (weeklySending) return
    const confirmed = window.confirm(
      `Send Weekly Top 5 to all ${safeNewsletterSubscribers.length} active subscribers?\n\nThis action cannot be undone.`
    )
    if (!confirmed) return
    try {
      setWeeklySending(true)
      toast.info('Sending Weekly Top 5 newsletter...')
      const res = await fetch('/api/newsletter/test-weekly', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}) // no email -> send to all
      })
      const data = await res.json()
      if (res.ok && data?.sent !== undefined) {
        toast.success(`Weekly Top 5 sent: ${data.sent}/${data.attempted} (failed: ${data.failed})`)
      } else if (res.ok && data?.ok) {
        // some endpoints may return ok/result
        const r = data.result || {}
        toast.success(`Weekly Top 5 sent: ${r.sent ?? '?'} / ${r.attempted ?? '?'} (failed: ${r.failed ?? '?'})`)
      } else {
        toast.error(data?.error || 'Failed to send Weekly Top 5')
      }
    } catch (e) {
      toast.error('Failed to send Weekly Top 5')
    } finally {
      setWeeklySending(false)
    }
  }

  const handleSendLatestGame = async () => {
    if (latestSending) return
    const confirmed = window.confirm(
      `Send latest published game email to all ${safeNewsletterSubscribers.length} active subscribers?\n\nThis action cannot be undone.`
    )
    if (!confirmed) return
    try {
      setLatestSending(true)
      toast.info('Sending latest game newsletter...')
      const res = await fetch('/api/newsletter/send-latest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      const data = await res.json()
      const r = data?.result || {}
      if (res.ok && (r.sent !== undefined || data?.ok)) {
        toast.success(`Latest game email sent: ${r.sent ?? '?'} / ${r.attempted ?? '?'} (failed: ${r.failed ?? '?'})`)
      } else {
        toast.error(data?.error || 'Failed to send latest game email')
      }
    } catch (e) {
      toast.error('Failed to send latest game email')
    } finally {
      setLatestSending(false)
    }
  }

  const handleSendUsersFeedbackEmail = async () => {
    if (usersFeedbackSending) return

    const confirmed = window.confirm(
      `Send a short feedback email to all ${users.length} users with an email address?\n\n` +
      `This message will politely thank them for joining Mobile Game Hunt and ask for feedback about what they like, ` +
      `what feels confusing, and what they would improve.`
    )

    if (!confirmed) return

    try {
      setUsersFeedbackSending(true)
      toast.info('Sending feedback email to all users...')

      const res = await fetch('/api/admin/users/feedback-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await res.json()

      if (res.ok && data?.success) {
        const r = data.results || {}
        toast.success(
          `Feedback email campaign completed: ${r.sent ?? '?'} / ${r.total ?? '?'} sent (failed: ${r.failed ?? 0}).`,
        )
      } else {
        toast.error(data?.error || 'Failed to send feedback emails')
      }
    } catch (error) {
      console.error('Error sending feedback emails:', error)
      toast.error('Failed to send feedback emails')
    } finally {
      setUsersFeedbackSending(false)
    }
  }

  const handleAddTestEmail = async () => {
    if (!testEmail || testEmailLoading) return

    const trimmedEmail = testEmail.trim()

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(trimmedEmail)) {
      toast.error('Invalid email format')
      return
    }

    try {
      setTestEmailLoading(true)
      const res = await fetch('/api/admin/newsletter/test-add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: trimmedEmail }),
      })

      const data = await res.json()

      if (res.ok && data?.success) {
        toast.success(`Test email "${trimmedEmail}" added successfully`)
        setTestEmail('')
        await fetchTestRecipients()
        setSelectedTestRecipients((prev) => {
          if (prev.includes(trimmedEmail)) return prev
          return [...prev, trimmedEmail]
        })
        // Refresh newsletter subscribers list
        const newsletterRes = await fetch('/api/admin/newsletter')
        if (newsletterRes.ok) {
          const newsletterData = await newsletterRes.json()
          setNewsletterSubscribers(newsletterData)
        }
      } else {
        toast.error(data?.error || 'Failed to add test email')
      }
    } catch (error) {
      console.error('Error adding test email:', error)
      toast.error('Failed to add test email')
    } finally {
      setTestEmailLoading(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center relative">
        <DarkVeil />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-white">Loading...</div>
        </div>
      </div>
    )
  }

  if (!(session?.user?.role === 'ADMIN' || session?.user?.role === 'EDITOR')) {
    return null
  }


  return (
    <div className="min-h-screen w-full relative">
      <DarkVeil />
      <div className="absolute inset-0 max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Editorial Dashboard</h1>
          <p className="text-gray-300">Manage featured games, newsletter subscribers, and ad requests</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="bg-zinc-900/40 backdrop-blur-md border border-white/10 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.6)]">
              <CardHeader>
                <CardTitle className="text-white">Navigation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant={activeSection === 'games' ? 'default' : 'ghost'}
                  className={`w-full justify-start ${
                    activeSection === 'games' 
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700' 
                      : 'text-gray-300 hover:text-white hover:bg-gray-700'
                  }`}
                  onClick={() => setActiveSection('games')}
                >
                  <GamepadIcon className="w-4 h-4 mr-2" />
                  Featured Games Control
                </Button>
                <Button
                  variant={activeSection === 'newsletter' ? 'default' : 'ghost'}
                  className={`w-full justify-start ${
                    activeSection === 'newsletter' 
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700' 
                      : 'text-gray-300 hover:text-white hover:bg-gray-700'
                  }`}
                  onClick={() => setActiveSection('newsletter')}
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Newsletter Subscribers
                </Button>
                <Button
                  variant={activeSection === 'campaigns' ? 'default' : 'ghost'}
                  className={`w-full justify-start ${
                    activeSection === 'campaigns' 
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700' 
                      : 'text-gray-300 hover:text-white hover:bg-gray-700'
                  }`}
                  onClick={() => setActiveSection('campaigns')}
                >
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Advertising Campaigns
                </Button>
                <Button
                  variant={activeSection === 'users' ? 'default' : 'ghost'}
                  className={`w-full justify-start ${
                    activeSection === 'users' 
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700' 
                      : 'text-gray-300 hover:text-white hover:bg-gray-700'
                  }`}
                  onClick={() => setActiveSection('users')}
                >
                  <Users className="w-4 h-4 mr-2" />
                  All Users
                </Button>
                <Button
                  variant={activeSection === 'submitted-games' ? 'default' : 'ghost'}
                  className={`w-full justify-start ${
                    activeSection === 'submitted-games' 
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700' 
                      : 'text-gray-300 hover:text-white hover:bg-gray-700'
                  }`}
                  onClick={() => setActiveSection('submitted-games')}
                >
                  <List className="w-4 h-4 mr-2" />
                  Submitted Games Overview
                </Button>
                <Button
                  variant={activeSection === 'test' ? 'default' : 'ghost'}
                  className={`w-full justify-start ${
                    activeSection === 'test' 
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700' 
                      : 'text-gray-300 hover:text-white hover:bg-gray-700'
                  }`}
                  onClick={() => setActiveSection('test')}
                >
                  <TestTube className="w-4 h-4 mr-2" />
                  Test
                </Button>
                <Button
                  variant={activeSection === 'user-analytics' ? 'default' : 'ghost'}
                  className={`w-full justify-start ${
                    activeSection === 'user-analytics' 
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700' 
                      : 'text-gray-300 hover:text-white hover:bg-gray-700'
                  }`}
                  onClick={() => setActiveSection('user-analytics')}
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  User Analytics
                </Button>
                <Button
                  variant={activeSection === 'security-monitoring' ? 'default' : 'ghost'}
                  className={`w-full justify-start ${
                    activeSection === 'security-monitoring' 
                      ? 'bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700' 
                      : 'text-gray-300 hover:text-white hover:bg-gray-700'
                  }`}
                  onClick={() => setActiveSection('security-monitoring')}
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Security Monitoring
                </Button>
                <Button
                  variant={activeSection === 'quest-feedback' ? 'default' : 'ghost'}
                  className={`w-full justify-start ${
                    activeSection === 'quest-feedback' 
                      ? 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700' 
                      : 'text-gray-300 hover:text-white hover:bg-gray-700'
                  }`}
                  onClick={() => setActiveSection('quest-feedback')}
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Quest Feedback
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            {activeSection === 'games' && (
              <Card className="bg-zinc-900/40 backdrop-blur-md border border-white/10 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.6)]">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <GamepadIcon className="w-5 h-5" />
                    Featured Games Control
                    <span className="text-xs text-gray-400">({filteredProducts.length})</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <Input
                      type="text"
                      placeholder="Search games..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full bg-zinc-800/50 border-zinc-600 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-purple-500/20 focus:ring-2 rounded-lg"
                    />
                  </div>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-gray-700">
                          <TableHead className="text-gray-300">Game Title</TableHead>
                          <TableHead className="text-gray-300">Upvotes</TableHead>
                          <TableHead className="text-gray-300">Comments</TableHead>
                          <TableHead className="text-gray-300">Rating</TableHead>
                          <TableHead className="text-gray-300">Editorial Boost</TableHead>
                          <TableHead className="text-gray-300">Editorial Override</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paginatedProducts.length > 0 ? (
                          paginatedProducts.map((product) => (
                            <TableRow key={product.id} className="border-gray-700">
                              <TableCell className="text-white font-medium">
                                {product.title}
                              </TableCell>
                              <TableCell className="text-gray-300">
                                <div className="flex items:center gap-1">
                                  <TrendingUp className="w-4 h-4" />
                                  {product.upvotes || 0}
                                </div>
                              </TableCell>
                              <TableCell className="text-gray-300">
                                <div className="flex items-center gap-1">
                                  <MessageCircle className="w-4 h-4" />
                                  {product.comments || 0}
                                </div>
                              </TableCell>
                              <TableCell className="text-gray-300">
                                {product.rating ? (
                                  <div className="flex items-center gap-1">
                                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                    {product.rating.toFixed(1)}
                                  </div>
                                ) : (
                                  <span className="text-gray-500">No rating</span>
                                )}
                              </TableCell>
                              <TableCell>
                                <Switch
                                  checked={product.editorial_boost}
                                  onCheckedChange={(checked) => 
                                    handleEditorialToggle(product.id, 'editorial_boost', checked)
                                  }
                                  disabled={saving === product.id}
                                />
                              </TableCell>
                              <TableCell>
                                <Switch
                                  checked={product.editorial_override}
                                  onCheckedChange={(checked) => 
                                    handleEditorialToggle(product.id, 'editorial_override', checked)
                                  }
                                  disabled={saving === product.id}
                                />
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow className="border-gray-700">
                            <TableCell colSpan={6} className="text-center text-gray-400 py-8">
                              No games found
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                  {filteredProducts.length > ITEMS_PER_PAGE && (
                    <div className="mt-6 flex justify-center items-center gap-2">
                      <div className="flex items-center gap-1">
                        {gamesPage > 1 && (
                          <button
                            onClick={() => setGamesPage(gamesPage - 1)}
                            className="h-8 px-3 rounded-md text-sm bg-zinc-800 text-gray-300 hover:bg-zinc-700"
                          >
                            Previous
                          </button>
                        )}
                        {Array.from({ length: totalGamesPages }, (_, i) => i + 1).map((p) => (
                          <button
                            key={p}
                            onClick={() => setGamesPage(p)}
                            className={`h-8 min-w-8 px-2 rounded-md text-sm ${p === gamesPage ? 'bg-purple-600 text-white' : 'bg-zinc-800 text-gray-300 hover:bg-zinc-700'}`}
                          >
                            {p}
                          </button>
                        ))}
                        {gamesPage < totalGamesPages && (
                          <button
                            onClick={() => setGamesPage(gamesPage + 1)}
                            className="h-8 px-3 rounded-md text-sm bg-zinc-800 text-gray-300 hover:bg-zinc-700"
                          >
                            Next
                          </button>
                        )}
                      </div>
                      <span className="text-sm text-gray-400 ml-4">
                        Page {gamesPage} of {totalGamesPages}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {activeSection === 'newsletter' && (
              <Card className="bg-zinc-900/40 backdrop-blur-md border border-white/10 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.6)]">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white flex items-center gap-2">
                      <Mail className="w-5 h-5" />
                      Newsletter Subscribers
                      <span className="text-xs text-gray-400">({safeNewsletterSubscribers.length})</span>
                    </CardTitle>
                    <div className="flex gap-2 flex-wrap">
                    <AlertDialog open={newsletterSocialDialogOpen} onOpenChange={setNewsletterSocialDialogOpen}>
                      <AlertDialogTrigger asChild>
                        <Button
                          disabled={newsletterSocialSending || safeNewsletterSubscribers.length === 0}
                          className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Share2 className="w-4 h-4 mr-2" />
                          Send Social Promo
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="bg-zinc-900 border border-white/10 text-white">
                        <AlertDialogHeader>
                          <AlertDialogTitle>Send Social Media Promo Email to newsletter subscribers?</AlertDialogTitle>
                          <AlertDialogDescription className="text-gray-300">
                            This will email every active newsletter subscriber about our social channels.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="bg-transparent border border-white/20 text-white hover:bg-white/10">
                            Cancel
                          </AlertDialogCancel>
                          <AlertDialogAction asChild>
                            <Button
                              onClick={handleSendNewsletterSocialPromo}
                              disabled={newsletterSocialSending}
                              className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 disabled:opacity-50"
                            >
                              {newsletterSocialSending ? (
                                <>
                                  <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                  Sending...
                                </>
                              ) : (
                                'Send to subscribers'
                              )}
                            </Button>
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                      <Button
                        onClick={handleBulkWelcomeEmail}
                        disabled={bulkEmailLoading || safeNewsletterSubscribers.length === 0}
                        className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {bulkEmailLoading ? (
                          <>
                            <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <Mail className="w-4 h-4 mr-2" />
                            Send Welcome Emails
                          </>
                        )}
                      </Button>
                      <Button
                        onClick={handleDownloadCSV}
                        className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download CSV
                      </Button>
                      <Button
                        onClick={handleSendWeeklyTop5}
                        disabled={weeklySending || safeNewsletterSubscribers.length === 0}
                        className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Send weekly Top 5 to all subscribers"
                      >
                        {weeklySending ? (
                          <>
                            <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                            Sending Weekly...
                          </>
                        ) : (
                          <>
                            <Mail className="w-4 h-4 mr-2" />
                            Send Weekly Top 5
                          </>
                        )}
                      </Button>
                      <Button
                        onClick={handleSendLatestGame}
                        disabled={latestSending || safeNewsletterSubscribers.length === 0}
                        className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Send latest published game to all subscribers"
                      >
                        {latestSending ? (
                          <>
                            <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                            Sending Latest...
                          </>
                        ) : (
                          <>
                            <Mail className="w-4 h-4 mr-2" />
                            Send Latest Game
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <TooltipProvider delayDuration={120}>
                    <Table>
                      <TableHeader>
                        <TableRow className="border-gray-700">
                          <TableHead className="text-gray-300">Email</TableHead>
                          <TableHead className="text-gray-300">Signup Date</TableHead>
                            <TableHead className="text-right text-gray-300">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paginatedNewsletter.map((subscriber) => (
                          <TableRow key={subscriber.id} className="border-gray-700">
                            <TableCell className="text-white">
                              {subscriber.email}
                            </TableCell>
                            <TableCell className="text-gray-300">
                              {new Date(subscriber.createdAt).toLocaleDateString()}
                            </TableCell>
                              <TableCell className="text-right">
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      className="text-red-400 hover:text-white hover:bg-red-500/10"
                                      onClick={() => {
                                        setNewsletterDeleteTarget(subscriber)
                                        setNewsletterDeleteError(null)
                                      }}
                                      disabled={newsletterDeleteLoading}
                                    >
                                      <Trash2 className="w-4 h-4" />
                                      <span className="sr-only">Delete subscriber</span>
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Delete this email</TooltipContent>
                                </Tooltip>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    </TooltipProvider>
                  </div>
                  {safeNewsletterSubscribers.length > ITEMS_PER_PAGE && (
                    <div className="mt-6 flex justify-center items-center gap-2">
                      <div className="flex items-center gap-1">
                        {newsletterPage > 1 && (
                          <button
                            onClick={() => setNewsletterPage(newsletterPage - 1)}
                            className="h-8 px-3 rounded-md text-sm bg-zinc-800 text-gray-300 hover:bg-zinc-700"
                          >
                            Previous
                          </button>
                        )}
                        {Array.from({ length: totalNewsletterPages }, (_, i) => i + 1).map((p) => (
                          <button
                            key={p}
                            onClick={() => setNewsletterPage(p)}
                            className={`h-8 min-w-8 px-2 rounded-md text-sm ${p === newsletterPage ? 'bg-purple-600 text-white' : 'bg-zinc-800 text-gray-300 hover:bg-zinc-700'}`}
                          >
                            {p}
                          </button>
                        ))}
                        {newsletterPage < totalNewsletterPages && (
                          <button
                            onClick={() => setNewsletterPage(newsletterPage + 1)}
                            className="h-8 px-3 rounded-md text-sm bg-zinc-800 text-gray-300 hover:bg-zinc-700"
                          >
                            Next
                          </button>
                        )}
                      </div>
                      <span className="text-sm text-gray-400 ml-4">
                        Page {newsletterPage} of {totalNewsletterPages}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {activeSection === 'campaigns' && (
              <Card className="bg-zinc-900/40 backdrop-blur-md border border-white/10 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.6)]">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Advertising Campaigns
                    <span className="text-xs text-gray-400">({campaigns.length})</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    {paginatedCampaigns.length > 0 ? (
                      paginatedCampaigns.map((campaign) => (
                        <Card key={campaign.id} className="bg-zinc-800/40 backdrop-blur-md border border-white/5 hover:border-purple-500/30 transition-all duration-200">
                          <CardContent className="p-6">
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex items-center gap-3">
                                <Avatar className="w-10 h-10">
                                  <AvatarImage src={campaign.user.image || '/logo/mgh.png'} />
                                  <AvatarFallback>{campaign.user.name?.charAt(0) || campaign.user.email.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <h3 className="text-white font-semibold text-lg">{campaign.gameName}</h3>
                                  <p className="text-gray-400 text-sm">
                                    by {campaign.user.name || campaign.user.username || campaign.user.email}
                                    <br />
                                    <span className="text-gray-500 text-xs">{campaign.user.email}</span>
                                  </p>
                                </div>
                              </div>
                              <Badge variant="secondary" className="bg-purple-600/20 text-purple-300 border-purple-500/30">
                                ${campaign.budget}
                              </Badge>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div>
                                <p className="text-gray-400 text-sm mb-1">Goal</p>
                                <p className="text-white font-medium">{campaign.goal}</p>
                              </div>
                              <div>
                                <p className="text-gray-400 text-sm mb-1">Package</p>
                                <p className="text-white font-medium capitalize">{campaign.package}</p>
                              </div>
                              <div>
                                <p className="text-gray-400 text-sm mb-1">Submitted</p>
                                <p className="text-white font-medium">
                                  {new Date(campaign.submittedAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            
                            <div className="mt-4">
                              <p className="text-gray-400 text-sm mb-2">Placements</p>
                              <div className="flex flex-wrap gap-2">
                                {campaign.placements.map((placement, index) => (
                                  <Badge key={index} variant="outline" className="border-gray-600 text-gray-300">
                                    {placement.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <div className="text-center py-12">
                        <TrendingUp className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                        <h3 className="text-white text-lg font-semibold mb-2">No Campaigns Yet</h3>
                        <p className="text-gray-400">Campaigns submitted through the advertise page will appear here.</p>
                      </div>
                    )}
                  </div>
                  {campaigns.length > ITEMS_PER_PAGE && (
                    <div className="mt-6 flex justify-center items-center gap-2">
                      <div className="flex items-center gap-1">
                        {campaignsPage > 1 && (
                          <button
                            onClick={() => setCampaignsPage(campaignsPage - 1)}
                            className="h-8 px-3 rounded-md text-sm bg-zinc-800 text-gray-300 hover:bg-zinc-700"
                          >
                            Previous
                          </button>
                        )}
                        {Array.from({ length: totalCampaignPages }, (_, i) => i + 1).map((p) => (
                          <button
                            key={p}
                            onClick={() => setCampaignsPage(p)}
                            className={`h-8 min-w-8 px-2 rounded-md text-sm ${p === campaignsPage ? 'bg-purple-600 text-white' : 'bg-zinc-800 text-gray-300 hover:bg-zinc-700'}`}
                          >
                            {p}
                          </button>
                        ))}
                        {campaignsPage < totalCampaignPages && (
                          <button
                            onClick={() => setCampaignsPage(campaignsPage + 1)}
                            className="h-8 px-3 rounded-md text-sm bg-zinc-800 text-gray-300 hover:bg-zinc-700"
                          >
                            Next
                          </button>
                        )}
                      </div>
                      <span className="text-sm text-gray-400 ml-4">
                        Page {campaignsPage} of {totalCampaignPages}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {activeSection === 'users' && (
              <Card className="bg-zinc-900/40 backdrop-blur-md border border-white/10 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.6)]">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      All Users
                      <span className="text-xs text-gray-400">({users.length})</span>
                    </CardTitle>
                    <div className="flex gap-2 flex-wrap">
                      <Button
                        onClick={handleSendUsersFeedbackEmail}
                        disabled={usersFeedbackSending || users.length === 0}
                        className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {usersFeedbackSending ? (
                          <>
                            <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <Mail className="w-4 h-4 mr-2" />
                            Send Feedback Email
                          </>
                        )}
                      </Button>
                      <Button
                        onClick={handleDownloadUsersCSV}
                        className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download CSV
                      </Button>
                      <AlertDialog open={socialPromoDialogOpen} onOpenChange={setSocialPromoDialogOpen}>
                        <AlertDialogTrigger asChild>
                          <Button
                            disabled={users.length === 0}
                            className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Share2 className="w-4 h-4 mr-2" />
                            Send Social Media Promo Email
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-zinc-900 border border-white/10 text-white">
                          <AlertDialogHeader>
                            <AlertDialogTitle>Send Social Media Promo Email to all users?</AlertDialogTitle>
                            <AlertDialogDescription className="text-gray-300">
                              This will send a personalized email about our social channels to every registered user.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="bg-transparent border border-white/20 text-white hover:bg-white/10">
                              Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction asChild>
                              <Button
                                onClick={handleSendUsersSocialPromo}
                                disabled={socialPromoSending}
                                className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 disabled:opacity-50"
                              >
                                {socialPromoSending ? (
                                  <>
                                    <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                    Sending...
                                  </>
                                ) : (
                                  'Send to all users'
                                )}
                              </Button>
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <TooltipProvider delayDuration={120}>
                    <Table>
                      <TableHeader>
                        <TableRow className="border-gray-700">
                          <TableHead className="text-gray-300">Email</TableHead>
                          <TableHead className="text-gray-300">Signup Date</TableHead>
                            <TableHead className="text-right text-gray-300">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paginatedUsers.map((user) => (
                          <TableRow key={user.id} className="border-gray-700">
                            <TableCell className="text-white">
                              {user.email}
                            </TableCell>
                            <TableCell className="text-gray-300">
                              {new Date(user.createdAt).toLocaleDateString()}
                            </TableCell>
                              <TableCell className="text-right">
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      className="text-red-400 hover:text-white hover:bg-red-500/10"
                                      onClick={() => {
                                        setUserDeleteTarget(user)
                                        setUserDeleteError(null)
                                      }}
                                      disabled={userDeleteLoading}
                                    >
                                      <Trash2 className="w-4 h-4" />
                                      <span className="sr-only">Delete user</span>
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Delete this user</TooltipContent>
                                </Tooltip>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    </TooltipProvider>
                  </div>
                  {users.length > ITEMS_PER_PAGE && (
                    <div className="mt-6 flex justify-center items-center gap-2">
                      <div className="flex items-center gap-1">
                        {usersPage > 1 && (
                          <button
                            onClick={() => setUsersPage(usersPage - 1)}
                            className="h-8 px-3 rounded-md text-sm bg-zinc-800 text-gray-300 hover:bg-zinc-700"
                          >
                            Previous
                          </button>
                        )}
                        {Array.from({ length: totalUsersPages }, (_, i) => i + 1).map((p) => (
                          <button
                            key={p}
                            onClick={() => setUsersPage(p)}
                            className={`h-8 min-w-8 px-2 rounded-md text-sm ${p === usersPage ? 'bg-purple-600 text-white' : 'bg-zinc-800 text-gray-300 hover:bg-zinc-700'}`}
                          >
                            {p}
                          </button>
                        ))}
                        {usersPage < totalUsersPages && (
                          <button
                            onClick={() => setUsersPage(usersPage + 1)}
                            className="h-8 px-3 rounded-md text-sm bg-zinc-800 text-gray-300 hover:bg-zinc-700"
                          >
                            Next
                          </button>
                        )}
                      </div>
                      <span className="text-sm text-gray-400 ml-4">
                        Page {usersPage} of {totalUsersPages}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {activeSection === 'submitted-games' && (
              <Card className="bg-zinc-900/40 backdrop-blur-md border border-white/10 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.6)]">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <List className="w-5 h-5" />
                    Submitted Games Overview
                    <span className="text-xs text-gray-400">({submittedGames.length})</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-gray-700">
                          <TableHead className="text-gray-300">Title</TableHead>
                          <TableHead className="text-gray-300">Tagline</TableHead>
                          <TableHead className="text-gray-300">Social Profiles</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paginatedSubmittedGames.length > 0 ? (
                          paginatedSubmittedGames.map((game) => (
                            <TableRow 
                              key={game.id} 
                              className="border-gray-700 hover:bg-zinc-800/50 transition-colors cursor-pointer"
                              onClick={() => window.open(`/product/${game.slug}`, '_blank')}
                            >
                              <TableCell className="text-white font-medium">
                                <div className="truncate max-w-xs" title={game.title}>
                                  {game.title}
          </div>
                              </TableCell>
                              <TableCell className="text-gray-300">
                                <div className="truncate max-w-md" title={game.tagline || ''}>
                                  {game.tagline || <span className="text-gray-500">—</span>}
        </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2 flex-wrap">
                                  {game.socialLinks.twitter && (
                                    <a
                                      href={game.socialLinks.twitter}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      onClick={(e) => e.stopPropagation()}
                                      className="hover:opacity-80 transition-opacity"
                                      title="Twitter/X"
                                    >
                                      <SocialPlatformIcon platform="twitter" size={20} className="text-gray-300 hover:text-white" />
                                    </a>
                                  )}
                                  {game.socialLinks.tiktok && (
                                    <a
                                      href={game.socialLinks.tiktok}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      onClick={(e) => e.stopPropagation()}
                                      className="hover:opacity-80 transition-opacity"
                                      title="TikTok"
                                    >
                                      <SocialPlatformIcon platform="tiktok" size={20} className="text-gray-300 hover:text-white" />
                                    </a>
                                  )}
                                  {game.socialLinks.instagram && (
                                    <a
                                      href={game.socialLinks.instagram}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      onClick={(e) => e.stopPropagation()}
                                      className="hover:opacity-80 transition-opacity"
                                      title="Instagram"
                                    >
                                      <SocialPlatformIcon platform="instagram" size={20} className="text-gray-300 hover:text-white" />
                                    </a>
                                  )}
                                  {game.socialLinks.discord && (
                                    <a
                                      href={game.socialLinks.discord}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      onClick={(e) => e.stopPropagation()}
                                      className="hover:opacity-80 transition-opacity"
                                      title="Discord"
                                    >
                                      <SocialPlatformIcon platform="discord" size={20} className="text-gray-300 hover:text-white" />
                                    </a>
                                  )}
                                  {game.socialLinks.youtube && (
                                    <a
                                      href={game.socialLinks.youtube}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      onClick={(e) => e.stopPropagation()}
                                      className="hover:opacity-80 transition-opacity"
                                      title="YouTube"
                                    >
                                      <SocialPlatformIcon platform="youtube" size={20} className="text-gray-300 hover:text-white" />
                                    </a>
                                  )}
                                  {game.socialLinks.facebook && (
                                    <a
                                      href={game.socialLinks.facebook}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      onClick={(e) => e.stopPropagation()}
                                      className="hover:opacity-80 transition-opacity"
                                      title="Facebook"
                                    >
                                      <SocialPlatformIcon platform="facebook" size={20} className="text-gray-300 hover:text-white" />
                                    </a>
                                  )}
                                  {game.socialLinks.reddit && (
                                    <a
                                      href={game.socialLinks.reddit}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      onClick={(e) => e.stopPropagation()}
                                      className="hover:opacity-80 transition-opacity"
                                      title="Reddit"
                                    >
                                      <SocialPlatformIcon platform="reddit" size={20} className="text-gray-300 hover:text-white" />
                                    </a>
                                  )}
                                  {game.socialLinks.linkedin && (
                                    <a
                                      href={game.socialLinks.linkedin}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      onClick={(e) => e.stopPropagation()}
                                      className="hover:opacity-80 transition-opacity"
                                      title="LinkedIn"
                                    >
                                      <SocialPlatformIcon platform="linkedin" size={20} className="text-gray-300 hover:text-white" />
                                    </a>
                                  )}
                                  {game.socialLinks.website && (
                                    <a
                                      href={game.socialLinks.website}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      onClick={(e) => e.stopPropagation()}
                                      className="hover:opacity-80 transition-opacity"
                                      title="Website"
                                    >
                                      <SocialPlatformIcon platform="website" size={20} className="text-gray-300 hover:text-white" />
                                    </a>
                                  )}
                                  {game.storeLinks.ios && (
                                    <a
                                      href={game.storeLinks.ios}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      onClick={(e) => e.stopPropagation()}
                                      className="hover:opacity-80 transition-opacity"
                                      title="App Store"
                                    >
                                      <SocialPlatformIcon platform="ios" size={20} className="text-gray-300 hover:text-white" />
                                    </a>
                                  )}
                                  {game.storeLinks.android && (
                                    <a
                                      href={game.storeLinks.android}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      onClick={(e) => e.stopPropagation()}
                                      className="hover:opacity-80 transition-opacity"
                                      title="Google Play"
                                    >
                                      <SocialPlatformIcon platform="android" size={20} className="text-gray-300 hover:text-white" />
                                    </a>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow className="border-gray-700">
                            <TableCell colSpan={3} className="text-center text-gray-400 py-8">
                              No games found
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                  {submittedGames.length > ITEMS_PER_PAGE && (
                    <div className="mt-6 flex justify-center items-center gap-2">
                      <div className="flex items-center gap-1">
                        {submittedGamesPage > 1 && (
                          <button
                            onClick={() => setSubmittedGamesPage(submittedGamesPage - 1)}
                            className="h-8 px-3 rounded-md text-sm bg-zinc-800 text-gray-300 hover:bg-zinc-700"
                          >
                            Previous
                          </button>
                        )}
                        {Array.from({ length: totalSubmittedGamesPages }, (_, i) => i + 1).map((p) => (
                          <button
                            key={p}
                            onClick={() => setSubmittedGamesPage(p)}
                            className={`h-8 min-w-8 px-2 rounded-md text-sm ${p === submittedGamesPage ? 'bg-purple-600 text-white' : 'bg-zinc-800 text-gray-300 hover:bg-zinc-700'}`}
                          >
                            {p}
                          </button>
                        ))}
                        {submittedGamesPage < totalSubmittedGamesPages && (
                          <button
                            onClick={() => setSubmittedGamesPage(submittedGamesPage + 1)}
                            className="h-8 px-3 rounded-md text-sm bg-zinc-800 text-gray-300 hover:bg-zinc-700"
                          >
                            Next
                          </button>
                        )}
                      </div>
                      <span className="text-sm text-gray-400 ml-4">
                        Page {submittedGamesPage} of {totalSubmittedGamesPages}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {activeSection === 'test' && (
              <Card className="bg-zinc-900/40 backdrop-blur-md border border-white/10 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.6)]">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <TestTube className="w-5 h-5" />
                    Test Email Management
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Add Test Email Section */}
                  <div className="bg-zinc-800/40 p-4 rounded-lg border border-white/5">
                    <h3 className="text-white font-semibold mb-3">Add Test Email</h3>
                    <div className="flex gap-2">
                      <Input
                        type="email"
                        placeholder="Enter email address..."
                        value={testEmail}
                        onChange={(e) => setTestEmail(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !testEmailLoading) {
                            handleAddTestEmail()
                          }
                        }}
                        className="flex-1 bg-zinc-800/50 border-zinc-600 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-purple-500/20 focus:ring-2 rounded-lg"
                        disabled={testEmailLoading}
                      />
                      <Button
                        onClick={handleAddTestEmail}
                        disabled={!testEmail || testEmailLoading}
                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {testEmailLoading ? (
                          <>
                            <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                            Adding...
                          </>
                        ) : (
                          <>
                            <Mail className="w-4 h-4 mr-2" />
                            Add Email
                          </>
                        )}
                      </Button>
          </div>
                    <p className="text-gray-400 text-sm mt-2">
                      Add an email address to the newsletter subscription list for testing purposes. No welcome email will be sent.
                    </p>
        </div>

                <div className="bg-zinc-800/40 p-4 rounded-lg border border-white/5 space-y-3">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="text-white font-semibold">Saved Test Recipients</h3>
                      <p className="text-sm text-gray-400">
                        Select who should receive test campaigns ({testSelectionCount}/{testRecipients.length} selected)
                      </p>
      </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleSelectAllTestRecipients}
                        disabled={testRecipientsLoading || testRecipients.length === 0}
                        className="border-cyan-500/40 text-cyan-200 hover:bg-cyan-500/10"
                      >
                        Select all
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleClearTestRecipients}
                        disabled={testSelectionCount === 0}
                        className="text-gray-300 hover:text-white hover:bg-white/10"
                      >
                        Clear
                      </Button>
    </div>
                  </div>
                  <div className="border border-white/5 rounded-lg bg-black/30 max-h-56 overflow-y-auto">
                    {testRecipientsLoading ? (
                      <div className="p-4 text-sm text-gray-400">Loading recipients...</div>
                    ) : testRecipientsError ? (
                      <div className="p-4 text-sm text-red-400">{testRecipientsError}</div>
                    ) : testRecipients.length === 0 ? (
                      <div className="p-4 text-sm text-gray-400">No test emails yet. Add one above to get started.</div>
                    ) : (
                      <div className="divide-y divide-white/5">
                        {testRecipients.map((recipient) => {
                          const isSelected = selectedTestRecipients.includes(recipient.email)
                          return (
                            <label
                              key={recipient.id}
                              className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${
                                isSelected ? 'bg-cyan-500/5 border-l-2 border-cyan-400' : 'hover:bg-white/5'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => toggleTestRecipient(recipient.email)}
                                className="h-4 w-4 accent-cyan-400"
                              />
                              <div>
                                <p className="text-sm text-white">{recipient.email}</p>
                                <p className="text-xs text-gray-400">
                                  added {new Date(recipient.createdAt).toLocaleString()}
                                </p>
                              </div>
                            </label>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </div>

                  {/* All Email Buttons Section */}
                  <div className="bg-zinc-800/40 p-4 rounded-lg border border-white/5">
                    <h3 className="text-white font-semibold mb-4">Email Campaign Actions</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {/* Newsletter Subscribers Actions */}
                      <div className="space-y-2">
                        <h4 className="text-gray-300 text-sm font-medium mb-2">Newsletter Subscribers</h4>
                        <Button
                          onClick={() => runTestCampaign('social-promo')}
                          disabled={isTestActionDisabled}
                          className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {testCampaignLoading === 'social-promo' ? (
                            <>
                              <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                              Sending...
                            </>
                          ) : (
                            <>
                              <Share2 className="w-4 h-4 mr-2" />
                              Send Social Promo
                            </>
                          )}
                        </Button>
                        <Button
                          onClick={() => runTestCampaign('welcome')}
                          disabled={isTestActionDisabled}
                          className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {testCampaignLoading === 'welcome' ? (
                            <>
                              <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                              Sending...
                            </>
                          ) : (
                            <>
                              <Mail className="w-4 h-4 mr-2" />
                              Send Welcome Emails
                            </>
                          )}
                        </Button>
                        <Button
                          onClick={() => runTestCampaign('weekly')}
                          disabled={isTestActionDisabled}
                          className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Send weekly Top 5 to all subscribers"
                        >
                          {testCampaignLoading === 'weekly' ? (
                            <>
                              <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                              Sending Weekly...
                            </>
                          ) : (
                            <>
                              <Mail className="w-4 h-4 mr-2" />
                              Send Weekly Top 5
                            </>
                          )}
                        </Button>
                        <Button
                          onClick={() => runTestCampaign('latest')}
                          disabled={isTestActionDisabled}
                          className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Send latest published game to all subscribers"
                        >
                          {testCampaignLoading === 'latest' ? (
                            <>
                              <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                              Sending Latest...
                            </>
                          ) : (
                            <>
                              <Mail className="w-4 h-4 mr-2" />
                              Send Latest Game
                            </>
                          )}
                        </Button>
                      </div>

                      {/* Users Actions */}
                      <div className="space-y-2">
                        <h4 className="text-gray-300 text-sm font-medium mb-2">All Users</h4>
                        <Button
                          onClick={() => runTestCampaign('feedback')}
                          disabled={isTestActionDisabled}
                          className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {testCampaignLoading === 'feedback' ? (
                            <>
                              <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                              Sending...
                            </>
                          ) : (
                            <>
                              <Mail className="w-4 h-4 mr-2" />
                              Send Feedback Email
                            </>
                          )}
                        </Button>
                        <Button
                          onClick={() => runTestCampaign('social-promo')}
                          disabled={isTestActionDisabled}
                          className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {testCampaignLoading === 'social-promo' ? (
                            <>
                              <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                              Sending...
                            </>
                          ) : (
                            <>
                              <Share2 className="w-4 h-4 mr-2" />
                              Send Social Media Promo Email
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeSection === 'user-analytics' && (
              <Card className="bg-zinc-900/40 backdrop-blur-md border border-white/10 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.6)]">
                <CardContent className="p-6">
                  <UserAnalyticsDashboard />
                </CardContent>
              </Card>
            )}

            {activeSection === 'security-monitoring' && (
              <Card className="bg-zinc-900/40 backdrop-blur-md border border-white/10 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.6)]">
                <CardContent className="p-6">
                  <SecurityMonitoringDashboard />
                </CardContent>
              </Card>
            )}

            {activeSection === 'quest-feedback' && (
              <Card className="bg-zinc-900/40 backdrop-blur-md border border-white/10 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.6)]">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    Quest Feedback
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {/* Filter */}
                    <div className="flex items-center gap-4">
                      <label className="text-sm text-gray-300">Filter by reason:</label>
                      <select
                        value={questFeedbackFilter}
                        onChange={(e) => setQuestFeedbackFilter(e.target.value)}
                        className="bg-zinc-800 border border-white/10 text-white rounded px-3 py-2 text-sm"
                      >
                        <option value="">All</option>
                        <option value="WRONG_PLATFORM">Wrong Platform</option>
                        <option value="NOT_MY_STYLE">Not My Style</option>
                        <option value="NOT_INTERESTED">Not Interested</option>
                        <option value="OTHER">Other</option>
                      </select>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={fetchQuestFeedback}
                        disabled={questFeedbackLoading}
                        className="text-white border-white/20 hover:bg-white/10"
                      >
                        Refresh
                      </Button>
                    </div>

                    {/* Feedback Table */}
                    {questFeedbackLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="w-6 h-6 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        <span className="ml-2 text-gray-300">Loading feedback...</span>
                      </div>
                    ) : questFeedback.length === 0 ? (
                      <div className="text-center py-8 text-gray-400">
                        No Quest feedback yet. Users can provide feedback on Quest recommendations.
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow className="border-gray-700">
                              <TableHead className="text-gray-300">User</TableHead>
                              <TableHead className="text-gray-300">Game</TableHead>
                              <TableHead className="text-gray-300">Match Rank</TableHead>
                              <TableHead className="text-gray-300">Reason</TableHead>
                              <TableHead className="text-gray-300">Notes</TableHead>
                              <TableHead className="text-gray-300">Date</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {questFeedback.map((feedback) => (
                              <TableRow key={feedback.id} className="border-gray-700">
                                <TableCell className="text-white">
                                  <div className="flex flex-col">
                                    <span className="font-medium">
                                      {feedback.user?.name || feedback.user?.username || 'Unknown'}
                                    </span>
                                    <span className="text-xs text-gray-400">
                                      {feedback.user?.email}
                                    </span>
                                  </div>
                                </TableCell>
                                <TableCell className="text-gray-300">
                                  {feedback.gameTitle || feedback.gameId || 'N/A'}
                                </TableCell>
                                <TableCell className="text-gray-300">
                                  {feedback.matchRank ? `#${feedback.matchRank}` : 'N/A'}
                                </TableCell>
                                <TableCell className="text-gray-300">
                                  <Badge
                                    variant={
                                      feedback.reason === 'WRONG_PLATFORM' ? 'destructive' :
                                      feedback.reason === 'NOT_MY_STYLE' ? 'secondary' :
                                      'outline'
                                    }
                                    className="text-xs"
                                  >
                                    {feedback.reason.replace(/_/g, ' ')}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-gray-300 text-sm max-w-xs truncate">
                                  {feedback.notes || '-'}
                                </TableCell>
                                <TableCell className="text-gray-300 text-sm">
                                  {new Date(feedback.createdAt).toLocaleDateString()}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}

                    {/* Summary Stats */}
                    {questFeedback.length > 0 && (
                      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Card className="bg-zinc-800/50 border border-white/10">
                          <CardContent className="p-4">
                            <div className="text-2xl font-bold text-white">{questFeedback.length}</div>
                            <div className="text-sm text-gray-400">Total Feedback</div>
                          </CardContent>
                        </Card>
                        <Card className="bg-zinc-800/50 border border-white/10">
                          <CardContent className="p-4">
                            <div className="text-2xl font-bold text-red-400">
                              {questFeedback.filter(f => f.reason === 'WRONG_PLATFORM').length}
                            </div>
                            <div className="text-sm text-gray-400">Wrong Platform</div>
                          </CardContent>
                        </Card>
                        <Card className="bg-zinc-800/50 border border-white/10">
                          <CardContent className="p-4">
                            <div className="text-2xl font-bold text-yellow-400">
                              {questFeedback.filter(f => f.reason === 'NOT_MY_STYLE').length}
                            </div>
                            <div className="text-sm text-gray-400">Not My Style</div>
                          </CardContent>
                        </Card>
                        <Card className="bg-zinc-800/50 border border-white/10">
                          <CardContent className="p-4">
                            <div className="text-2xl font-bold text-blue-400">
                              {questFeedback.filter(f => f.reason === 'NOT_INTERESTED').length}
                            </div>
                            <div className="text-sm text-gray-400">Not Interested</div>
                          </CardContent>
                        </Card>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

          </div>
        </div>
      </div>
      <AlertDialog open={!!newsletterDeleteTarget} onOpenChange={(open) => {
        if (!open) {
          handleCancelNewsletterDelete()
        }
      }}>
        <AlertDialogContent className="bg-zinc-900 border border-white/10 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this email?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-300 space-y-2">
              <p>
                This will remove{' '}
                <span className="text-white font-semibold break-all">{newsletterDeleteTarget?.email}</span>{' '}
                from the newsletter subscriber list. They will no longer receive newsletters.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          {newsletterDeleteError && (
            <p className="text-sm text-red-400">{newsletterDeleteError}</p>
          )}
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel
              className="bg-transparent border border-white/20 text-white hover:bg-white/10"
              onClick={handleCancelNewsletterDelete}
              disabled={newsletterDeleteLoading}
            >
              Cancel
            </AlertDialogCancel>
            <Button
              variant="destructive"
              onClick={handleConfirmNewsletterDelete}
              disabled={newsletterDeleteLoading || !newsletterDeleteTarget}
              className="bg-red-600 hover:bg-red-700"
            >
              {newsletterDeleteLoading ? (
                <>
                  <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!userDeleteTarget} onOpenChange={(open) => {
        if (!open) {
          handleCancelUserDelete()
        }
      }}>
        <AlertDialogContent className="bg-zinc-900 border border-white/10 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this user?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-300 space-y-2">
              <p>
                This will permanently remove{' '}
                <span className="text-white font-semibold break-all">{userDeleteTarget?.email}</span> from MobileGameHunt.
              </p>
              <p>They will lose access to their account and any related features.</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          {userDeleteError && (
            <p className="text-sm text-red-400">{userDeleteError}</p>
          )}
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel
              className="bg-transparent border border-white/20 text-white hover:bg-white/10"
              onClick={handleCancelUserDelete}
              disabled={userDeleteLoading}
            >
              Cancel
            </AlertDialogCancel>
            <Button
              variant="destructive"
              onClick={handleConfirmUserDelete}
              disabled={userDeleteLoading || !userDeleteTarget}
              className="bg-red-600 hover:bg-red-700"
            >
              {userDeleteLoading ? (
                <>
                  <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
