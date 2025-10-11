"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Shield } from "lucide-react"

interface LegalDisclaimerProps {
  className?: string
  showHeading?: boolean
}

export function LegalDisclaimer({ className = "", showHeading = true }: LegalDisclaimerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className={className}
    >
      <Card className="bg-card/50 border-white/10 backdrop-blur-sm max-w-[720px] mx-auto">
        <CardContent className="p-6">
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <Shield className="h-5 w-5 text-muted-foreground mt-1" />
            </div>
            <div className="space-y-2">
              {showHeading && (
                <h2 className="text-lg font-semibold">Legal Disclaimer</h2>
              )}
              <p className="text-sm text-muted-foreground leading-relaxed">
                Mobile Game Hunt is an independent discovery platform for mobile games.
                All trademarks, logos, and images are property of their respective owners.
                Mobile Game Hunt does not distribute or host copyrighted game files.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

