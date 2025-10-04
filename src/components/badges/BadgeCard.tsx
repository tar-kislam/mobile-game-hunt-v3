"use client"

import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Lock, ShieldCheck, Check, Trophy } from "lucide-react"
import { getBadgeIconPath } from "@/lib/badgeIconMapper"

type Props = {
  title: string
  emoji: string
  description: string
  progress: { current:number; threshold:number; pct:number }
  xp: number
  locked: boolean
  claimable: boolean
  badgeCode: string
  isCompleted?: boolean
  onClaim?: (badgeCode:string)=>void
}

export function BadgeCard({ title, emoji, description, progress, xp, locked, claimable, badgeCode, isCompleted = false, onClaim }: Props) {
  const isCompletedBadge = isCompleted || (!locked && progress.pct >= 100)
  
  return (
    <Card className={`relative w-full min-h-[280px] md:min-h-[320px] overflow-hidden rounded-[20px] transition-all duration-300 hover:scale-[1.02] ${
      isCompletedBadge 
        ? 'bg-gradient-to-br from-[#1a1a1a]/70 to-[#2c2c2c]/70 backdrop-blur-[10px] border border-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_0_40px_-12px_rgba(147,51,234,0.3)] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_0_50px_-8px_rgba(147,51,234,0.5),0_0_30px_rgba(255,215,0,0.4)] hover:border-purple-400/30' 
        : 'bg-gradient-to-b from-[#1a1026] to-[#0b0b12] border border-white/5 shadow-[0_0_40px_-20px_rgba(155,135,245,0.55)] hover:shadow-[0_0_40px_-12px_rgba(155,135,245,0.75)]'
    }`}>
      {/* Golden shine animation for completed badges */}
      {isCompletedBadge && (
        <div className="absolute inset-0 pointer-events-none badge-shine opacity-0 hover:opacity-100 transition-opacity duration-500" 
             style={{
               background: 'linear-gradient(45deg, transparent 30%, rgba(255,215,0,0.3) 50%, transparent 70%)',
               width: '100%',
               height: '100%'
             }} />
      )}
      
      <div className={`absolute inset-0 pointer-events-none ${
        isCompletedBadge 
          ? 'bg-[radial-gradient(ellipse_at_top,_rgba(147,51,234,0.15),_transparent_40%)]' 
          : 'bg-[radial-gradient(ellipse_at_top,_rgba(120,90,250,0.08),_transparent_40%)]'
      }`} />

      <div className="flex h-full flex-col justify-between p-5 relative z-10">
        {/* Top */}
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <div className={`w-12 h-12 md:w-16 md:h-16 transition-transform duration-300 drop-shadow-[0_0_8px_rgba(255,215,0,0.6),0_2px_4px_rgba(0,0,0,0.3)] ${
              isCompletedBadge ? 'scale-110' : ''
            }`}>
              <img
                src={badgeCode ? getBadgeIconPath(badgeCode) : '/badges/default.svg'}
                alt={title}
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.currentTarget.src = '/badges/default.svg'
                }}
              />
            </div>
            {locked ? (
              <Lock className="h-5 w-5 text-white/40" />
            ) : isCompletedBadge ? (
              <Check className="h-5 w-5 text-[#FFD700] drop-shadow-[0_0_4px_rgba(255,215,0,0.8)]" />
            ) : (
              <ShieldCheck className="h-5 w-5 text-emerald-400" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className={`text-lg md:text-xl font-semibold ${
                isCompletedBadge ? 'text-white drop-shadow-[0_0_4px_rgba(255,215,0,0.6)]' : 'text-white'
              }`}>{title}</h3>
              {isCompletedBadge && (
                <div className="relative">
                  <Trophy className="h-4 w-4 text-[#FFD700] drop-shadow-[0_0_4px_rgba(255,215,0,0.8)]" />
                  <div className="absolute inset-0 bg-gradient-to-r from-[#FFD700] to-[#FFB347] opacity-30 rounded-sm blur-sm"></div>
                </div>
              )}
            </div>
            <p className={`text-sm md:text-[13px] ${
              isCompletedBadge ? 'text-white/80' : 'text-white/60'
            }`}>{description}</p>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-6">
          {isCompletedBadge ? (
            // Completed badge - show full progress bar with glassmorphism
            <div className="space-y-2">
              <div className="h-2 bg-gradient-to-r from-[#1a1a1a]/50 to-[#2c2c2c]/50 backdrop-blur-[5px] border border-white/10 rounded-full overflow-hidden shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]">
                <div className="h-full bg-gradient-to-r from-[#FFD700] to-[#FFA500] rounded-full shadow-[0_0_8px_rgba(255,215,0,0.6)]" />
              </div>
              <div className="flex items-center justify-between text-[12px] text-white/80">
                <span>{progress.current}/{progress.threshold}</span>
                <span className="text-[#FFD700] font-semibold">100%</span>
              </div>
            </div>
          ) : (
            // Incomplete badge - show normal progress bar
            <div className="space-y-2">
              <Progress value={progress.pct} className="h-2 bg-white/10" />
              <div className="mt-2 flex items-center justify-between text-[12px] text-white/60">
                <span>{progress.current}/{progress.threshold}</span>
                <span>{Math.round(progress.pct)}%</span>
              </div>
            </div>
          )}

          <div className="mt-4 flex items-center justify-between">
            <div className={`rounded-full border px-3 py-1 text-xs ${
              isCompletedBadge 
                ? 'border-white/20 bg-gradient-to-r from-[#1a1a1a]/50 to-[#2c2c2c]/50 backdrop-blur-[5px] text-white font-semibold shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]' 
                : 'border-violet-500/30 bg-violet-500/10 text-violet-200'
            }`}>
              +{xp} XP
            </div>
            {claimable && (
              <button
                onClick={() => onClaim?.(badgeCode)}
                className={`rounded-lg px-3 py-1 text-xs transition-all duration-200 ${
                  isCompletedBadge 
                    ? 'bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-white font-semibold hover:shadow-[0_0_12px_rgba(255,215,0,0.6)] hover:scale-105' 
                    : 'bg-violet-600 text-white hover:bg-violet-700'
                }`}
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
