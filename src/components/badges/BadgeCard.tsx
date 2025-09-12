"use client"

import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Lock, ShieldCheck } from "lucide-react"

type Props = {
  title: string
  emoji: string
  description: string
  progress: { current:number; threshold:number; pct:number }
  xp: number
  locked: boolean
  claimable: boolean
  badgeCode: string
  onClaim?: (badgeCode:string)=>void
}

export function BadgeCard({ title, emoji, description, progress, xp, locked, claimable, badgeCode, onClaim }: Props) {
  return (
    <Card className="relative w-full min-h-[280px] md:min-h-[320px] overflow-hidden rounded-2xl bg-gradient-to-b from-[#1a1026] to-[#0b0b12] border border-white/5 shadow-[0_0_40px_-20px_rgba(155,135,245,0.55)] transition hover:shadow-[0_0_40px_-12px_rgba(155,135,245,0.75)]">
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,_rgba(120,90,250,0.08),_transparent_40%)]" />

      <div className="flex h-full flex-col justify-between p-5 relative z-10">
        {/* Top */}
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <span className="text-3xl md:text-4xl">{emoji}</span>
            {locked ? (
              <Lock className="h-5 w-5 text-white/40" />
            ) : (
              <ShieldCheck className="h-5 w-5 text-emerald-400" />
            )}
          </div>
          <div>
            <h3 className="text-white text-lg md:text-xl font-semibold">{title}</h3>
            <p className="text-white/60 text-sm md:text-[13px]">{description}</p>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-6">
          <Progress value={progress.pct} className="h-2 bg-white/10" />
          <div className="mt-2 flex items-center justify-between text-[12px] text-white/60">
            <span>{progress.current}/{progress.threshold}</span>
            <span>{Math.round(progress.pct)}%</span>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div className="rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 text-violet-200 text-xs">
              +{xp} XP
            </div>
            {claimable && (
              <button
                onClick={() => onClaim?.(badgeCode)}
                className="rounded-lg bg-violet-600 text-white px-3 py-1 text-xs hover:bg-violet-700"
              >
                Claim
              </button>
            )}
          </div>
        </div>
      </div>
    </Card>
  )
}
