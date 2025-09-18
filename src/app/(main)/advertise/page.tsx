'use client';

import { useMemo, useState, useEffect } from 'react';
import { useForm, type SubmitHandler, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Megaphone, Target, DollarSign, Users, Image as ImageIcon, CheckCircle, PackageIcon } from 'lucide-react';
import SplitText from './SplitText'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

const wizardSchema = z.object({
  // Step 1
  advertisingGoal: z.enum(['brand-awareness', 'game-launch', 'community-growth']),
  // Step 2
  dailyBudget: z.string().min(1, 'Required'),
  totalBudget: z.string().min(1, 'Required'),
  duration: z.string().min(1, 'Required'),
  // Step 2 (Promotion Focus) – moved earlier
  promotionFocus: z.array(z.string()).min(1, 'Please select at least one promotion focus option.'),
  // Step 3 (Budget & Duration)
  durationType: z.enum(['daily','weekly','monthly']),
  totalPrice: z.number().nonnegative().default(0),
  // Step 4
  gameId: z.string().optional(),
  campaignTagline: z.string().max(150, 'Max 150 characters').optional(),
  creativeUrl: z.string().url('Must be a valid URL').optional(),
  // Step 5 (contact/notes optional)
  contactEmail: z.string().email().optional(),
  notes: z.string().optional(),
});

type WizardData = z.infer<typeof wizardSchema>;

