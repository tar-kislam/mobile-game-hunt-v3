"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface SubmitStepNavigationProps {
  step: number
  totalSteps: number
  onBack: () => void
  onNext?: () => void
  canProceed?: boolean
  nextLabel?: string
  isSubmitting?: boolean
}

export function SubmitStepNavigation({
  step,
  totalSteps,
  onBack,
  onNext,
  canProceed = true,
  nextLabel = "Next",
  isSubmitting,
}: SubmitStepNavigationProps) {
  const isFirstStep = step === 1
  const isLastStep = step === totalSteps

  return (
    <div className={cn("flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between")}>
      <Button
        type="button"
        variant="ghost"
        onClick={onBack}
        disabled={isFirstStep || Boolean(isSubmitting)}
        className="w-full sm:w-auto"
      >
        Back
      </Button>
      {!isLastStep && onNext && (
        <Button
          type="button"
          onClick={onNext}
          disabled={!canProceed || Boolean(isSubmitting)}
          className="w-full sm:w-auto"
        >
          {nextLabel}
        </Button>
      )}
    </div>
  )
}





