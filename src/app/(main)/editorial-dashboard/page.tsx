"use client"

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Download, GamepadIcon, Mail, Star, MessageCircle, TrendingUp } from 'lucide-react'
import { toast } from 'sonner'
import DarkVeil from '@/components/DarkVeil'

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

type ActiveSection = 'games' | 'newsletter' | 'campaigns'

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

export default function EditorialDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [activeSection, setActiveSection] = useState<ActiveSection>('games')
  const [products, setProducts] = useState<Product[]>([])
  const [newsletterSubscribers, setNewsletterSubscribers] = useState<NewsletterSubscriber[]>([])
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [campaignPlacement, setCampaignPlacement] = useState<'ALL' | string>('ALL')

  // Filter products based on search term
  const filteredProducts = products.filter(product =>
    product.title.toLowerCase().includes(searchTerm.toLowerCase())
  )

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
        const [gamesRes, newsletterRes, campaignsRes] = await Promise.all([
          fetch('/api/admin/games'),
          fetch('/api/admin/newsletter'),
          fetch('/api/campaigns')
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
      } catch (error) {
        toast.error('Failed to load data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [session])

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
      const csvRows = newsletterSubscribers.map(subscriber => {
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
                        {filteredProducts.length > 0 ? (
                          filteredProducts.map((product) => (
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
                    </CardTitle>
                    <Button
                      onClick={handleDownloadCSV}
                      className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download CSV
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-gray-700">
                          <TableHead className="text-gray-300">Email</TableHead>
                          <TableHead className="text-gray-300">Signup Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {newsletterSubscribers.map((subscriber) => (
                          <TableRow key={subscriber.id} className="border-gray-700">
                            <TableCell className="text-white">
                              {subscriber.email}
                            </TableCell>
                            <TableCell className="text-gray-300">
                              {new Date(subscriber.createdAt).toLocaleDateString()}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeSection === 'campaigns' && (
              <Card className="bg-zinc-900/40 backdrop-blur-md border border-white/10 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.6)]">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Advertising Campaigns
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    {campaigns.length > 0 ? (
                      campaigns.map((campaign) => (
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
                </CardContent>
              </Card>
            )}

          </div>
        </div>
      </div>
    </div>
  )
}
