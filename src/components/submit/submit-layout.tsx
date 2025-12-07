"use client"

import { ReactNode } from "react"
import { Card } from "@/components/ui/card"
import { SubmitStepper, MobileSubmitStepper } from "@/components/ui/submit-stepper"
import { Progress } from "@/components/ui/progress"

interface SubmitLayoutProps {
  step: number
  steps: { title: string; subtitle: string }[]
  completedSteps: number[]
  onStepChange: (index: number) => void
  progress: number
  header: ReactNode
  children: ReactNode
  footer?: ReactNode
  aside?: ReactNode
}

export function SubmitLayout({
  step,
  steps,
  completedSteps,
  onStepChange,
  progress,
  header,
  children,
  footer,
  aside,
}: SubmitLayoutProps) {
  const totalSteps = steps.length

  return (
    <section className="min-h-screen bg-gradient-to-b from-background to-background/60 py-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4">
        <Card className="border-border/60 bg-card/80 shadow-2xl shadow-black/30 backdrop-blur">
          <div className="space-y-6 p-6">
            <div className="space-y-2">
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div className="text-sm text-muted-foreground">
                  Step {step} of {totalSteps}
                </div>
                <div className="text-xs uppercase tracking-wide text-muted-foreground">
                  Overall progress: {Math.round(progress)}%
                </div>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            <div className="hidden md:block">
              <SubmitStepper
                activeStep={step}
                completedSteps={completedSteps}
                onStepClick={(clickedStep) => onStepChange(clickedStep)}
              />
            </div>
            <div className="md:hidden">
              <MobileSubmitStepper
                activeStep={step}
                completedSteps={completedSteps}
                onStepClick={(clickedStep) => onStepChange(clickedStep)}
              />
            </div>

            {header}

            <div>{children}</div>

            {footer}
          </div>
        </Card>

        {aside}
      </div>
    </section>
  )
}










