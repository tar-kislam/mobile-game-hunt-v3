"use client"

import { useState, useEffect } from "react"
import { QuestionStep } from "./QuestionStep"
import { quizQuestions, type QuizQuestion } from "@/lib/quiz/config"
import { AnimatePresence, motion } from "framer-motion"

interface QuizFlowProps {
  onComplete: (answers: { questionId: string; optionId: string }[]) => void
}

export function QuizFlow({ onComplete }: QuizFlowProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState<{ [questionId: string]: string }>({})

  const totalSteps = quizQuestions.length
  const currentQuestion = quizQuestions[currentStep]

  useEffect(() => {
      // Track quest started
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'quest_started', {
          event_category: 'Quest',
          event_label: 'Game Discovery Quest'
        })
      }
  }, [])

  const handleSelect = (optionId: string) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: optionId
    }))
  }

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(prev => prev + 1)
    } else {
      // Quest complete
      const answerArray = Object.entries(answers).map(([questionId, optionId]) => ({
        questionId,
        optionId
      }))

      // Track quest completed
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'quest_completed', {
          event_category: 'Quest',
          event_label: 'Game Discovery Quest',
          value: totalSteps
        })
      }

      onComplete(answerArray)
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const selectedOptionId = answers[currentQuestion.id] || null

  // Question transition variants
  const questionTransition = {
    initial: (direction: number) => ({
      opacity: 0,
      x: direction > 0 ? 50 : -50,
      scale: 0.9
    }),
    animate: {
      opacity: 1,
      x: 0,
      scale: 1,
      transition: {
        duration: 0.4,
        ease: [0.22, 1, 0.36, 1]
      }
    },
    exit: (direction: number) => ({
      opacity: 0,
      x: direction > 0 ? -50 : 50,
      scale: 0.9,
      transition: {
        duration: 0.3,
        ease: [0.22, 1, 0.36, 1]
      }
    })
  }

  const [direction, setDirection] = useState(1)

  const handleNextWithDirection = () => {
    setDirection(1)
    handleNext()
  }

  const handleBackWithDirection = () => {
    setDirection(-1)
    handleBack()
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={currentStep}
          custom={direction}
          variants={questionTransition}
          initial="initial"
          animate="animate"
          exit="exit"
          className="w-full"
        >
          <QuestionStep
            question={currentQuestion}
            currentStep={currentStep + 1}
            totalSteps={totalSteps}
            selectedOptionId={selectedOptionId}
            onSelect={handleSelect}
            onNext={handleNextWithDirection}
            onBack={currentStep > 0 ? handleBackWithDirection : undefined}
          />
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

