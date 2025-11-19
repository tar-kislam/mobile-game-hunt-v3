"use client"

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { XIcon, ChevronLeft, ChevronRight, Search, Gamepad2, Users, Trophy, Sparkles, Star, Heart, MessageCircle, Award } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import PixelBlast from '@/components/effects/pixel-blast'
import Stepper, { Step } from '@/components/ui/stepper'

interface SiteTourModalProps {
  isOpen: boolean
  onClose: () => void
  onDismissed?: () => void
}

const TOUR_STEPS = [
  {
    title: "Discover Amazing Games",
    description: "Browse through hundreds of mobile games, filter by category, platform, and launch date. Find your next favorite game!",
    icon: Search,
    features: [
      { icon: Search, text: "Browse by category" },
      { icon: Gamepad2, text: "Filter by platform" },
      { icon: Sparkles, text: "Search games" },
      { icon: Star, text: "View launch calendar" }
    ]
  },
  {
    title: "Submit Your Game",
    description: "Showcase your mobile game to thousands of players. Submit with detailed information, screenshots, and launch details.",
    icon: Gamepad2,
    features: [
      { icon: Gamepad2, text: "Easy submission form" },
      { icon: Sparkles, text: "Upload screenshots" },
      { icon: Star, text: "Set launch dates" },
      { icon: Trophy, text: "Track analytics" }
    ]
  },
  {
    title: "Join the Community",
    description: "Connect with game developers and players. Share thoughts, vote for games, and follow your favorites.",
    icon: Users,
    features: [
      { icon: Heart, text: "Vote for games" },
      { icon: Users, text: "Follow developers" },
      { icon: MessageCircle, text: "Post comments" },
      { icon: Sparkles, text: "Share discoveries" }
    ]
  },
  {
    title: "Climb the Leaderboards",
    description: "Compete with other hunters! Earn XP, unlock badges, and see your name on the leaderboards.",
    icon: Trophy,
    features: [
      { icon: Star, text: "Earn XP points" },
      { icon: Award, text: "Unlock badges" },
      { icon: Trophy, text: "Top hunters ranking" },
      { icon: Sparkles, text: "Achievement system" }
    ]
  }
]

