"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { QuizQuestion, QuizOption } from "@/lib/quiz/config"
import { motion, AnimatePresence } from "framer-motion"
import { Check, ChevronRight, ArrowLeft } from "lucide-react"

interface QuestionStepProps {
  question: QuizQuestion
  currentStep: number
  totalSteps: number
  selectedOptionId: string | null
  onSelect: (optionId: string) => void
  onNext: () => void
  onBack?: () => void
}

export function QuestionStep({
  question,
  currentStep,
  totalSteps,
  selectedOptionId,
  onSelect,
  onNext,
  onBack
}: QuestionStepProps) {
  const handleOptionClick = (option: QuizOption) => {
    onSelect(option.id)
  }

  const handleNext = () => {
    if (selectedOptionId) {
      onNext()
    }
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  }

  const questionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.4,
        ease: [0.22, 1, 0.36, 1]
      }
    }
  }

  const optionVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 25
      }
    }
  }

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-8">
      {/* Enhanced Progress Indicator */}
      <motion.div 
        className="mb-6 md:mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex items-center justify-between mb-2 md:mb-3 gap-2">
          <span className="text-xs md:text-sm font-medium text-gray-400 truncate">
            Question {currentStep} of {totalSteps}
          </span>
          <span className="text-xs md:text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 whitespace-nowrap">
            {Math.round((currentStep / totalSteps) * 100)}%
          </span>
        </div>
        <div className="relative w-full bg-gray-800/50 rounded-full h-2 md:h-3 overflow-hidden border border-white/5">
          <motion.div
            className="h-full bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 rounded-full relative overflow-hidden"
            initial={{ width: 0 }}
            animate={{ width: `${(currentStep / totalSteps) * 100}%` }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            style={{
              backgroundSize: '200% 100%',
            }}
          >
            {/* Animated shimmer on progress bar */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
              animate={{
                x: ['-100%', '100%'],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "linear"
              }}
            />
          </motion.div>
        </div>
      </motion.div>

      {/* Question Card with Glassmorphism */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <Card className="bg-black/40 backdrop-blur-xl border border-white/10 shadow-2xl shadow-purple-500/10 rounded-2xl overflow-hidden">
          <CardHeader className="pb-6">
            <motion.div variants={questionVariants}>
              <CardTitle className="text-3xl md:text-4xl font-bold text-white mb-3 bg-gradient-to-r from-purple-200 to-pink-200 bg-clip-text text-transparent">
                {question.title}
              </CardTitle>
              {question.helperText && (
                <motion.p 
                  className="text-base text-gray-400 leading-relaxed"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  {question.helperText}
                </motion.p>
              )}
            </motion.div>
          </CardHeader>
          
          <CardContent className="space-y-4 pb-8">
            {/* Options with stagger animation */}
            <motion.div 
              className="space-y-3"
              variants={containerVariants}
            >
              <AnimatePresence mode="wait">
                {question.options.map((option, index) => {
                  const isSelected = selectedOptionId === option.id
                  return (
                    <motion.button
                      key={option.id}
                      onClick={() => handleOptionClick(option)}
                      variants={optionVariants}
                      whileHover={{ scale: 1.02, x: 5 }}
                      whileTap={{ scale: 0.98 }}
                      className={`group relative w-full text-left p-5 rounded-xl border-2 transition-all duration-300 overflow-hidden ${
                        isSelected
                          ? 'border-purple-500 bg-purple-500/20 shadow-lg shadow-purple-500/30'
                          : 'border-white/10 bg-white/5 hover:border-purple-500/50 hover:bg-purple-500/10'
                      }`}
                    >
                      {/* Hover gradient effect */}
                      {!isSelected && (
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/10 to-purple-500/0 opacity-0 group-hover:opacity-100"
                          transition={{ duration: 0.3 }}
                        />
                      )}

                      {/* Selected state glow */}
                      {isSelected && (
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-purple-500/20"
                          animate={{
                            backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                          }}
                          transition={{
                            duration: 3,
                            repeat: Infinity,
                            ease: 'linear'
                          }}
                          style={{
                            backgroundSize: '200% 100%'
                          }}
                        />
                      )}

                      <div className="relative z-10 flex items-center justify-between">
                        <span className={`text-lg font-medium transition-colors ${
                          isSelected ? 'text-white' : 'text-gray-300 group-hover:text-white'
                        }`}>
                          {option.label}
                        </span>
                        <motion.div
                          initial={false}
                          animate={{
                            scale: isSelected ? 1 : 0,
                            opacity: isSelected ? 1 : 0
                          }}
                          transition={{ type: "spring", stiffness: 400, damping: 25 }}
                        >
                          {isSelected && (
                            <div className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                              <Check className="w-4 h-4 text-white" />
                            </div>
                          )}
                        </motion.div>
                      </div>
                    </motion.button>
                  )
                })}
              </AnimatePresence>
            </motion.div>

            {/* Navigation Buttons */}
            <motion.div 
              className="flex gap-4 pt-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              {onBack && (
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex-1"
                >
                  <Button
                    variant="outline"
                    onClick={onBack}
                    className="w-full border-2 border-white/20 hover:border-white/40 bg-white/5 hover:bg-white/10 text-white rounded-xl py-6 text-base font-medium transition-all duration-300"
                  >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Back
                  </Button>
                </motion.div>
              )}
              <motion.div
                whileHover={{ scale: selectedOptionId ? 1.05 : 1 }}
                whileTap={{ scale: selectedOptionId ? 0.95 : 1 }}
                className="flex-1"
              >
                <Button
                  onClick={handleNext}
                  disabled={!selectedOptionId}
                  className={`w-full relative overflow-hidden rounded-xl py-6 text-base font-bold text-white transition-all duration-300 ${
                    !selectedOptionId ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  style={{
                    background: selectedOptionId 
                      ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.8) 0%, rgba(236, 72, 153, 0.8) 100%)'
                      : 'linear-gradient(135deg, rgba(139, 92, 246, 0.4) 0%, rgba(236, 72, 153, 0.4) 100%)',
                    border: '2px solid rgba(139, 92, 246, 0.5)',
                  }}
                >
                  {selectedOptionId && (
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600"
                      animate={{
                        backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'linear'
                      }}
                      style={{
                        backgroundSize: '200% 100%'
                      }}
                    />
                  )}
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {currentStep === totalSteps ? 'See My Games' : 'Next'}
                    <ChevronRight className="w-5 h-5" />
                  </span>
                </Button>
              </motion.div>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