export default function AdvertisePage() {
  const { data: session } = useSession()
  const fullName = session?.user?.name || 'Creator'
  const router = useRouter()
  const [showOutro, setShowOutro] = useState(false)
  const [cardExiting, setCardExiting] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5;
  const [introDone, setIntroDone] = useState(false)
  const [isIntroFading, setIsIntroFading] = useState(false)
  const [showCard, setShowCard] = useState(false)
  const [introKey, setIntroKey] = useState(() => Date.now())
  const handleAnimationComplete = () => {
    setIsIntroFading(true)
    setTimeout(() => {
      setIntroDone(true)
      setShowCard(true)
    }, 800)
  }
  // Always reset on mount (hard reload)
  useEffect(() => {
    setIntroDone(false)
    setIsIntroFading(false)
    setShowCard(false)
    setIntroKey(Date.now())
  }, [])
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    getValues,
  } = useForm<WizardData>({
    resolver: zodResolver(wizardSchema) as unknown as Resolver<WizardData>,
    defaultValues: {
      advertisingGoal: 'brand-awareness',
    },
    mode: 'onChange',
  });

  const values = watch();
  const packagePrices = {
    daily: 10,
    weekly: 50,
    monthly: 150,
  } as const
  const computedTotal = useMemo(() => {
    const base = packagePrices[values.durationType || 'daily'] || 10
    // simple multiplier for multiple promotions
    const multiplier = (values.promotionFocus?.length || 1)
    return base * multiplier
  }, [values.durationType, values.promotionFocus])

  // Autocomplete state for Step 4
  type GameSuggestion = { id: string; title: string; slug?: string; platforms?: string[] }
  const [gameQuery, setGameQuery] = useState('')
  const [suggestions, setSuggestions] = useState<GameSuggestion[]>([])
  const [selectedGame, setSelectedGame] = useState<GameSuggestion | null>(null)
  const [isSearching, setIsSearching] = useState(false)

  const isFormComplete = !!(
    values.advertisingGoal &&
    values.durationType &&
    Array.isArray(values.promotionFocus) && values.promotionFocus.length > 0 &&
    values.gameId &&
    (selectedGame?.title || '').length > 0
  )

  useEffect(() => {
    const controller = new AbortController()
    const q = gameQuery.trim()
    // If a game is already selected, do not search again until user edits input
    if (selectedGame) {
      setIsSearching(false)
      setSuggestions([])
      return () => { controller.abort() }
    }
    if (q.length < 2) {
      setSuggestions([])
      setIsSearching(false)
      return
    }
    setIsSearching(true)
    const timeout = setTimeout(async () => {
      try {
        const res = await fetch(`/api/games/search?q=${encodeURIComponent(q)}`, { signal: controller.signal })
        if (!res.ok) throw new Error('search failed')
        const data = await res.json()
        setSuggestions(Array.isArray(data) ? data : [])
      } catch (_err) {
        if (!(controller.signal as any).aborted) setSuggestions([])
      } finally {
        setIsSearching(false)
      }
    }, 300)
    return () => { controller.abort(); clearTimeout(timeout) }
  }, [gameQuery])
  const progress = useMemo(() => Math.round((currentStep / totalSteps) * 100), [currentStep]);
  const strategySuggestion = useMemo(() => {
    if (values.advertisingGoal === 'brand-awareness') {
      return 'Your game will be featured on the homepage and highlighted in our newsletter for maximum visibility.'
    }
    if (values.advertisingGoal === 'game-launch') {
      return 'Promoted on the launch calendar and trending section for 7 days to boost initial momentum.'
    }
    return 'Boosted via community posts and social media snippets to grow and engage your player base.'
  }, [values.advertisingGoal])

  const next = () => {
    if (currentStep === 1 && !values.advertisingGoal) return;
    if (currentStep === 2) {
      // Step 2 is Promotion Focus now
      if (!values.promotionFocus || values.promotionFocus.length === 0) return;
    }
    if (currentStep === 3) {
      // Step 3 is Budget & Duration now
      if (!values.durationType) return;
    }
    if (currentStep === 4) {
      if (!values.gameId) return;
    }
    setCurrentStep((s) => Math.min(totalSteps, s + 1));
  };
  const back = () => setCurrentStep((s) => Math.max(1, s - 1));

  const onSubmit: SubmitHandler<WizardData> = async (data) => {
    setLoading(true)
    setError(null)
    try {
      const payload = {
        goal: data.advertisingGoal,
        package: data.durationType,
        promotions: data.promotionFocus,
        gameId: data.gameId,
        gameName: selectedGame?.title || '',
        notes: data.notes,
      }

      if (!payload.goal || !payload.package || !Array.isArray(payload.promotions) || payload.promotions.length === 0 || !payload.gameId || !payload.gameName) {
        toast.error('Please complete all required fields.')
        setLoading(false)
        return
      }

      const res = await fetch('/api/ad-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      console.log('[Advertise] /api/ad-requests payload', payload)
      console.log('[Advertise] /api/ad-requests status', res.status)

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}))
        const msg = errJson?.error || 'Failed to submit request'
        toast.error(msg)
        setError(msg)
        return
      }

      const json = await res.json()
      if (!json?.ok) {
        const msg = json?.error || 'Failed to submit request'
        toast.error(msg)
        setError(msg)
        return
      }

      toast.success('Campaign request received!')
      setCardExiting(true)
      setTimeout(() => {
        setSuccess(true)
      }, 400)
      setTimeout(() => {
        router.push('/editorial-dashboard')
      }, 2500)
    } catch (e: any) {
      console.error('[Advertise] Submit error', e)
      const msg = e?.message || 'Something went wrong'
      toast.error(msg)
      setError(msg)
    } finally {
      setLoading(false)
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-[#121225] to-[#050509] bg-[radial-gradient(80%_80%_at_0%_0%,rgba(124,58,237,0.22),transparent_60%),radial-gradient(80%_80%_at_100%_100%,rgba(6,182,212,0.18),transparent_60%)]">
      <div className="container mx-auto px-4 py-24">
        {!introDone ? (
          <div className={`flex items-center justify-center mb-16 min-h-[30vh] transition-opacity duration-700 ${isIntroFading ? 'opacity-0' : 'opacity-100'}`}>
            <SplitText
              key={introKey}
              text={`Welcome ${fullName}, let’s get your game noticed`}
              className="text-4xl md:text-5xl font-bold text-center text-white drop-shadow-[0_0_20px_rgba(139,92,246,0.65)]"
              delay={100}
              duration={0.4}
              ease="power3.out"
              splitType="chars"
              from={{ opacity: 0, y: 40 }}
              to={{ opacity: 1, y: 0 }}
              threshold={0.1}
              rootMargin="-100px"
              textAlign="center"
              onLetterAnimationComplete={handleAnimationComplete}
            />
            {/* Optional highlight for name if available later: wrap that token in gradient text */}
        </div>
        ) : null}

        {/* Glassmorphism Card */}
        {showCard && (
        <Card className={`max-w-2xl mx-auto bg-white/10 backdrop-blur-lg border border-white/20 shadow-xl rounded-2xl ${cardExiting ? 'animate-fadeOutDown' : 'animate-fade-in'}`}>
          <CardContent className="p-8">
            {/* Progress */}
            <div className="mb-6">
              <div className="flex items-center justify-between text-sm text-gray-300 mb-2">
                <span>Step {currentStep}/{totalSteps}</span>
                <span>{progress}%</span>
                  </div>
              <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                <div className="h-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full" style={{ width: `${progress}%` }} />
                      </div>
                    </div>
                    
            {/* Steps */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {currentStep === 1 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-white"><Target className="w-5 h-5 text-purple-400" /> Advertising Goal</div>
                  <div className="grid grid-cols-1 gap-3">
                    <button type="button" onClick={() => setValue('advertisingGoal', 'brand-awareness')} className={`text-left p-4 rounded-xl border transition-all ${values.advertisingGoal === 'brand-awareness' ? 'ring-2 ring-purple-500 shadow-purple-500/50 bg-white/10' : 'hover:bg-white/10'} border-white/20`}>
                      <div className="text-white font-semibold">Brand Awareness</div>
                      <div className="text-gray-300 text-sm">Reach more players and build recognition</div>
                    </button>
                    <button type="button" onClick={() => setValue('advertisingGoal', 'game-launch')} className={`text-left p-4 rounded-xl border transition-all ${values.advertisingGoal === 'game-launch' ? 'ring-2 ring-purple-500 shadow-purple-500/50 bg-white/10' : 'hover:bg-white/10'} border-white/20`}>
                      <div className="text-white font-semibold">Game Launch</div>
                      <div className="text-gray-300 text-sm">Promote an upcoming release</div>
                    </button>
                    <button type="button" onClick={() => setValue('advertisingGoal', 'community-growth')} className={`text-left p-4 rounded-xl border transition-all ${values.advertisingGoal === 'community-growth' ? 'ring-2 ring-purple-500 shadow-purple-500/50 bg-white/10' : 'hover:bg-white/10'} border-white/20`}>
                      <div className="text-white font-semibold">Community Growth</div>
                      <div className="text-gray-300 text-sm">Grow and engage your community</div>
                    </button>
                      </div>
                    </div>
              )}

              {currentStep === 2 && (
                // Promotion Focus (moved to Step 2)
                <div className="space-y-4">
                  <div className="text-white font-semibold text-lg">Promotion Focus</div>
                  <div className="bg-white/5 backdrop-blur-lg border border-white/20 rounded-xl p-6">
                    <div className="grid grid-cols-1 gap-3">
                      {[
                        { key: 'featured', title: 'Featured Game Section 🔥', desc: 'Get featured on the landing page slider.' },
                        { key: 'editors-choice', title: 'Editor’s Choice Badge 🌟', desc: 'Showcase your game with a special badge.' },
                        { key: 'newsletter', title: 'Newsletter Highlight 📰', desc: 'Appear in our weekly newsletter.' },
                        { key: 'social', title: 'Social Media Blast 📱', desc: 'We promote your game on our social channels.' },
                      ].map(opt => {
                        const selected = Array.isArray(values.promotionFocus) && values.promotionFocus.includes(opt.key)
                        return (
                          <button
                            key={opt.key}
                            type="button"
                            onClick={() => {
                              const current = Array.isArray(values.promotionFocus) ? values.promotionFocus : []
                              if (current.includes(opt.key)) {
                                setValue('promotionFocus', current.filter((k: string) => k !== opt.key))
                              } else {
                                setValue('promotionFocus', [...current, opt.key])
                              }
                            }}
                            className={`text-left hover:bg-white/10 transition-all rounded-lg p-4 cursor-pointer border ${selected ? 'border-transparent bg-gradient-to-r from-purple-600/20 to-blue-600/20 ring-2 ring-purple-500' : 'border-white/10'}`}
                          >
                            <div className="text-white font-medium">{opt.title}</div>
                            <div className="text-gray-300 text-sm">{opt.desc}</div>
                          </button>
                        )
                      })}
                      {errors.promotionFocus && (
                        <p className="text-red-400 text-sm">
                          {errors.promotionFocus.message as string}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                      <div className="space-y-4">
                  <div className="flex items-center gap-2 text-white"><PackageIcon className="w-5 h-5 text-purple-400" /> Package & Duration</div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {([
                      { key: 'daily', title: 'Daily', desc: 'Cheapest', price: 10 },
                      { key: 'weekly', title: 'Weekly', desc: 'Most balanced', price: 50 },
                      { key: 'monthly', title: 'Monthly', desc: 'Premium visibility', price: 150 },
                    ] as const).map(p => (
                      <button
                        key={p.key}
                        type="button"
                        onClick={() => setValue('durationType', p.key)}
                        className={`text-left p-4 rounded-xl border transition-all hover:bg-white/10 ${values.durationType === p.key ? 'ring-2 ring-purple-500 shadow-purple-500/50 bg-white/10' : ''} border-white/20`}
                      >
                        <div className="text-white font-semibold">{p.title}</div>
                        <div className="text-gray-300 text-sm">{p.desc}</div>
                        <div className="text-purple-300 mt-2">${p.price}</div>
                      </button>
                    ))}
                        </div>
                  <div className="text-right text-white font-semibold">Estimated Total: ${computedTotal}</div>
                </div>
              )}

              {currentStep === 3 && (
                  <div className="space-y-4">
                  <div className="text-white font-semibold text-lg">Promotion Focus</div>
                  <div className="bg-white/5 backdrop-blur-lg border border-white/20 rounded-xl p-6">
                    <div className="grid grid-cols-1 gap-3">
                      {[
                        { key: 'featured', title: 'Featured Game Section 🔥', desc: 'Get featured on the landing page slider.' },
                        { key: 'editors-choice', title: 'Editor’s Choice Badge 🌟', desc: 'Showcase your game with a special badge.' },
                        { key: 'newsletter', title: 'Newsletter Highlight 📰', desc: 'Appear in our weekly newsletter.' },
                        { key: 'social', title: 'Social Media Blast 📱', desc: 'We promote your game on our social channels.' },
                      ].map(opt => {
                        const selected = Array.isArray(values.promotionFocus) && values.promotionFocus.includes(opt.key)
                        return (
                          <button
                            key={opt.key}
                            type="button"
                            onClick={() => {
                              const current = Array.isArray(values.promotionFocus) ? values.promotionFocus : []
                              if (current.includes(opt.key)) {
                                setValue('promotionFocus', current.filter((k: string) => k !== opt.key))
                              } else {
                                setValue('promotionFocus', [...current, opt.key])
                              }
                            }}
                            className={`text-left hover:bg-white/10 transition-all rounded-lg p-4 cursor-pointer border ${selected ? 'border-transparent bg-gradient-to-r from-purple-600/20 to-blue-600/20 ring-2 ring-purple-500' : 'border-white/10'}`}
                          >
                            <div className="text-white font-medium">{opt.title}</div>
                            <div className="text-gray-300 text-sm">{opt.desc}</div>
                          </button>
                        )
                      })}
                      {errors.promotionFocus && (
                        <p className="text-red-400 text-sm">
                          {errors.promotionFocus.message as string}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 4 && (
                  <div className="space-y-4">
                  <div className="flex items-center gap-2 text-white"><ImageIcon className="w-5 h-5 text-purple-400" /> Campaign Details</div>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="mb-4 relative">
                      <label htmlFor="game" className="block text-sm font-medium text-gray-200 mb-2">
                        Select Game
                      </label>
                      <input
                        id="game"
                        type="text"
                        value={selectedGame ? selectedGame.title : gameQuery}
                        onChange={(e) => {
                          const v = e.target.value
                          // If user edits, clear selection and resume search
                          if (selectedGame && v !== selectedGame.title) {
                            setSelectedGame(null)
                          }
                          setGameQuery(v)
                        }}
                        placeholder="Start typing to search your games..."
                        className="w-full rounded-md bg-gray-900/70 backdrop-blur-sm border border-gray-700 px-3 py-2 text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 mt-2"
                        autoComplete="off"
                      />
                      {!selectedGame && gameQuery.length >= 2 && (
                        <div className="absolute z-20 left-0 right-0 bg-gray-900/95 border border-gray-700 rounded-md mt-1 shadow-lg max-h-64 overflow-auto">
                          {isSearching ? (
                            <div className="px-3 py-2 text-gray-400">Searching…</div>
                          ) : suggestions.length === 0 && !selectedGame ? (
                            <div className="px-3 py-2 text-gray-400">No games found</div>
                          ) : (
                            suggestions.map((g) => (
                              <button
                                key={g.id}
                                type="button"
                                className="block w-full text-left px-3 py-2 text-gray-100 hover:bg-gray-800"
                                onClick={() => {
                                  setSelectedGame(g);
                                  setValue('gameId', g.id, { shouldValidate: true });
                                  setGameQuery(g.title);
                                  setSuggestions([]);
                                }}
                              >
                                <div className="flex items-center gap-2">
                                  { (g as any).thumbnail ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={(g as any).thumbnail} alt={g.title} className="w-8 h-8 rounded object-cover" />
                                  ) : (
                                    <div className="w-8 h-8 rounded bg-gray-700 flex items-center justify-center text-xs">🎮</div>
                                  )}
                                  <div>
                                    <div className="font-medium">{g.title}</div>
                                    <div className="text-xs text-gray-400">{(g as any).platform || ((g as any).platforms?.join(', ')) || '—'}</div>
                      </div>
                    </div>
                              </button>
                            ))
                        )}
                      </div>
                      )}
                    </div>
                  </div>
                    </div>
              )}

              {currentStep === 5 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-white"><CheckCircle className="w-5 h-5 text-purple-400" /> Summary & Confirm</div>
                  <div className="rounded-xl border border-white/20 bg-white/5 p-4 text-gray-200 space-y-2">
                    <div>
                      <span className="text-white">Goal:</span> {(() => {
                        const map: Record<string,string> = {
                          'brand-awareness': 'Brand Awareness',
                          'game-launch': 'Game Launch',
                          'community-growth': 'Community Growth',
                        }
                        return map[values.advertisingGoal as string] || values.advertisingGoal
                      })()}
                    </div>
                    <div>
                      <span className="text-white">Package:</span> {(() => {
                        const map: Record<string,string> = { monthly: 'Monthly', weekly: 'Weekly', daily: 'Daily' }
                        return map[values.durationType as string] || values.durationType
                      })()} • <span className="text-white">Estimated Total:</span> ${computedTotal}
                    </div>
                    <div>
                      <span className="text-white">Promotions:</span> {(() => {
                        const map: Record<string,string> = {
                          featured: 'Featured Games',
                          'editors-choice': 'Editor’s Choice',
                          'editor-choice': 'Editor’s Choice',
                          newsletter: 'Newsletter Highlight',
                          social: 'Social Media Blast',
                        }
                        return (values.promotionFocus || []).map((k) => map[k] || k).join(', ')
                      })()}
                    </div>
                    <div>
                      <span className="text-white">Game:</span> {selectedGame?.title || '-'}
                    </div>
                  </div>
                  <div className="rounded-xl p-4 bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-500/30 text-purple-100 shadow-[0_0_20px_rgba(168,85,247,0.3)]">
                    <div className="text-sm uppercase tracking-wide text-purple-300 mb-1">Recommended Strategy</div>
                    <div className="text-base">{strategySuggestion}</div>
                    </div>
                    <div>
                      <Label htmlFor="notes" className="text-white">Additional Notes</Label>
                    <Textarea id="notes" rows={3} className="bg-white/10 border-white/20 text-white mt-2" placeholder="Anything else we should know?" {...register('notes')} />
                    </div>
                  <div>
                    <Label htmlFor="contactEmail" className="text-white">Contact Email (optional)</Label>
                    <Input id="contactEmail" placeholder="you@company.com" className="bg-white/10 border-white/20 text-white mt-2" {...register('contactEmail')} />
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div className="flex items-center justify-between pt-2">
                <Button type="button" onClick={back} disabled={currentStep === 1} className="bg-white/10 text-white hover:bg-white/20 px-6 py-2 rounded-lg hover:scale-105 transition-all">Back</Button>
                {currentStep < totalSteps ? (
                  <Button type="button" onClick={next} className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-2 rounded-lg hover:scale-105 transition-all">Next</Button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      console.log('[Advertise] Button clicked at Step', currentStep)
                      // Use current form values for clarity when debugging
                      const snapshot = getValues()
                      console.log('[Advertise] Form snapshot', snapshot)
                      if (!isFormComplete) {
                        console.warn('[Advertise] Form incomplete, launch disabled')
                        return
                      }
                      handleSubmit(onSubmit)()
                    }}
                    disabled={!isFormComplete || loading}
                    className={`
    relative inline-flex items-center justify-center
    rounded-lg px-6 py-2.5
    text-base font-semibold tracking-wide
    text-white
    bg-black/40 backdrop-blur-md
    border border-purple-500/60
    shadow-[0_0_16px_rgba(168,85,247,0.45),0_0_32px_rgba(59,130,246,0.25)]
    hover:bg-black/50
    hover:shadow-[0_0_22px_rgba(168,85,247,0.75),0_0_44px_rgba(59,130,246,0.45)]
    ring-1 ring-purple-500/30 hover:ring-2 hover:ring-purple-400/60
    transition-all duration-300
    disabled:opacity-50 disabled:cursor-not-allowed disabled:ring-0 disabled:shadow-none
  `}
                  >
                    {loading ? 'Launching...' : 'Launch Campaign'}
                  </button>
                )}
                {error && <p className="mt-2 text-red-400 text-sm">{error}</p>}
            </div>
            </form>
          </CardContent>
        </Card>
        )}

        {(showOutro || success) && (
          <div className="flex items-center justify-center min-h-[30vh] py-20">
            <SplitText
              text={`Your request has been received. We'll contact you via email soon.`}
              className="text-4xl md:text-5xl font-bold text-center bg-gradient-to-r from-green-400 via-teal-400 to-blue-400 bg-clip-text text-transparent drop-shadow-xl"
              delay={60}
              duration={0.5}
              splitType="chars"
              from={{ opacity: 0, y: 30 }}
              to={{ opacity: 1, y: 0 }}
              textAlign="center"
            />
          </div>
        )}
      </div>
    </div>
  );
}