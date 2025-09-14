"use client"

import React from 'react'
import Stepper, { Step } from '@/components/Stepper'
import { motion } from 'framer-motion'
import { Check } from 'lucide-react'

interface SubmitStepperProps {
  activeStep: number
  completedSteps: number[]
  onStepClick: (step: number) => void
}

const stepConfig = [
  { id: 'main-info', label: 'Main Info', description: 'Basic details' },
  { id: 'images-media', label: 'Images & Media', description: 'Upload assets' },
  { id: 'makers', label: 'Makers', description: 'Team members' },
  { id: 'launch-details', label: 'Launch Details', description: 'Launch config' },
  { id: 'community-extras', label: 'Community & Extras', description: 'Community features' },
  { id: 'final-checklist', label: 'Final Checklist', description: 'Review & submit' }
]

export function SubmitStepper({ activeStep, completedSteps, onStepClick }: SubmitStepperProps) {
  const renderStepIndicator = ({ step, currentStep, onStepClick: handleStepClick }: {
    step: number
    currentStep: number
    onStepClick: (clicked: number) => void
  }) => {
    const isActive = currentStep === step
    const isCompleted = completedSteps.includes(step)
    const stepData = stepConfig[step - 1]
    
    return (
      <motion.div
        onClick={() => handleStepClick(step)}
        className="flex flex-col items-center gap-2 p-3 rounded-xl transition-all duration-300 cursor-pointer group relative"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {/* Step Circle */}
        <div className={`
          w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300
          border-2 relative overflow-hidden
          ${isActive 
            ? 'border-purple-500 bg-purple-500 text-white shadow-lg shadow-purple-500/25' 
            : isCompleted 
            ? 'border-green-500 bg-green-500 text-white' 
            : 'border-gray-600 bg-gray-800 text-gray-400 group-hover:border-purple-400 group-hover:text-purple-300'
          }
        `}>
          {isCompleted ? (
            <Check className="w-6 h-6" />
          ) : (
            <span className="text-sm font-semibold">{step}</span>
          )}
          
          {/* Active step glow effect */}
          {isActive && (
            <motion.div
              className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-400 to-blue-400 opacity-30"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.6, 0.3]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          )}
        </div>
        
        {/* Step Label */}
        <div className="text-center">
          <div className={`
            text-sm font-medium transition-colors duration-300
            ${isActive 
              ? 'text-purple-400' 
              : isCompleted 
              ? 'text-green-400' 
              : 'text-gray-400 group-hover:text-purple-300'
            }
          `}>
            {stepData.label}
          </div>
          <div className="text-xs text-gray-500 mt-1 hidden md:block">
            {stepData.description}
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <div className="w-full max-w-5xl mx-auto px-4">
      <div className="bg-gradient-to-r from-gray-900/90 via-gray-800/95 to-gray-900/90 backdrop-blur-sm border border-purple-500/20 rounded-2xl shadow-xl p-6">
        <div className="flex items-center justify-between w-full">
          {stepConfig.map((_, index) => {
            const stepNumber = index + 1
            const isNotLastStep = index < stepConfig.length - 1
            
            return (
              <React.Fragment key={stepNumber}>
                {renderStepIndicator({
                  step: stepNumber,
                  currentStep: activeStep,
                  onStepClick: (clicked) => {
                    onStepClick(clicked - 1) // Convert to 0-based index for existing logic
                  }
                })}
                {isNotLastStep && (
                  <div className="flex-1 mx-4 relative">
                    <div className="h-0.5 bg-gray-700 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ 
                          width: activeStep > stepNumber ? '100%' : '0%' 
                        }}
                        transition={{ duration: 0.5, ease: "easeInOut" }}
                      />
                    </div>
                  </div>
                )}
              </React.Fragment>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// Mobile version for responsive design
export function MobileSubmitStepper({ activeStep, completedSteps, onStepClick }: SubmitStepperProps) {
  return (
    <div className="w-full px-4 md:hidden">
      <div className="bg-gradient-to-r from-gray-900/90 via-gray-800/95 to-gray-900/90 backdrop-blur-sm border border-purple-500/20 rounded-2xl shadow-xl p-4">
        <div className="overflow-x-auto scrollbar-hide">
          <div className="flex items-center gap-4 min-w-max">
            {stepConfig.map((stepData, index) => {
              const stepNumber = index + 1
              const isActive = activeStep === stepNumber
              const isCompleted = completedSteps.includes(stepNumber)
              
              return (
                <motion.button
                  key={stepNumber}
                  onClick={() => onStepClick(index)}
                  className="flex items-center gap-3 p-3 rounded-xl transition-all duration-300 whitespace-nowrap group relative"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {/* Step Circle */}
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300
                    border-2 flex-shrink-0
                    ${isActive 
                      ? 'border-purple-500 bg-purple-500 text-white shadow-lg shadow-purple-500/25' 
                      : isCompleted 
                      ? 'border-green-500 bg-green-500 text-white' 
                      : 'border-gray-600 bg-gray-800 text-gray-400 group-hover:border-purple-400 group-hover:text-purple-300'
                    }
                  `}>
                    {isCompleted ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <span className="text-sm font-semibold">{stepNumber}</span>
                    )}
                  </div>
                  
                  {/* Step Label */}
                  <div className="text-left">
                    <div className={`
                      text-sm font-medium transition-colors duration-300
                      ${isActive 
                        ? 'text-purple-400' 
                        : isCompleted 
                        ? 'text-green-400' 
                        : 'text-gray-400 group-hover:text-purple-300'
                      }
                    `}>
                      {stepData.label}
                    </div>
                    <div className="text-xs text-gray-500">
                      {stepData.description}
                    </div>
                  </div>
                </motion.button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