export function SiteTourModal({ isOpen, onClose, onDismissed }: SiteTourModalProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = TOUR_STEPS.length

  const handleClose = useCallback(() => {
    setCurrentStep(1)
    if (onDismissed) {
      onDismissed()
    }
    onClose()
  }, [onClose, onDismissed])

  const handleNext = useCallback(() => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }, [currentStep, totalSteps])

  const handlePrevious = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }, [currentStep])

  const handleComplete = () => {
    handleClose()
  }

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (!isOpen) return

      if (event.key === 'Escape') {
        handleClose()
      } else if (event.key === 'ArrowLeft') {
        handlePrevious()
      } else if (event.key === 'ArrowRight') {
        handleNext()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyPress)
    }

    return () => {
      document.removeEventListener('keydown', handleKeyPress)
    }
  }, [isOpen, handleClose, handlePrevious, handleNext])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Background Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed inset-0 bg-black z-50"
            onClick={handleClose}
          />
          
          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.7 }}
            transition={{ 
              type: "spring", 
              stiffness: 200, 
              damping: 20,
              duration: 0.5
            }}
            className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-zinc-900 border border-purple-600 shadow-xl rounded-xl sm:rounded-2xl max-w-5xl w-full mx-auto p-4 sm:p-6 md:p-8 relative overflow-hidden max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
              {/* Navigation Arrows */}
              {currentStep > 1 && (
                <button
                  onClick={handlePrevious}
                  className="absolute left-1 sm:left-2 md:left-4 top-1/2 -translate-y-1/2 z-30 p-2 sm:p-2.5 md:p-3 rounded-full bg-black/60 border border-purple-500/50 text-purple-400 hover:text-purple-300 hover:bg-black/80 hover:border-purple-400 transition-all duration-300 hover:scale-110 shadow-lg hover:shadow-purple-500/20"
                  aria-label="Previous step"
                >
                  <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
                </button>
              )}
              {currentStep < totalSteps && (
                <button
                  onClick={handleNext}
                  className="absolute right-1 sm:right-2 md:right-4 top-1/2 -translate-y-1/2 z-30 p-2 sm:p-2.5 md:p-3 rounded-full bg-black/60 border border-purple-500/50 text-purple-400 hover:text-purple-300 hover:bg-black/80 hover:border-purple-400 transition-all duration-300 hover:scale-110 shadow-lg hover:shadow-purple-500/20"
                  aria-label="Next step"
                >
                  <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
                </button>
              )}
              {/* Pixel Blast Background - Same as newsletter modal */}
              <div className="absolute inset-0 z-0">
                <PixelBlast
                  variant="square"
                  pixelSize={4}
                  color="#8B5CF6"
                  patternScale={1.5}
                  patternDensity={0.8}
                  enableRipples={true}
                  rippleIntensityScale={2.0}
                  rippleThickness={0.2}
                  rippleSpeed={0.6}
                  speed={0.3}
                  transparent={true}
                  edgeFade={0.3}
                  liquid={true}
                  liquidStrength={0.05}
                  liquidRadius={1.5}
                  className="w-full h-full"
                />
              </div>
              
              {/* Overlay for better text readability */}
              <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background/80 z-10" />
              
              {/* Content */}
              <div className="relative z-20">
                {/* Close Button */}
                <button
                  onClick={handleClose}
                  className="absolute -top-2 -right-2 sm:-top-3 sm:-right-3 p-1.5 sm:p-2 rounded-full bg-black/60 border border-white/10 text-gray-300 hover:text-white hover:bg-white/10 transition-colors z-30"
                  aria-label="Close"
                >
                  <XIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                </button>

                {/* Header */}
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                  className="text-center mb-3 sm:mb-4 md:mb-6"
                >
                  <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold text-foreground leading-tight mb-1 sm:mb-2" style={{ fontFamily: "'Roboto Mono', monospace" }}>
                    Welcome to <span className="text-primary">Mobile Game Hunt</span>
                  </h2>
                  <p className="text-muted-foreground text-xs sm:text-sm md:text-base">
                    Let's take a quick tour of what you can do here
                  </p>
                </motion.div>

                {/* Stepper */}
                <Stepper
                  initialStep={currentStep}
                  onStepChange={setCurrentStep}
                  onFinalStepCompleted={handleComplete}
                  stepCircleContainerClassName="bg-transparent border-0"
                  stepContainerClassName="pb-2 sm:pb-3 md:pb-4"
                  contentClassName="py-3 sm:py-4 md:py-6"
                  footerClassName="pt-2 sm:pt-3 md:pt-4"
                  backButtonText="Previous"
                  nextButtonText="Next"
                  backButtonProps={{
                    className: "bg-gray-700 hover:bg-gray-600 text-white px-4 py-1.5 sm:px-5 sm:py-2 md:px-6 md:py-2 rounded-lg transition-colors text-xs sm:text-sm",
                    onClick: handlePrevious
                  }}
                  nextButtonProps={{
                    className: "bg-purple-600 hover:bg-purple-700 text-white px-4 py-1.5 sm:px-5 sm:py-2 md:px-6 md:py-2 rounded-lg transition-colors text-xs sm:text-sm",
                    onClick: currentStep === totalSteps ? handleComplete : handleNext
                  }}
                >
                  {TOUR_STEPS.map((step, index) => {
                    const IconComponent = step.icon
                    return (
                      <Step key={index}>
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4 }}
                          className="space-y-3 sm:space-y-4 md:space-y-6"
                        >
                          {/* Step Title */}
                          <div className="text-center">
                            <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl font-semibold text-foreground mb-1 sm:mb-2">
                              {step.title}
                            </h3>
                            <p className="text-muted-foreground text-xs sm:text-sm md:text-base max-w-2xl mx-auto px-2">
                              {step.description}
                            </p>
                          </div>

                          {/* Organic Animated Graphic - Non-rectangular */}
                          <div className="relative w-full aspect-[4/3] sm:aspect-video flex items-center justify-center">
                            {/* Organic shape background with clip-path */}
                            <motion.div
                              className="relative w-full h-full"
                              style={{
                                clipPath: "polygon(20% 0%, 80% 0%, 100% 20%, 100% 80%, 80% 100%, 20% 100%, 0% 80%, 0% 20%)",
                              }}
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ duration: 0.5 }}
                            >
                              {/* Gradient background */}
                              <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/20 via-purple-900/20 to-cyan-900/20" />
                              
                              {/* Animated border glow */}
                              <motion.div
                                className="absolute inset-0 pointer-events-none"
                                style={{
                                  clipPath: "polygon(20% 0%, 80% 0%, 100% 20%, 100% 80%, 80% 100%, 20% 100%, 0% 80%, 0% 20%)",
                                }}
                                animate={{
                                  boxShadow: [
                                    "inset 0 0 30px rgba(34, 211, 238, 0.2), 0 0 20px rgba(34, 211, 238, 0.2)",
                                    "inset 0 0 50px rgba(34, 211, 238, 0.4), 0 0 40px rgba(34, 211, 238, 0.5)",
                                    "inset 0 0 50px rgba(139, 92, 246, 0.4), 0 0 40px rgba(139, 92, 246, 0.5)",
                                    "inset 0 0 30px rgba(34, 211, 238, 0.2), 0 0 20px rgba(34, 211, 238, 0.2)",
                                  ],
                                }}
                                transition={{
                                  duration: 3,
                                  repeat: Infinity,
                                  ease: "easeInOut",
                                }}
                              />
                              
                              {/* Border outline */}
                              <div 
                                className="absolute inset-0 pointer-events-none"
                                style={{
                                  clipPath: "polygon(20% 0%, 80% 0%, 100% 20%, 100% 80%, 80% 100%, 20% 100%, 0% 80%, 0% 20%)",
                                  border: "2px solid",
                                  borderColor: "rgba(34, 211, 238, 0.5)",
                                }}
                              />

                              {/* Floating orbs */}
                              {[...Array(6)].map((_, i) => {
                                const angle = (i / 6) * Math.PI * 2
                                const radius = 35
                                const baseX = 50
                                const baseY = 50
                                
                                return (
                                  <motion.div
                                    key={i}
                                    className="absolute w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 rounded-full bg-cyan-400/60 blur-sm"
                                    style={{
                                      left: `${baseX}%`,
                                      top: `${baseY}%`,
                                      transform: "translate(-50%, -50%)",
                                    }}
                                    animate={{
                                      x: [
                                        Math.cos(angle) * radius + "%",
                                        Math.cos(angle + Math.PI) * radius + "%",
                                        Math.cos(angle) * radius + "%",
                                      ],
                                      y: [
                                        Math.sin(angle) * radius + "%",
                                        Math.sin(angle + Math.PI) * radius + "%",
                                        Math.sin(angle) * radius + "%",
                                      ],
                                      scale: [0.8, 1.5, 0.8],
                                      opacity: [0.3, 0.8, 0.3],
                                    }}
                                    transition={{
                                      duration: 4 + i * 0.3,
                                      repeat: Infinity,
                                      ease: "easeInOut",
                                      delay: i * 0.2,
                                    }}
                                  />
                                )
                              })}

                              {/* Central icon with organic glow */}
                              <div className="absolute inset-0 flex items-center justify-center">
                                <motion.div
                                  className="relative"
                                  initial={{ scale: 0, rotate: -180 }}
                                  animate={{ scale: 1, rotate: 0 }}
                                  transition={{
                                    type: "spring",
                                    stiffness: 200,
                                    damping: 15,
                                    delay: 0.3
                                  }}
                                >
                                  {/* Pulsing glow rings */}
                                  {[...Array(2)].map((_, i) => (
                                    <motion.div
                                      key={i}
                                      className="absolute inset-0 rounded-full border border-cyan-400/30"
                                      style={{
                                        width: `${100 + i * 25}%`,
                                        height: `${100 + i * 25}%`,
                                        left: `${-i * 12.5}%`,
                                        top: `${-i * 12.5}%`,
                                      }}
                                      animate={{
                                        scale: [1, 1.2, 1],
                                        opacity: [0.2, 0.5, 0.2],
                                        borderColor: [
                                          "rgba(34, 211, 238, 0.3)",
                                          "rgba(34, 211, 238, 0.6)",
                                          "rgba(34, 211, 238, 0.3)",
                                        ],
                                      }}
                                      transition={{
                                        duration: 2 + i * 0.5,
                                        repeat: Infinity,
                                        ease: "easeInOut",
                                        delay: i * 0.3,
                                      }}
                                    />
                                  ))}

                                  {/* Icon container */}
                                  <div className="relative p-4 sm:p-5 md:p-6 lg:p-8 rounded-full bg-black/40 backdrop-blur-sm border border-cyan-400/40">
                                    <motion.div
                                      animate={{
                                        filter: [
                                          "drop-shadow(0 0 10px rgba(34, 211, 238, 0.5))",
                                          "drop-shadow(0 0 20px rgba(34, 211, 238, 0.8))",
                                          "drop-shadow(0 0 10px rgba(34, 211, 238, 0.5))",
                                        ],
                                      }}
                                      transition={{
                                        duration: 2,
                                        repeat: Infinity,
                                        ease: "easeInOut",
                                      }}
                                    >
                                      <IconComponent className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 lg:w-24 lg:h-24 text-cyan-400" />
                                    </motion.div>
                                  </div>
                                </motion.div>
                              </div>

                              {/* Lightweight particle effects */}
                              {[...Array(8)].map((_, i) => {
                                const angle = (i / 8) * Math.PI * 2
                                const radius = 30
                                
                                return (
                                  <motion.div
                                    key={i}
                                    className="absolute w-0.5 h-0.5 sm:w-1 sm:h-1 rounded-full bg-cyan-400"
                                    style={{
                                      left: "50%",
                                      top: "50%",
                                    }}
                                    animate={{
                                      x: [
                                        Math.cos(angle) * radius + "px",
                                        Math.cos(angle) * (radius + 20) + "px",
                                        Math.cos(angle) * radius + "px",
                                      ],
                                      y: [
                                        Math.sin(angle) * radius + "px",
                                        Math.sin(angle) * (radius + 20) + "px",
                                        Math.sin(angle) * radius + "px",
                                      ],
                                      opacity: [0, 1, 0],
                                      scale: [0, 1, 0],
                                    }}
                                    transition={{
                                      duration: 3,
                                      repeat: Infinity,
                                      ease: "easeInOut",
                                      delay: i * 0.15,
                                    }}
                                  />
                                )
                              })}
                            </motion.div>
                          </div>

                          {/* Features List */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-2.5 md:gap-3">
                            {step.features.map((feature, idx) => {
                              const FeatureIcon = feature.icon
                              return (
                                <motion.div
                                  key={idx}
                                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                  animate={{ opacity: 1, scale: 1, y: 0 }}
                                  transition={{ delay: 0.3 + idx * 0.1, duration: 0.3 }}
                                  className="flex flex-col items-center gap-1 sm:gap-1.5 md:gap-2 p-2 sm:p-3 md:p-4 rounded-lg bg-purple-500/10 border border-purple-500/20 hover:bg-purple-500/20 hover:border-purple-400/40 transition-all duration-300"
                                >
                                  <motion.div
                                    animate={{
                                      rotate: [0, 10, -10, 0],
                                      scale: [1, 1.1, 1],
                                    }}
                                    transition={{
                                      duration: 2,
                                      repeat: Infinity,
                                      ease: "easeInOut",
                                      delay: idx * 0.2,
                                    }}
                                  >
                                    <FeatureIcon className="w-4 h-4 sm:w-4.5 sm:h-4.5 md:w-5 md:h-5 text-purple-400" />
                                  </motion.div>
                                  <span className="text-[10px] sm:text-xs md:text-sm text-foreground text-center leading-tight">{feature.text}</span>
                                </motion.div>
                              )
                            })}
                          </div>
                        </motion.div>
                      </Step>
                    )
                  })}
                </Stepper>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

