"use client"

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { ArrowLeftIcon, ArrowRightIcon, CheckIcon } from 'lucide-react'
import StepGoal from './StepGoal'
import StepPlacement from './StepPlacement'
import StepPackage from './StepPackage'
import StepGame from './StepGame'
import StepReview from './StepReview'

interface WizardData {
  goal: string
  placements: string[]
  packageType: string
  budget: number
  gameId: string
  gameName?: string
}

interface WizardProps {
  data: WizardData
  updateData: (field: string, value: any) => void
  onSubmit: () => void
  isSubmitting: boolean
}

export default function Wizard({ data, updateData, onSubmit, isSubmitting }: WizardProps) {
  const [currentStep, setCurrentStep] = React.useState(1)
  const totalSteps = 5

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
      // Smooth scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
      // Smooth scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleEditStep = (step: number) => {
    setCurrentStep(step)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return data.goal !== ''
      case 2:
        return data.placements && data.placements.length > 0
      case 3:
        return data.packageType !== '' && data.budget > 0
      case 4:
        return data.gameId !== ''
      case 5:
        return true
      default:
        return false
    }
  }

  const getStepTitle = (step: number) => {
    switch (step) {
      case 1:
        return 'Advertising Goal'
      case 2:
        return 'Placement Options'
      case 3:
        return 'Package & Budget'
      case 4:
        return 'Game Selection'
      case 5:
        return 'Review & Submit'
      default:
        return ''
    }
  }

  const getStepIcon = (step: number) => {
    switch (step) {
      case 1:
        return '🎯'
      case 2:
        return '📍'
      case 3:
        return '💰'
      case 4:
        return '🎮'
      case 5:
        return '✅'
      default:
        return ''
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Progress Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{getStepIcon(currentStep)}</span>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  {getStepTitle(currentStep)}
                </h1>
                <p className="text-gray-400">
                  Step {currentStep} of {totalSteps}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-400">Progress</div>
              <div className="text-lg font-semibold text-white">
                {Math.round((currentStep / totalSteps) * 100)}%
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>

          {/* Step Indicators */}
          <div className="flex justify-between mt-4">
            {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
              <div
                key={step}
                className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-all duration-200 ${
                  step === currentStep
                    ? 'bg-purple-500 text-white'
                    : step < currentStep
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-600 text-gray-400'
                }`}
              >
                {step < currentStep ? (
                  <CheckIcon className="h-4 w-4" />
                ) : (
                  step
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-slate-900/60 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-8 shadow-2xl shadow-purple-500/10">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
            >
              {currentStep === 1 && (
                <StepGoal data={data} updateData={updateData} />
              )}
              {currentStep === 2 && (
                <StepPlacement data={data} updateData={updateData} />
              )}
              {currentStep === 3 && (
                <StepPackage data={data} updateData={updateData} />
              )}
              {currentStep === 4 && (
                <StepGame data={data} updateData={updateData} />
              )}
              {currentStep === 5 && (
                <StepReview
                  data={data}
                  onSubmit={onSubmit}
                  isSubmitting={isSubmitting}
                  onEdit={handleEditStep}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation Buttons */}
        {currentStep < 5 && (
          <div className="flex justify-between mt-8">
            <Button
              onClick={prevStep}
              disabled={currentStep === 1}
              variant="outline"
              className="rounded-xl border-gray-600 text-gray-300 hover:text-white hover:border-purple-500"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back
            </Button>

            <Button
              onClick={nextStep}
              disabled={!canProceed()}
              className="rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              Next
              <ArrowRightIcon className="h-4 w-4 ml-2" />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
