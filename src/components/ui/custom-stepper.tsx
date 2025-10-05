"use client"

import React from 'react'
import { Check, Info, Image, Users, Rocket, Star, CheckSquare } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CustomStepperProps {
  activeStep: number
  onStepClick: (stepIndex: number) => void
  completedSteps: number[]
  className?: string
  orientation?: 'vertical' | 'horizontal'
}

const stepConfig = [
  {
    id: 1,
    label: 'Main Info',
    icon: Info,
    description: 'Basic game information'
  },
  {
    id: 2,
    label: 'Images & Media',
    icon: Image,
    description: 'Thumbnail and gallery'
  },
  {
    id: 3,
    label: 'Makers',
    icon: Users,
    description: 'Team and collaborators'
  },
  {
    id: 4,
    label: 'Launch Details',
    icon: Rocket,
    description: 'Launch configuration'
  },
  {
    id: 5,
    label: 'Community & Extras',
    icon: Star,
    description: 'Community features'
  },
  {
    id: 6,
    label: 'Final Checklist',
    icon: CheckSquare,
    description: 'Review and submit'
  }
]

export function CustomStepper({ 
  activeStep, 
  onStepClick, 
  completedSteps, 
  className,
  orientation = 'vertical'
}: CustomStepperProps) {
  return (
    <div className={cn(
      "w-full",
      orientation === 'horizontal' ? "flex flex-row space-x-2" : "space-y-2",
      className
    )}>
      {stepConfig.map((step, index) => {
        const Icon = step.icon
        const isCompleted = completedSteps.includes(step.id)
        const isActive = activeStep === index
        const canNavigate = completedSteps.includes(step.id) || isActive || index < activeStep
        
        return (
          <button
            key={step.id}
            onClick={() => canNavigate && onStepClick(index)}
            disabled={!canNavigate}
            className={cn(
              "w-full cursor-pointer transition-all duration-300 p-3 rounded-lg border text-left",
              "hover:shadow-lg hover:scale-[1.02] transform",
              isActive 
                ? "bg-gradient-to-r from-blue-500/10 to-purple-600/10 border-blue-500/20 shadow-lg shadow-blue-500/10" 
                : isCompleted
                ? "bg-green-500/5 border-green-500/20 hover:bg-green-500/10"
                : "hover:bg-muted/50 border-transparent hover:border-primary/20",
              !canNavigate && "opacity-50 cursor-not-allowed hover:scale-100 hover:shadow-none",
              orientation === 'horizontal' && "flex-1 min-w-0"
            )}
          >
            <div className={cn(
              "flex items-center space-x-3",
              orientation === 'horizontal' && "flex-col space-x-0 space-y-2 text-center"
            )}>
              <div className={cn(
                "flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-300 flex-shrink-0",
                isCompleted 
                  ? "bg-green-500 border-green-500 text-white shadow-lg shadow-green-500/25" 
                  : isActive 
                  ? "bg-gradient-to-r from-blue-500 to-purple-600 border-transparent text-white shadow-lg shadow-blue-500/25" 
                  : "bg-background border-muted-foreground/30 text-muted-foreground hover:border-primary/50 hover:text-primary"
              )}>
                {isCompleted ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Icon className="w-4 h-4" />
                )}
              </div>
              
              <div className="flex flex-col space-y-1 min-w-0 flex-1">
                <span className={cn(
                  "text-sm font-medium transition-colors truncate",
                  isActive 
                    ? "text-primary" 
                    : isCompleted 
                    ? "text-green-600 dark:text-green-400" 
                    : "text-muted-foreground"
                )}>
                  {step.label}
                </span>
                <span className="text-xs text-muted-foreground truncate">
                  {step.description}
                </span>
              </div>
            </div>
          </button>
        )
      })}
    </div>
  )
}

// Mobile horizontal stepper variant
export function MobileStepper({ 
  activeStep, 
  onStepClick, 
  completedSteps 
}: Omit<CustomStepperProps, 'orientation'>) {
  return (
    <div className="w-full bg-card border rounded-lg p-4 mb-6">
      <CustomStepper
        activeStep={activeStep}
        onStepClick={onStepClick}
        completedSteps={completedSteps}
        orientation="horizontal"
        className="w-full"
      />
    </div>
  )
}

// Desktop vertical stepper variant
export function DesktopStepper({ 
  activeStep, 
  onStepClick, 
  completedSteps 
}: Omit<CustomStepperProps, 'orientation'>) {
  return (
    <div className="w-full">
      <CustomStepper
        activeStep={activeStep}
        onStepClick={onStepClick}
        completedSteps={completedSteps}
        orientation="vertical"
        className="w-full"
      />
    </div>
  )
}

// Top horizontal stepper for the submit page
export function TopHorizontalStepper({ 
  activeStep, 
  onStepClick, 
  completedSteps,
  className 
}: CustomStepperProps) {
  return (
    <div className={cn("w-full bg-card border rounded-xl p-6 shadow-sm", className)}>
      <div className="flex items-center justify-between w-full">
        {stepConfig.map((step, index) => {
          const isActive = activeStep === index
          const isCompleted = completedSteps.includes(index + 1)
          const Icon = step.icon
          const isLast = index === stepConfig.length - 1
          
          return (
            <React.Fragment key={step.id}>
              <button
                onClick={() => onStepClick(index)}
                className={cn(
                  "flex flex-col items-center gap-3 p-4 rounded-lg transition-all duration-300 group relative",
                  "hover:bg-muted/30 hover:scale-105 hover:shadow-md",
                  isActive && "bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 shadow-lg shadow-blue-500/10 scale-105",
                  isCompleted && !isActive && "bg-green-500/5 border border-green-500/20"
                )}
              >
                <div className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300",
                  "border-2 border-muted-foreground/30",
                  isActive && "border-blue-500 bg-blue-500 text-white shadow-lg shadow-blue-500/25",
                  isCompleted && !isActive && "border-green-500 bg-green-500 text-white",
                  !isActive && !isCompleted && "group-hover:border-primary/50"
                )}>
                  {isCompleted && !isActive ? (
                    <Check className="w-6 h-6" />
                  ) : (
                    <Icon className="w-6 h-6" />
                  )}
                </div>
                <div className="text-center">
                  <div className={cn(
                    "text-sm font-medium transition-colors",
                    isActive && "text-blue-600 dark:text-blue-400",
                    isCompleted && !isActive && "text-green-600 dark:text-green-400",
                    !isActive && !isCompleted && "text-muted-foreground group-hover:text-foreground"
                  )}>
                    {step.label}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {step.description}
                  </div>
                </div>
              </button>
              
              {/* Connector line */}
              {!isLast && (
                <div className={cn(
                  "flex-1 h-0.5 mx-4 transition-all duration-300",
                  completedSteps.includes(index + 1) ? "bg-green-500" : "bg-muted-foreground/30"
                )} />
              )}
            </React.Fragment>
          )
        })}
      </div>
    </div>
  )
}
