"use client"

import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { showXPGainNotification, showBadgeNotification } from "@/hooks/useXPNotifications"

export function ToastTestComponent() {
  const testLevelUp = () => {
    toast.success("🚀 You reached Level 5!", {
      description: "Congratulations! You've gained 100 XP and leveled up!",
      duration: 5000,
    })
  }

  const testBadgeEarned = () => {
    toast.success("🎉 Congrats! You earned the 🏆 Top Voter badge!", {
      description: "Consistently votes on quality games",
      duration: 6000,
    })
  }

  const testXPGain = () => {
    showXPGainNotification(25, "voting on a game")
  }

  const testCustomBadge = () => {
    showBadgeNotification("BUILDER", "Builder", "🔨")
  }

  return (
    <div className="p-4 space-y-4 bg-gray-900 rounded-lg">
      <h3 className="text-lg font-semibold text-white">Toast Notification Tests</h3>
      <div className="grid grid-cols-2 gap-2">
        <Button onClick={testLevelUp} variant="outline" className="text-sm">
          Test Level Up Toast
        </Button>
        <Button onClick={testBadgeEarned} variant="outline" className="text-sm">
          Test Badge Toast
        </Button>
        <Button onClick={testXPGain} variant="outline" className="text-sm">
          Test XP Gain Toast
        </Button>
        <Button onClick={testCustomBadge} variant="outline" className="text-sm">
          Test Custom Badge
        </Button>
      </div>
    </div>
  )
}
