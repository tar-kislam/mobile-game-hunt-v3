"use client"

import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { productMainInfoSchema, productMediaSchema, productExtrasSchema, productChecklistSchema, productLaunchDetailsSchema, productFullSchema } from '@/lib/schemas/product'
import { createProductAction, saveDraftAction, scheduleLaunchAction, submitApprovalAction } from '@/lib/actions/products'
import { toast } from 'sonner'
import { Info, ExternalLink, Globe, MessageCircle, Twitter, Youtube, X, Plus, Check, X as XIcon } from 'lucide-react'
import { CategoryMultiSelect } from '@/components/ui/category-multi-select'
import { MultiSelect } from '@/components/ui/multi-select'
import { PLATFORMS } from '@/components/ui/platform-icons'
import { COUNTRIES } from '@/lib/constants/countries'
import { GAMIFICATION_TAGS } from '@/lib/constants/gamification'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { UserSearch } from '@/components/ui/user-search'
import { PressKitModal } from '@/components/ui/press-kit-modal'
import { GamePreviewCard } from '@/components/ui/game-preview-card'
import { ScheduleLaunchModal } from '@/components/ui/schedule-launch-modal'

type Step = 1 | 2 | 3 | 4 | 5 | 6

export default function NewSubmitPage() {
  const [step, setStep] = useState<Step>(1)
  const [autosave, setAutosave] = useState(false)
  const [additionalLinks, setAdditionalLinks] = useState<Array<{ type: string; url: string }>>([])
  const [xPrefix] = useState('x.com/')
  const [savedStudios, setSavedStudios] = useState<Array<{ id: string; name: string }>>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<any>({
    resolver: zodResolver(productFullSchema),
    defaultValues: {
      title: '', tagline: '', description: '', url: '',
      website: '', discordUrl: '', twitterUrl: '', tiktokUrl: '', youtubeUrl: '',
      isOpenSource: false, platforms: [], targetCountries: [],
      thumbnail: '', gallery: [], videoUrl: '', gameplayGifUrl: '', demoUrl: '',
      image: '', images: [], video: '',
      appStoreUrl: '', playStoreUrl: '', releaseAt: '',
      tags: [], categories: [], termsAccepted: false, confirmImagesOwned: false,
      makers: [], studioName: '', inviteEmail: '', inviteRole: 'MAKER',
      launchType: '', launchDate: '', softLaunchCountries: [], monetization: '', engine: '',
      pricing: '', promoOffer: '', promoCode: '', promoExpiry: '', playtestQuota: undefined, playtestExpiry: '', sponsorRequest: false, sponsorNote: '', crowdfundingPledge: false, gamificationTags: [],
    }
  })

  useEffect(() => {
    if (!autosave) return
    const sub = form.watch((values) => {
      try { localStorage.setItem('submit-autosave', JSON.stringify(values)) } catch {}
    })
    return () => sub.unsubscribe()
  }, [form, autosave])

  useEffect(() => {
    try {
      const raw = localStorage.getItem('submit-autosave')
      if (raw) form.reset(JSON.parse(raw))
    } catch {}
  }, [form])

  const next = () => setStep((s) => Math.min(6, (s + 1)) as Step)
  const prev = () => setStep((s) => Math.max(1, (s - 1)) as Step)

  const onSubmit = async (values: any) => {
    const res = await createProductAction(values)
    if (res.ok) {
      toast.success('Game submitted!')
      try { localStorage.removeItem('submit-autosave') } catch {}
    } else {
      toast.error('Please fix the errors')
    }
  }

  const handleSaveDraft = async () => {
    setIsSubmitting(true)
    try {
      const values = form.getValues()
      const res = await saveDraftAction(values)
      if (res.ok) {
        toast.success('Draft saved successfully!')
        try { localStorage.removeItem('submit-autosave') } catch {}
      } else {
        toast.error('Failed to save draft')
      }
    } catch (error) {
      toast.error('Failed to save draft')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleScheduleLaunch = async (launchDate: string) => {
    setIsSubmitting(true)
    try {
      const values = form.getValues()
      const res = await scheduleLaunchAction(values, launchDate)
      if (res.ok) {
        toast.success('Launch scheduled successfully!')
        try { localStorage.removeItem('submit-autosave') } catch {}
      } else {
        toast.error('Failed to schedule launch')
      }
    } catch (error) {
      toast.error('Failed to schedule launch')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSubmitApproval = async () => {
    setIsSubmitting(true)
    try {
      const values = form.getValues()
      const res = await submitApprovalAction(values)
      if (res.ok) {
        toast.success('Submitted for approval!')
        try { localStorage.removeItem('submit-autosave') } catch {}
        // Redirect to dashboard
        window.location.href = '/dashboard'
      } else {
        toast.error('Failed to submit for approval')
      }
    } catch (error) {
      toast.error('Failed to submit for approval')
    } finally {
      setIsSubmitting(false)
    }
  }

  const progress = useMemo(() => (step - 1) * 20, [step])
  const nameLen = (form.watch('title') || '').length
  const taglineLen = (form.watch('tagline') || '').length
  const descLen = (form.watch('description') || '').length
  const tags = form.watch('tags') || []
  const categories = form.watch('categories') || []
  const platforms = form.watch('platforms') || []
  const canNextFromStep1 = nameLen > 0 && nameLen <= 40 && taglineLen > 0 && taglineLen <= 60 && descLen >= 260 && descLen <= 500 && tags.length >= 1 && tags.length <= 3 && !!form.watch('url') && categories.length >= 1 && categories.length <= 3 && platforms.length >= 1
  const canNextFromStep2 = !!form.watch('thumbnail') && (form.watch('gallery') || []).length >= 1
  const canNextFromStep3 = (form.watch('makers') || []).length >= 1

  // Checklist validation functions
  const checklistValidation = {
    title: !!form.watch('title') && form.watch('title').length > 0,
    tagline: !!form.watch('tagline') && form.watch('tagline').length > 0,
    description: !!form.watch('description') && form.watch('description').length >= 260,
    thumbnail: !!form.watch('thumbnail'),
    gallery: (form.watch('gallery') || []).length >= 1,
    tags: (form.watch('tags') || []).length >= 1,
    categories: (form.watch('categories') || []).length >= 1,
    platforms: (form.watch('platforms') || []).length >= 1,
    makers: (form.watch('makers') || []).length >= 1,
    launchType: !!form.watch('launchType'),
    launchDate: !!form.watch('launchDate'),
    monetization: !!form.watch('monetization'),
    engine: !!form.watch('engine'),
    url: !!form.watch('url')
  }

  const requiredFieldsCount = Object.values(checklistValidation).filter(Boolean).length
  const totalRequiredFields = Object.keys(checklistValidation).length
  const completionPercentage = Math.round((requiredFieldsCount / totalRequiredFields) * 100)

  // Platform options for multi-select
  const platformOptions = PLATFORMS.map(p => ({
    id: p.value,
    label: p.label,
    icon: p.icon
  }))

  // Country options for multi-select
  const countryOptions = COUNTRIES.map(c => ({
    id: c.code,
    label: c.name,
    flag: c.flag
  }))

  return (
    <TooltipProvider>
      <div className="container mx-auto px-4 py-8">
        <div className="h-2 bg-muted rounded-full overflow-hidden mb-6">
          <div className="h-full bg-orange-500 transition-all" style={{ width: `${progress}%` }} />
        </div>
        <div className="grid lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <Card className="rounded-2xl shadow-soft lg:sticky lg:top-24">
              <CardHeader className="bg-muted rounded-t-2xl">
                <CardTitle className="text-sm">Post in progress<div className="text-xs font-normal text-muted-foreground">In progress</div></CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {[{id:1,label:'Main info',icon:'⚡'},{id:2,label:'Images and media',icon:'🖼️'},{id:3,label:'Makers',icon:'👥'},{id:4,label:'Launch Details',icon:'🚀'},{id:5,label:'Community & Extras',icon:'🌟'},{id:6,label:'Launch checklist',icon:'✅'}].map(i=> (
                  <button key={i.id} type="button" onClick={()=>setStep(i.id as Step)} className={`w-full text-left px-4 py-3 border-b last:border-b-0 transition-colors ${step===i.id ? 'bg-yellow-50 dark:bg-yellow-950/20 font-medium' : 'text-muted-foreground hover:bg-muted/50'}`}><span className="mr-2">{i.icon}</span>{i.label}</button>
                ))}
                <div className="flex items-center justify-between px-4 py-3">
                  <span className="text-xs text-muted-foreground">Auto-save</span>
                  <input aria-label="Auto-save drafts" type="checkbox" checked={autosave} onChange={(e) => setAutosave(e.target.checked)} />
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="lg:col-span-3 space-y-6">
            <Card className="rounded-2xl shadow-soft">
              <CardHeader>
                {step===1 && (<div><h1 className="text-2xl font-semibold">Tell us more about this launch</h1><p className="text-sm text-muted-foreground">We'll need its name, tagline, links, launch tags, and description.</p></div>)}
                {step===2 && (<div><h1 className="text-2xl font-semibold">Images and media</h1><p className="text-sm text-muted-foreground">Upload your thumbnail, gallery, and optional video or demo link.</p></div>)}
                {step===3 && (<div><h1 className="text-2xl font-semibold">Makers</h1><p className="text-sm text-muted-foreground">Did you work on this launch and who else helped?</p></div>)}
                {step===4 && (<div><h1 className="text-2xl font-semibold">Launch Details</h1><p className="text-sm text-muted-foreground">Configure launch type, date, countries, monetization, and engine.</p></div>)}
                {step===5 && (<div><h1 className="text-2xl font-semibold">Community & Extras</h1><p className="text-sm text-muted-foreground">Configure community features, playtests, sponsorships, and gamification.</p></div>)}
                {step===6 && (<div><h1 className="text-2xl font-semibold">Launch checklist</h1><p className="text-sm text-muted-foreground">Review required and recommended items before launch.</p></div>)}
              </CardHeader>
              <CardContent className="space-y-6">
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {step===1 && (
                    <div className="space-y-8">
                      {/* Game Title */}
                      <div>
                        <Label htmlFor="title" className="block text-sm font-medium mb-2">Game Title *</Label>
                        <div className="relative">
                          <Input 
                            id="title"
                            aria-label="Game title" 
                            maxLength={40} 
                            placeholder="Enter your game title" 
                            {...form.register('title')} 
                            className="h-12" 
                          />
                          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                            {nameLen}/40
                          </span>
                        </div>
                        {form.formState.errors.title && (
                          <p className="text-sm text-red-500 mt-1">{String(form.formState.errors.title.message)}</p>
                        )}
                      </div>

                      {/* Tagline */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <Label htmlFor="tagline" className="text-sm font-medium">Tagline / Short Pitch *</Label>
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="w-4 h-4 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>A concise, compelling description that captures your game's essence</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <div className="relative">
                          <Input 
                            id="tagline"
                            aria-label="Tagline" 
                            maxLength={60} 
                            placeholder="A concise, compelling description of your game" 
                            {...form.register('tagline')} 
                            className="h-12" 
                          />
                          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                            {taglineLen}/60
                          </span>
                        </div>
                        {form.formState.errors.tagline && (
                          <p className="text-sm text-red-500 mt-1">{String(form.formState.errors.tagline.message)}</p>
                        )}
                      </div>

                      {/* Description */}
                      <div>
                        <Label htmlFor="description" className="block text-sm font-medium mb-2">Description *</Label>
                        <div className="relative">
                          <Textarea 
                            id="description"
                            aria-label="Description" 
                            maxLength={500} 
                            placeholder="Tell us about your game. What makes it unique? What's the gameplay like? What inspired you to create it?" 
                            {...form.register('description')} 
                            className="min-h-[120px]" 
                          />
                          <span className="absolute right-2 bottom-2 text-xs text-muted-foreground">
                            {descLen}/500
                          </span>
                        </div>
                        {form.formState.errors.description && (
                          <p className="text-sm text-red-500 mt-1">{String(form.formState.errors.description.message)}</p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">Minimum 260 characters required</p>
                      </div>

                      {/* Primary Launch URL */}
                      <div>
                        <Label htmlFor="url" className="block text-sm font-medium mb-2">Primary Launch URL *</Label>
                        <Input 
                          id="url"
                          aria-label="Primary URL" 
                          placeholder="https://apps.apple.com/app/your-game or https://play.google.com/store/apps/details?id=your.game" 
                          {...form.register('url')} 
                          className="h-12" 
                        />
                        {form.formState.errors.url && (
                          <p className="text-sm text-red-500 mt-1">{String(form.formState.errors.url.message)}</p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">App Store or Google Play URL required</p>
                      </div>

                      {/* Additional Links Section */}
                      <div className="space-y-4">
                        <h3 className="font-medium text-lg">Additional Links</h3>
                        <p className="text-sm text-muted-foreground">Optional links to help users discover and engage with your game</p>
                        
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="website" className="text-sm font-medium">Website</Label>
                            <div className="relative">
                              <Input 
                                id="website"
                                placeholder="https://yourgame.com" 
                                {...form.register('website')} 
                                className="h-12 pl-10" 
                              />
                              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            </div>
                          </div>

                          <div>
                            <Label htmlFor="discordUrl" className="text-sm font-medium">Discord Server</Label>
                            <div className="relative">
                              <Input 
                                id="discordUrl"
                                placeholder="https://discord.gg/yourgame" 
                                {...form.register('discordUrl')} 
                                className="h-12 pl-10" 
                              />
                              <MessageCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            </div>
                          </div>

                          <div>
                            <Label htmlFor="twitterUrl" className="text-sm font-medium">Twitter/X Account</Label>
                            <div className="relative">
                              <Input 
                                id="twitterUrl"
                                placeholder="https://x.com/yourgame" 
                                {...form.register('twitterUrl')} 
                                className="h-12 pl-10" 
                              />
                              <Twitter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            </div>
                          </div>

                          <div>
                            <Label htmlFor="tiktokUrl" className="text-sm font-medium">TikTok</Label>
                            <div className="relative">
                              <Input 
                                id="tiktokUrl"
                                placeholder="https://tiktok.com/@yourgame" 
                                {...form.register('tiktokUrl')} 
                                className="h-12 pl-10" 
                              />
                              <ExternalLink className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            </div>
                          </div>

                          <div>
                            <Label htmlFor="youtubeUrl" className="text-sm font-medium">YouTube Trailer</Label>
                            <div className="relative">
                              <Input 
                                id="youtubeUrl"
                                placeholder="https://youtube.com/watch?v=..." 
                                {...form.register('youtubeUrl')} 
                                className="h-12 pl-10" 
                              />
                              <Youtube className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Open Source Checkbox */}
                      <div className="flex items-center space-x-2">
                        <input 
                          type="checkbox"
                          id="isOpenSource" 
                          {...form.register('isOpenSource')} 
                        />
                        <Label htmlFor="isOpenSource" className="text-sm font-medium">
                          This is an open source project
                        </Label>
                      </div>

                      {/* Categories */}
                      <div>
                        <Label className="block text-sm font-medium mb-2">Categories *</Label>
                        <CategoryMultiSelect
                          selectedCategories={form.watch('categories') || []}
                          onSelectionChange={(categoryIds) => form.setValue('categories', categoryIds)}
                          maxSelections={3}
                          placeholder="Select game categories..."
                        />
                        {form.formState.errors.categories && (
                          <p className="text-sm text-red-500 mt-1">{String(form.formState.errors.categories.message)}</p>
                        )}
                      </div>

                      {/* Platforms */}
                      <div>
                        <Label className="block text-sm font-medium mb-2">Platforms *</Label>
                        <MultiSelect
                          selectedItems={form.watch('platforms') || []}
                          onSelectionChange={(platformIds) => form.setValue('platforms', platformIds)}
                          options={platformOptions}
                          maxSelections={5}
                          placeholder="Select platforms..."
                        />
                        {form.formState.errors.platforms && (
                          <p className="text-sm text-red-500 mt-1">{String(form.formState.errors.platforms.message)}</p>
                        )}
                      </div>

                      {/* Target Countries */}
                      <div>
                        <Label className="block text-sm font-medium mb-2">Target Countries (Soft Launch)</Label>
                        <MultiSelect
                          selectedItems={form.watch('targetCountries') || []}
                          onSelectionChange={(countryIds) => form.setValue('targetCountries', countryIds)}
                          options={countryOptions}
                          maxSelections={10}
                          placeholder="Select target countries..."
                        />
                        <p className="text-xs text-muted-foreground mt-1">Select countries for soft launch targeting</p>
                      </div>

                      {/* Launch Tags */}
                      <div>
                        <h3 className="font-medium mb-2">Launch tags</h3>
                        <Label className="text-sm mb-2 block">Select up to three launch tags</Label>
                        <Input 
                          placeholder="tag1, tag2, tag3" 
                          onChange={(e)=>{
                            const arr=e.target.value.split(',').map(s=>s.trim()).filter(Boolean).slice(0,3); 
                            form.setValue('tags', arr)
                          }} 
                        />
                        <p className="text-xs text-muted-foreground mt-1">{(form.watch('tags')||[]).length}/3 selected</p>
                      </div>

                      {/* Validation Summary */}
                      <div className="bg-[#FEF3C7] text-[#D97706] text-sm rounded-lg p-3 space-y-1">
                        {(form.watch('title')||'').length===0 && <div>• Game title is required</div>}
                        {(form.watch('tagline')||'').length===0 && <div>• Tagline is required</div>}
                        {(form.watch('description')||'').length < 260 && <div>• Description must be at least 260 characters</div>}
                        {((form.watch('tags')||[]).length)===0 && <div>• Launch tag is required</div>}
                        {((form.watch('categories')||[]).length)===0 && <div>• Category is required</div>}
                        {((form.watch('platforms')||[]).length)===0 && <div>• Platform is required</div>}
                        {!form.watch('url') && <div>• Primary launch URL is required</div>}
                      </div>
                    </div>
                  )}
                  {step===2 && (
                    <div className="space-y-8">
                      {/* Thumbnail Upload */}
                      <div>
                        <h3 className="text-lg font-semibold">Thumbnail *</h3>
                        <p className="text-sm text-muted-foreground mb-4">Upload a square thumbnail image (240x240px recommended)</p>
                        <div className="space-y-4">
                          <div className="flex gap-2">
                            <Input 
                              placeholder="Paste thumbnail URL here..." 
                              {...form.register('thumbnail')} 
                              className="flex-1"
                            />
                            <Button 
                              type="button" 
                              variant="outline"
                              onClick={() => {
                                const input = document.createElement('input')
                                input.type = 'file'
                                input.accept = 'image/*'
                                input.onchange = async (e) => {
                                  const file = (e.target as HTMLInputElement).files?.[0]
                                  if (file) {
                                    const formData = new FormData()
                                    formData.append('file', file)
                                    try {
                                      const response = await fetch('/api/upload', { method: 'POST', body: formData })
                                      const result = await response.json()
                                      if (result.success) {
                                        form.setValue('thumbnail', result.url)
                                        toast.success('Thumbnail uploaded successfully')
                                      }
                                    } catch (error) {
                                      toast.error('Failed to upload thumbnail')
                                    }
                                  }
                                }
                                input.click()
                              }}
                            >
                              Upload
                            </Button>
                          </div>
                          {form.watch('thumbnail') && (
                            <div className="relative w-24 h-24">
                              <img 
                                src={form.watch('thumbnail')} 
                                alt="Thumbnail preview" 
                                className="w-full h-full object-cover rounded-lg border"
                              />
                              <button
                                type="button"
                                onClick={() => form.setValue('thumbnail', '')}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                          {form.formState.errors.thumbnail && (
                            <p className="text-sm text-red-500">{String(form.formState.errors.thumbnail.message)}</p>
                          )}
                        </div>
                      </div>

                      {/* Gallery Images */}
                      <div>
                        <h3 className="text-lg font-semibold">Gallery Images *</h3>
                        <p className="text-sm text-muted-foreground mb-4">The first image will be used as the social preview when your link is shared online. We recommend at least 3 or more images.</p>
                        
                        {/* Main Upload Area */}
                        <div className="border-2 border-dashed border-muted-foreground/25 rounded-xl p-8 text-center mb-6 hover:border-primary/50 transition-colors">
                          <div className="flex flex-col items-center justify-center space-y-4">
                            <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                              <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-center justify-center space-x-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    const input = document.createElement('input')
                                    input.type = 'file'
                                    input.multiple = true
                                    input.accept = 'image/*'
                                    input.onchange = async (e) => {
                                      const files = Array.from((e.target as HTMLInputElement).files || [])
                                      const currentGallery = form.watch('gallery') || []
                                      
                                      for (const file of files) {
                                        const formData = new FormData()
                                        formData.append('file', file)
                                        try {
                                          const response = await fetch('/api/upload', { method: 'POST', body: formData })
                                          const result = await response.json()
                                          if (result.success) {
                                            currentGallery.push(result.url)
                                          }
                                        } catch (error) {
                                          toast.error('Failed to upload image')
                                        }
                                      }
                                      
                                      form.setValue('gallery', currentGallery)
                                      toast.success(`${files.length} image(s) uploaded successfully`)
                                    }
                                    input.click()
                                  }}
                                  className="text-primary hover:text-primary/80 font-medium"
                                >
                                  Browse for files
                                </button>
                                <span className="text-muted-foreground">or</span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const url = prompt('Paste image URL:')
                                    if (url && url.trim()) {
                                      const currentGallery = form.watch('gallery') || []
                                      form.setValue('gallery', [...currentGallery, url.trim()])
                                      toast.success('Image URL added successfully')
                                    }
                                  }}
                                  className="text-primary hover:text-primary/80 font-medium"
                                >
                                  Paste a URL
                                </button>
                              </div>
                              <div className="text-xs text-muted-foreground space-y-1">
                                <p>Upload at least one image</p>
                                <p>1270x760px or higher recommended</p>
                                <p>The first image will be used as preview</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* URL Input */}
                        <div className="flex gap-2 mb-6">
                          <Input 
                            placeholder="Or paste image URLs (comma separated)..." 
                            value={(form.watch('gallery') || []).join(', ')}
                            onChange={(e) => {
                              const urls = e.target.value.split(',').map(url => url.trim()).filter(Boolean)
                              form.setValue('gallery', urls)
                            }}
                            className="flex-1"
                          />
                          <Button 
                            type="button" 
                            variant="outline"
                            onClick={() => {
                              const input = document.createElement('input')
                              input.type = 'file'
                              input.multiple = true
                              input.accept = 'image/*'
                              input.onchange = async (e) => {
                                const files = Array.from((e.target as HTMLInputElement).files || [])
                                const currentGallery = form.watch('gallery') || []
                                
                                for (const file of files) {
                                  const formData = new FormData()
                                  formData.append('file', file)
                                  try {
                                    const response = await fetch('/api/upload', { method: 'POST', body: formData })
                                    const result = await response.json()
                                    if (result.success) {
                                      currentGallery.push(result.url)
                                    }
                                  } catch (error) {
                                    toast.error('Failed to upload image')
                                  }
                                }
                                
                                form.setValue('gallery', currentGallery)
                                toast.success(`${files.length} image(s) uploaded successfully`)
                              }
                              input.click()
                            }}
                          >
                            Upload Multiple
                          </Button>
                        </div>
                        
                        {/* Gallery Preview Grid */}
                        {(form.watch('gallery') || []).length > 0 && (
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium">
                                {(form.watch('gallery') || []).length} gallery images
                              </p>
                              <p className="text-xs text-muted-foreground">Drag to reorder carousel images</p>
                            </div>
                            
                            {/* 8x2 Grid Layout */}
                            <div className="grid grid-cols-8 gap-2">
                              {(form.watch('gallery') || []).map((url, index) => (
                                <div 
                                  key={index} 
                                  className="relative group aspect-video rounded-lg overflow-hidden border border-border cursor-move hover:border-primary/50 transition-colors"
                                  draggable
                                  onDragStart={(e) => {
                                    e.dataTransfer.setData('text/plain', index.toString())
                                  }}
                                  onDragOver={(e) => {
                                    e.preventDefault()
                                    e.currentTarget.classList.add('border-primary')
                                  }}
                                  onDragLeave={(e) => {
                                    e.currentTarget.classList.remove('border-primary')
                                  }}
                                  onDrop={(e) => {
                                    e.preventDefault()
                                    e.currentTarget.classList.remove('border-primary')
                                    const draggedIndex = parseInt(e.dataTransfer.getData('text/plain'))
                                    const dropIndex = index
                                    
                                    if (draggedIndex !== dropIndex) {
                                      const currentGallery = [...(form.watch('gallery') || [])]
                                      const [draggedItem] = currentGallery.splice(draggedIndex, 1)
                                      currentGallery.splice(dropIndex, 0, draggedItem)
                                      form.setValue('gallery', currentGallery)
                                      toast.success('Image reordered successfully')
                                    }
                                  }}
                                >
                                  <img
                                    src={url}
                                    alt={`Gallery ${index + 1}`}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      e.currentTarget.src = '/placeholder-image.png'
                                    }}
                                  />
                                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const currentGallery = form.watch('gallery') || []
                                        const newGallery = currentGallery.filter((_, i) => i !== index)
                                        form.setValue('gallery', newGallery)
                                        toast.success('Image removed')
                                      }}
                                      className="opacity-0 group-hover:opacity-100 bg-red-500 text-white rounded-full p-1 transition-opacity"
                                    >
                                      <X className="w-3 h-3" />
                                    </button>
                                  </div>
                                  <div className="absolute top-1 left-1 bg-black/50 text-white text-xs px-1 py-0.5 rounded">
                                    {index + 1}
                                  </div>
                                </div>
                              ))}
                              
                              {/* Empty placeholders */}
                              {Array.from({ length: Math.max(0, 16 - (form.watch('gallery') || []).length) }).map((_, index) => (
                                <div 
                                  key={`empty-${index}`}
                                  className="aspect-video rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/20"
                                />
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {form.formState.errors.gallery && (
                          <p className="text-sm text-red-500 mt-2">{String(form.formState.errors.gallery.message)}</p>
                        )}
                      </div>

                      {/* Video Upload */}
                      <div>
                        <h3 className="text-lg font-semibold">Video (YouTube)</h3>
                        <p className="text-sm text-muted-foreground mb-4">Add a YouTube video link to showcase your game</p>
                        <Input 
                          placeholder="https://youtube.com/watch?v=..." 
                          {...form.register('videoUrl')} 
                        />
                        {form.formState.errors.videoUrl && (
                          <p className="text-sm text-red-500 mt-1">{String(form.formState.errors.videoUrl.message)}</p>
                        )}
                      </div>

                      {/* Gameplay GIF */}
                      <div>
                        <h3 className="text-lg font-semibold">Gameplay GIF (Optional)</h3>
                        <p className="text-sm text-muted-foreground mb-4">Upload a GIF to show gameplay in action</p>
                        <div className="space-y-4">
                          <div className="flex gap-2">
                            <Input 
                              placeholder="Paste GIF URL here..." 
                              {...form.register('gameplayGifUrl')} 
                              className="flex-1"
                            />
                            <Button 
                              type="button" 
                              variant="outline"
                              onClick={() => {
                                const input = document.createElement('input')
                                input.type = 'file'
                                input.accept = 'image/gif'
                                input.onchange = async (e) => {
                                  const file = (e.target as HTMLInputElement).files?.[0]
                                  if (file) {
                                    const formData = new FormData()
                                    formData.append('file', file)
                                    try {
                                      const response = await fetch('/api/upload', { method: 'POST', body: formData })
                                      const result = await response.json()
                                      if (result.success) {
                                        form.setValue('gameplayGifUrl', result.url)
                                        toast.success('GIF uploaded successfully')
                                      }
                                    } catch (error) {
                                      toast.error('Failed to upload GIF')
                                    }
                                  }
                                }
                                input.click()
                              }}
                            >
                              Upload GIF
                            </Button>
                          </div>
                          {form.watch('gameplayGifUrl') && (
                            <div className="relative max-w-xs">
                              <img 
                                src={form.watch('gameplayGifUrl')} 
                                alt="Gameplay GIF" 
                                className="w-full rounded-lg border"
                              />
                              <button
                                type="button"
                                onClick={() => form.setValue('gameplayGifUrl', '')}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                          {form.formState.errors.gameplayGifUrl && (
                            <p className="text-sm text-red-500 mt-1">{String(form.formState.errors.gameplayGifUrl.message)}</p>
                          )}
                        </div>
                      </div>

                      {/* Interactive Demo Link */}
                      <div>
                        <h3 className="text-lg font-semibold">Interactive Demo Link (Optional)</h3>
                        <p className="text-sm text-muted-foreground mb-4">Add a link to an interactive demo (WebGL, TestFlight, APK, etc.)</p>
                        <Input 
                          placeholder="https://your-demo-link.com" 
                          {...form.register('demoUrl')} 
                        />
                        {form.formState.errors.demoUrl && (
                          <p className="text-sm text-red-500 mt-1">{String(form.formState.errors.demoUrl.message)}</p>
                        )}
                      </div>

                      {/* Validation Summary */}
                      <div className="bg-[#FEF3C7] text-[#D97706] text-sm rounded-lg p-3 space-y-1">
                        {!form.watch('thumbnail') && <div>• Thumbnail is required</div>}
                        {(form.watch('gallery') || []).length < 1 && <div>• At least one gallery image is required</div>}
                      </div>
                    </div>
                  )}
                  {step===3 && (
                    <div className="space-y-8">
                      {/* Makers Section */}
                      <div>
                        <h3 className="text-lg font-semibold">Makers & Team</h3>
                        <p className="text-sm text-muted-foreground mb-6">Add the people who worked on this game. You can search existing users or invite new collaborators.</p>
                        
                        {/* User Search */}
                        <div className="space-y-4">
                          <Label className="text-sm font-medium">Search & Add Makers</Label>
                          <UserSearch
                            onUserSelect={(user, role) => {
                              const currentMakers = form.watch('makers') || []
                              const newMaker = {
                                userId: user.id,
                                role,
                                name: user.name,
                                email: user.email,
                                image: user.image,
                                isCreator: currentMakers.length === 0 // First maker is creator
                              }
                              form.setValue('makers', [...currentMakers, newMaker])
                            }}
                            selectedUsers={form.watch('makers') || []}
                            onUserRemove={(userId) => {
                              const currentMakers = form.watch('makers') || []
                              const updatedMakers = currentMakers.filter(maker => 
                                (maker.userId || maker.email) !== userId
                              )
                              form.setValue('makers', updatedMakers)
                            }}
                            onRoleChange={(userId, role) => {
                              const currentMakers = form.watch('makers') || []
                              const updatedMakers = currentMakers.map(maker => 
                                (maker.userId || maker.email) === userId ? { ...maker, role } : maker
                              )
                              form.setValue('makers', updatedMakers)
                            }}
                          />
                        </div>
                      </div>

                      {/* Studio/Publisher Name */}
                      <div>
                        <Label htmlFor="studioName" className="text-sm font-medium">Studio / Publisher Name (Optional)</Label>
                        <div className="flex gap-2 mt-2">
                          <Input
                            id="studioName"
                            placeholder="Enter your studio or publisher name"
                            maxLength={80}
                            {...form.register('studioName')}
                            className="flex-1"
                          />
                          {/* Add Button - visible when typing */}
                          {form.watch('studioName') && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const studioName = form.watch('studioName')
                                if (studioName && studioName.trim()) {
                                  // Add to saved studios
                                  const newStudio = { id: Date.now().toString(), name: studioName }
                                  setSavedStudios(prev => [...prev, newStudio])
                                  // Clear the input
                                  form.setValue('studioName', '')
                                  toast.success('Studio name added!')
                                }
                              }}
                              className="flex items-center gap-1"
                            >
                              <Plus className="w-4 h-4" />
                              Add
                            </Button>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {(form.watch('studioName') || '').length}/80 characters
                        </p>
                        {form.formState.errors.studioName && (
                          <p className="text-sm text-red-500 mt-1">{String(form.formState.errors.studioName.message)}</p>
                        )}
                        
                        {/* Display current studio name as pill if entered */}
                        {form.watch('studioName') && (
                          <div className="mt-3">
                            <div className="flex items-center gap-2 p-2 bg-muted/30 rounded-full border w-fit">
                              <span className="text-sm font-medium">{form.watch('studioName')}</span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => form.setValue('studioName', '')}
                                className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 h-6 w-6"
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        )}

                        {/* Display saved studios as pills */}
                        {savedStudios.length > 0 && (
                          <div className="mt-3">
                            <h4 className="text-sm font-medium mb-2">Saved Studios ({savedStudios.length})</h4>
                            <div className="flex flex-wrap gap-2">
                              {savedStudios.map((studio) => (
                                <div key={studio.id} className="flex items-center gap-2 p-2 bg-muted/30 rounded-full border">
                                  <span className="text-sm font-medium">{studio.name}</span>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      setSavedStudios(prev => prev.filter(s => s.id !== studio.id))
                                      toast.success('Studio removed!')
                                    }}
                                    className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 h-6 w-6"
                                  >
                                    <X className="w-3 h-3" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Invite Collaborators */}
                      <div>
                        <h4 className="text-base font-semibold">Invite Collaborators</h4>
                        <p className="text-sm text-muted-foreground mb-4">Invite people who aren't registered yet by email</p>
                        
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="md:col-span-2">
                              <Label htmlFor="inviteEmail" className="text-sm font-medium">Email Address</Label>
                              <Input
                                id="inviteEmail"
                                type="email"
                                placeholder="collaborator@example.com"
                                {...form.register('inviteEmail')}
                                className="mt-1"
                              />
                              {form.formState.errors.inviteEmail && (
                                <p className="text-sm text-red-500 mt-1">{String(form.formState.errors.inviteEmail.message)}</p>
                              )}
                            </div>
                            <div>
                              <Label htmlFor="inviteRole" className="text-sm font-medium">Role</Label>
                              <select
                                id="inviteRole"
                                {...form.register('inviteRole')}
                                className="w-full mt-1 px-3 py-2 border border-border rounded-md bg-background text-sm"
                              >
                                <option value="MAKER">Maker</option>
                                <option value="DESIGNER">Designer</option>
                                <option value="DEVELOPER">Developer</option>
                                <option value="PUBLISHER">Publisher</option>
                                <option value="HUNTER">Hunter</option>
                              </select>
                            </div>
                          </div>
                          
                          {/* Add button - visible when typing */}
                          {form.watch('inviteEmail') && (
                            <Button
                              type="button"
                              variant="outline"
                              onClick={async () => {
                                const inviteEmail = form.watch('inviteEmail')
                                const inviteRole = form.watch('inviteRole')
                                
                                if (!inviteEmail) {
                                  toast.error('Please enter an email address')
                                  return
                                }
                                
                                try {
                                  const response = await fetch('/api/invite', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({
                                      email: inviteEmail,
                                      productId: 'temp', // Will be updated when product is created
                                      role: inviteRole
                                    })
                                  })
                                  
                                  const result = await response.json()
                                  
                                  if (result.success) {
                                    toast.success('Invite sent successfully!')
                                    form.setValue('inviteEmail', '')
                                    
                                    // Add to makers list for display
                                    const currentMakers = form.watch('makers') || []
                                    const newMaker = {
                                      userId: '', // No userId for invited users
                                      email: inviteEmail,
                                      role: inviteRole,
                                      name: inviteEmail.split('@')[0], // Use email prefix as name
                                      image: undefined,
                                      isCreator: false
                                    }
                                    form.setValue('makers', [...currentMakers, newMaker])
                                  } else {
                                    toast.error(result.error || 'Failed to send invite')
                                  }
                                } catch (error) {
                                  console.error('Error sending invite:', error)
                                  toast.error('Failed to send invite')
                                }
                              }}
                              className="w-full md:w-auto"
                            >
                              Send Invite
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Validation Summary */}
                      <div className="bg-[#FEF3C7] text-[#D97706] text-sm rounded-lg p-3 space-y-1">
                        {(form.watch('makers') || []).length === 0 && <div>• At least one maker is required</div>}
                        {(form.watch('makers') || []).length > 5 && <div>• Maximum 5 makers allowed</div>}
                        {form.formState.errors.makers && <div>• {String(form.formState.errors.makers.message)}</div>}
                      </div>
                    </div>
                  )}
                  {step===4 && (
                    <div className="space-y-8">
                      {/* Launch Type */}
                      <div>
                        <Label className="text-sm font-medium">Launch Type *</Label>
                        <div className="space-y-3 mt-3">
                          <label className="flex items-start gap-3 cursor-pointer">
                            <input 
                              type="radio" 
                              name="launchType" 
                              value="SOFT_LAUNCH"
                              onChange={() => form.setValue('launchType', 'SOFT_LAUNCH')}
                              className="mt-1"
                            />
                            <div>
                              <span className="font-medium">Soft Launch</span>
                              <div className="text-sm text-muted-foreground">Launch in select countries first to test and optimize</div>
                            </div>
                          </label>
                          <label className="flex items-start gap-3 cursor-pointer">
                            <input 
                              type="radio" 
                              name="launchType" 
                              value="GLOBAL_LAUNCH"
                              onChange={() => form.setValue('launchType', 'GLOBAL_LAUNCH')}
                              className="mt-1"
                            />
                            <div>
                              <span className="font-medium">Global Launch</span>
                              <div className="text-sm text-muted-foreground">Launch worldwide simultaneously</div>
                            </div>
                          </label>
                        </div>
                        {form.formState.errors.launchType && (
                          <p className="text-sm text-red-500 mt-1">{String(form.formState.errors.launchType.message)}</p>
                        )}
                      </div>

                      {/* Launch Date */}
                      <div>
                        <Label htmlFor="launchDate" className="text-sm font-medium">Launch Date *</Label>
                        <Input
                          id="launchDate"
                          type="date"
                          {...form.register('launchDate')}
                          className="mt-2"
                        />
                        {form.formState.errors.launchDate && (
                          <p className="text-sm text-red-500 mt-1">{String(form.formState.errors.launchDate.message)}</p>
                        )}
                      </div>

                      {/* Soft Launch Countries */}
                      {form.watch('launchType') === 'SOFT_LAUNCH' && (
                        <div>
                          <Label className="text-sm font-medium">Soft Launch Countries *</Label>
                          <p className="text-sm text-muted-foreground mt-1">Select countries for soft launch</p>
                          <MultiSelect
                            options={countryOptions}
                            selectedItems={form.watch('softLaunchCountries') || []}
                            onSelectionChange={(selected) => form.setValue('softLaunchCountries', selected)}
                            placeholder="Select countries..."
                          />
                          {form.formState.errors.softLaunchCountries && (
                            <p className="text-sm text-red-500 mt-1">{String(form.formState.errors.softLaunchCountries.message)}</p>
                          )}
                        </div>
                      )}

                      {/* Monetization Model */}
                      <div>
                        <Label className="text-sm font-medium">Monetization Model *</Label>
                        <div className="space-y-3 mt-3">
                          {[
                            { value: 'FREE', label: 'Free', description: 'Completely free to play' },
                            { value: 'PAID', label: 'Paid', description: 'One-time purchase required' },
                            { value: 'FREEMIUM', label: 'Freemium', description: 'Free with optional purchases' },
                            { value: 'ADS_SUPPORTED', label: 'Ads Supported', description: 'Free with advertisements' },
                            { value: 'SUBSCRIPTION', label: 'Subscription', description: 'Monthly/yearly subscription' }
                          ].map((option) => (
                            <label key={option.value} className="flex items-start gap-3 cursor-pointer">
                              <input 
                                type="radio" 
                                name="monetization" 
                                value={option.value}
                                onChange={() => form.setValue('monetization', option.value)}
                                className="mt-1"
                              />
                              <div>
                                <span className="font-medium">{option.label}</span>
                                <div className="text-sm text-muted-foreground">{option.description}</div>
                              </div>
                            </label>
                          ))}
                        </div>
                        {form.formState.errors.monetization && (
                          <p className="text-sm text-red-500 mt-1">{String(form.formState.errors.monetization.message)}</p>
                        )}
                      </div>

                      {/* Engine Used */}
                      <div>
                        <Label htmlFor="engine" className="text-sm font-medium">Engine Used *</Label>
                        <select
                          id="engine"
                          {...form.register('engine')}
                          className="w-full mt-2 px-3 py-2 border border-border rounded-md bg-background"
                        >
                          <option value="">Select engine...</option>
                          <option value="UNITY">Unity</option>
                          <option value="UNREAL">Unreal Engine</option>
                          <option value="GODOT">Godot</option>
                          <option value="CUSTOM">Custom Engine</option>
                        </select>
                        {form.formState.errors.engine && (
                          <p className="text-sm text-red-500 mt-1">{String(form.formState.errors.engine.message)}</p>
                        )}
                      </div>

                      {/* Press Kit Generator */}
                      <div>
                        <Label className="text-sm font-medium">Press Kit Generator</Label>
                        <p className="text-sm text-muted-foreground mt-1 mb-3">Generate a downloadable press kit for media and influencers</p>
                        <PressKitModal
                          onGenerate={async (data) => {
                            try {
                              const response = await fetch('/api/presskit/generate', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                  gameId: 'temp', // Will be updated when product is created
                                  ...data
                                })
                              })
                              
                              const result = await response.json()
                              
                              if (result.success) {
                                // Save press kit data to form
                                form.setValue('pressKit', data)
                                toast.success('Press kit generated successfully!')
                                
                                // Download the zip file
                                if (result.pressKit.zipUrl) {
                                  const link = document.createElement('a')
                                  link.href = result.pressKit.zipUrl
                                  link.download = `press-kit-${Date.now()}.zip`
                                  document.body.appendChild(link)
                                  link.click()
                                  document.body.removeChild(link)
                                }
                              } else {
                                toast.error(result.error || 'Failed to generate press kit')
                              }
                            } catch (error) {
                              console.error('Error generating press kit:', error)
                              toast.error('Failed to generate press kit')
                            }
                          }}
                        />
                      </div>

                      {/* Validation Summary */}
                      <div className="bg-[#FEF3C7] text-[#D97706] text-sm rounded-lg p-3 space-y-1">
                        {!form.watch('launchType') && <div>• Launch type is required</div>}
                        {!form.watch('launchDate') && <div>• Launch date is required</div>}
                        {form.watch('launchType') === 'SOFT_LAUNCH' && (!form.watch('softLaunchCountries') || form.watch('softLaunchCountries').length === 0) && <div>• Soft launch countries are required</div>}
                        {!form.watch('monetization') && <div>• Monetization model is required</div>}
                        {!form.watch('engine') && <div>• Engine used is required</div>}
                      </div>
                    </div>
                  )}
                  {step===5 && (
                    <div className="space-y-8">
                      {/* Pricing / Promo Codes */}
                      <div>
                        <h3 className="text-lg font-semibold">Pricing & Promo Codes</h3>
                        <p className="text-sm text-muted-foreground mb-4">Configure pricing and promotional offers for the community.</p>
                        
                        {/* Pricing */}
                        <div className="mb-6">
                          <Label className="text-sm font-medium">Pricing Model</Label>
                          <div className="space-y-3 mt-3">
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input 
                                type="radio" 
                                name="pricing" 
                                value="FREE"
                                onChange={() => form.setValue('pricing', 'FREE')}
                                className="mt-1"
                              />
                              <div>
                                <span className="font-medium">Free</span>
                                <div className="text-sm text-muted-foreground">This game is completely free to play</div>
                              </div>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input 
                                type="radio" 
                                name="pricing" 
                                value="PAID"
                                onChange={() => form.setValue('pricing', 'PAID')}
                                className="mt-1"
                              />
                              <div>
                                <span className="font-medium">Paid</span>
                                <div className="text-sm text-muted-foreground">One-time purchase required</div>
                              </div>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input 
                                type="radio" 
                                name="pricing" 
                                value="FREEMIUM"
                                onChange={() => form.setValue('pricing', 'FREEMIUM')}
                                className="mt-1"
                              />
                              <div>
                                <span className="font-medium">Freemium</span>
                                <div className="text-sm text-muted-foreground">Free with optional purchases</div>
                              </div>
                            </label>
                          </div>
                        </div>

                        {/* Promo Codes */}
                        <div>
                          <Label className="text-sm font-medium">Promotional Offer (Optional)</Label>
                          <p className="text-sm text-muted-foreground mb-3">Offer a special deal for the community</p>
                          <div className="grid md:grid-cols-3 gap-4">
                            <div>
                              <Label htmlFor="promoOffer" className="text-sm font-medium">Offer Description</Label>
                              <Input
                                id="promoOffer"
                                placeholder="e.g., 50% off for first week"
                                {...form.register('promoOffer')}
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <Label htmlFor="promoCode" className="text-sm font-medium">Promo Code</Label>
                              <Input
                                id="promoCode"
                                placeholder="e.g., HUNT2024"
                                {...form.register('promoCode')}
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <Label htmlFor="promoExpiry" className="text-sm font-medium">Expiry Date</Label>
                              <Input
                                id="promoExpiry"
                                type="date"
                                {...form.register('promoExpiry')}
                                className="mt-1"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Playtest Key Slots */}
                      <div>
                        <h3 className="text-lg font-semibold">Playtest Key Slots</h3>
                        <p className="text-sm text-muted-foreground mb-4">Offer playtest keys to the community for early feedback.</p>
                        
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="playtestQuota" className="text-sm font-medium">Number of Keys</Label>
                            <Input
                              id="playtestQuota"
                              type="number"
                              min="1"
                              max="1000"
                              placeholder="e.g., 50"
                              {...form.register('playtestQuota', { valueAsNumber: true })}
                              className="mt-1"
                            />
                            <p className="text-xs text-muted-foreground mt-1">Maximum 1000 keys</p>
                          </div>
                          <div>
                            <Label htmlFor="playtestExpiry" className="text-sm font-medium">Expiry Date</Label>
                            <Input
                              id="playtestExpiry"
                              type="date"
                              {...form.register('playtestExpiry')}
                              className="mt-1"
                            />
                            <p className="text-xs text-muted-foreground mt-1">When keys expire</p>
                          </div>
                        </div>
                      </div>

                      {/* Sponsor Slot Request */}
                      <div>
                        <h3 className="text-lg font-semibold">Sponsor Slot Request</h3>
                        <p className="text-sm text-muted-foreground mb-4">Request a sponsored slot for increased visibility.</p>
                        
                        <div className="space-y-4">
                          <label className="flex items-start gap-3 cursor-pointer">
                            <input 
                              type="checkbox" 
                              {...form.register('sponsorRequest')}
                              className="mt-1"
                            />
                            <div>
                              <span className="font-medium">Request sponsored slot</span>
                              <div className="text-sm text-muted-foreground">Get featured placement for better visibility</div>
                            </div>
                          </label>
                          
                          {form.watch('sponsorRequest') && (
                            <div>
                              <Label htmlFor="sponsorNote" className="text-sm font-medium">Additional Notes</Label>
                              <Textarea
                                id="sponsorNote"
                                placeholder="Tell us why your game deserves a sponsored slot..."
                                rows={3}
                                {...form.register('sponsorNote')}
                                className="mt-1"
                              />
                              <p className="text-xs text-muted-foreground mt-1">
                                {(form.watch('sponsorNote') || '').length}/500 characters
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Crowdfunding Pledge */}
                      <div>
                        <h3 className="text-lg font-semibold">Crowdfunding Pledge</h3>
                        <p className="text-sm text-muted-foreground mb-4">Enable community support through pledges.</p>
                        
                        <label className="flex items-start gap-3 cursor-pointer">
                          <input 
                            type="checkbox" 
                            {...form.register('crowdfundingPledge')}
                            className="mt-1"
                          />
                          <div>
                            <span className="font-medium">Enable crowdfunding pledges</span>
                            <div className="text-sm text-muted-foreground">Allow community members to support your game development</div>
                          </div>
                        </label>
                      </div>

                      {/* Gamification Tags */}
                      <div>
                        <h3 className="text-lg font-semibold">Gamification Tags</h3>
                        <p className="text-sm text-muted-foreground mb-4">Select tags that describe your game's gamification features.</p>
                        
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                          {GAMIFICATION_TAGS.map((tag) => (
                            <label key={tag.id} className="flex items-center gap-2 cursor-pointer p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                              <input 
                                type="checkbox" 
                                value={tag.id}
                                onChange={(e) => {
                                  const currentTags = form.watch('gamificationTags') || []
                                  if (e.target.checked) {
                                    if (currentTags.length < 5) {
                                      form.setValue('gamificationTags', [...currentTags, tag.id])
                                    } else {
                                      toast.error('Maximum 5 tags allowed')
                                      e.target.checked = false
                                    }
                                  } else {
                                    form.setValue('gamificationTags', currentTags.filter(t => t !== tag.id))
                                  }
                                }}
                                checked={(form.watch('gamificationTags') || []).includes(tag.id)}
                              />
                              <span className="text-lg">{tag.icon}</span>
                              <span className="text-sm font-medium">{tag.label}</span>
                            </label>
                          ))}
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          Selected: {(form.watch('gamificationTags') || []).length}/5 tags
                        </p>
                      </div>

                      {/* Validation Summary */}
                      <div className="bg-[#FEF3C7] text-[#D97706] text-sm rounded-lg p-3 space-y-1">
                        {form.watch('playtestQuota') && form.watch('playtestQuota') > 1000 && <div>• Playtest quota cannot exceed 1000</div>}
                        {form.watch('sponsorNote') && (form.watch('sponsorNote') || '').length > 500 && <div>• Sponsor note must be 500 characters or less</div>}
                        {form.watch('gamificationTags') && (form.watch('gamificationTags') || []).length > 5 && <div>• Maximum 5 gamification tags allowed</div>}
                      </div>
                    </div>
                  )}
                  {step===6 && (
                    <div className="space-y-8">
                      {/* Required Fields Completion Check */}
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold">Required Fields</h3>
                          <span className="text-sm text-muted-foreground">{completionPercentage}% Complete</span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-4">Check that you've completed all of the required information.</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {Object.entries(checklistValidation).map(([field, isValid]) => (
                            <div key={field} className="flex items-center gap-3 p-3 rounded-lg border bg-card">
                              {isValid ? (
                                <Check className="w-5 h-5 text-green-500" />
                              ) : (
                                <XIcon className="w-5 h-5 text-red-500" />
                              )}
                              <span className="text-sm font-medium capitalize">
                                {field === 'url' ? 'Primary URL' : 
                                 field === 'launchType' ? 'Launch Type' :
                                 field === 'launchDate' ? 'Launch Date' :
                                 field}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Game Preview */}
                      <div>
                        <h3 className="text-lg font-semibold mb-4">Preview</h3>
                        <div className="max-w-md">
                          <GamePreviewCard
                            title={form.watch('title') || 'Game Title'}
                            tagline={form.watch('tagline') || 'Game tagline will appear here'}
                            description={form.watch('description') || 'Game description will appear here'}
                            thumbnail={form.watch('thumbnail') || ''}
                            platforms={form.watch('platforms') || []}
                            launchType={form.watch('launchType') || 'GLOBAL_LAUNCH'}
                            categories={form.watch('categories') || []}
                          />
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="space-y-4">
                        <div className="flex flex-col sm:flex-row gap-3">
                          <Button
                            variant="outline"
                            onClick={handleSaveDraft}
                            disabled={isSubmitting}
                            className="flex-1"
                          >
                            {isSubmitting ? (
                              <>
                                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                                Saving...
                              </>
                            ) : (
                              'Save as Draft'
                            )}
                          </Button>
                          
                          <ScheduleLaunchModal
                            onSchedule={handleScheduleLaunch}
                            isLoading={isSubmitting}
                          />
                        </div>

                        <Button
                          onClick={handleSubmitApproval}
                          disabled={isSubmitting || completionPercentage < 100}
                          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 rounded-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-xl"
                        >
                          {isSubmitting ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                              Submitting...
                            </>
                          ) : (
                            'Submit for Approval'
                          )}
                        </Button>

                        {completionPercentage < 100 && (
                          <p className="text-sm text-amber-600 text-center">
                            Complete all required fields to submit for approval
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                  <div className="flex items-center justify-between pt-2">
                    <Button type="button" variant="outline" onClick={prev} disabled={step===1}>Back</Button>
                    {step<6 ? (
                      <Button 
                        type="button" 
                        onClick={next} 
                        disabled={
                          (step===1 && !canNextFromStep1) || 
                          (step===2 && !canNextFromStep2) || 
                          (step===3 && !canNextFromStep3)
                        }
                      >
                        Next step: {
                          step===1 ? 'Images and media' : 
                          step===2 ? 'Makers' : 
                          step===3 ? 'Launch Details' : 
                          step===4 ? 'Community & Extras' : 
                          'Launch checklist'
                        }
                      </Button>
                    ) : (
                      <Button type="submit">Final Submit</Button>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}
