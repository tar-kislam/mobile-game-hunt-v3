"use client"

import { useState } from "react"
import { QuizFlow } from "@/components/quiz/QuizFlow"
import { QuizResults } from "@/components/quiz/QuizResults"
import { Loader2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

type QuizState = 'intro' | 'questions' | 'loading' | 'results'

interface QuizResult {
  id: string
  slug: string
  title: string
  tagline?: string | null
  shortPitch?: string | null
  thumbnail?: string | null
  url?: string | null
  score: number
  matchedTags: string[]
  reasons: string[]
  metrics: {
    likes: number
  }
}

export default function QuizPage() {
  const [state, setState] = useState<QuizState>('intro')
  const [results, setResults] = useState<QuizResult[]>([])
  const [loading, setLoading] = useState(false)

  const handleStart = () => {
    setState('questions')
  }

  const handleComplete = async (answers: { questionId: string; optionId: string }[]) => {
    setState('loading')
    setLoading(true)

    try {
      const response = await fetch('/api/quiz/recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ answers })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to get recommendations')
      }

      const data = await response.json()
      setResults(data.results || [])
      setState('results')
    } catch (error) {
      console.error('Error fetching recommendations:', error)
      // Show error state
      alert('Failed to get recommendations. Please try again.')
      setState('questions')
    } finally {
      setLoading(false)
    }
  }

  const handleRetake = () => {
    setState('intro')
    setResults([])
  }

  // Page transition variants
  const pageVariants = {
    initial: { opacity: 0, y: 20, scale: 0.95 },
    animate: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: {
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1]
      }
    },
    exit: { 
      opacity: 0, 
      y: -20, 
      scale: 0.95,
      transition: {
        duration: 0.3,
        ease: [0.22, 1, 0.36, 1]
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-[#121225] to-[#050509] bg-[radial-gradient(80%_80%_at_0%_0%,rgba(124,58,237,0.22),transparent_60%),radial-gradient(80%_80%_at_100%_100%,rgba(6,182,212,0.18),transparent_60%)] relative overflow-hidden">
      {/* Animated background particles */}
      {typeof window !== 'undefined' && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-purple-400/30 rounded-full"
              initial={{
                x: Math.random() * (window.innerWidth || 1920),
                y: Math.random() * (window.innerHeight || 1080),
              }}
              animate={{
                y: [null, Math.random() * (window.innerHeight || 1080)],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: Math.random() * 3 + 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>
      )}

      <AnimatePresence mode="wait">
        {state === 'intro' && (
          <motion.div
            key="intro"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="min-h-screen flex items-center justify-center p-4 relative z-10"
          >
            <div className="w-full max-w-3xl text-center">
              {/* Main title with gradient animation */}
              <motion.h1
                className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent bg-[length:200%_100%]"
                initial={{ opacity: 0, y: -30 }}
                animate={{ 
                  opacity: 1, 
                  y: 0,
                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
                }}
                transition={{
                  opacity: { duration: 0.8, delay: 0.2 },
                  y: { duration: 0.8, delay: 0.2, type: "spring", stiffness: 100 },
                  backgroundPosition: { duration: 3, repeat: Infinity, ease: "linear" }
                }}
              >
                Which game should you play next?
              </motion.h1>

              {/* Subtitle */}
              <motion.p
                className="text-xl md:text-2xl text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                Answer a few quick questions and we'll match you with mobile games you'll actually enjoy.
              </motion.p>

              {/* Start button with futuristic style */}
              <motion.button
                onClick={handleStart}
                className="relative group px-12 py-6 rounded-2xl overflow-hidden font-bold text-xl text-white"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.6, type: "spring" }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.3) 0%, rgba(236, 72, 153, 0.3) 100%)',
                  border: '2px solid rgba(139, 92, 246, 0.5)',
                  boxShadow: '0 8px 32px rgba(139, 92, 246, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                }}
              >
                {/* Animated gradient background */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600"
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
                
                {/* Shimmer effect */}
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
                
                {/* Neon glow */}
                <motion.div
                  className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100"
                  style={{
                    boxShadow: '0 0 40px rgba(139, 92, 246, 0.6), 0 0 80px rgba(236, 72, 153, 0.4)'
                  }}
                  transition={{ duration: 0.3 }}
                />

                <span className="relative z-10">
                  Start Quest
                </span>
              </motion.button>

              {/* Decorative elements */}
              <motion.div
                className="mt-16 flex items-center justify-center gap-2 text-sm text-gray-500"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                <div className="h-px w-16 bg-gradient-to-r from-transparent to-purple-500/50" />
                <span>Quick & Fun</span>
                <div className="h-px w-16 bg-gradient-to-l from-transparent to-purple-500/50" />
              </motion.div>
            </div>
          </motion.div>
        )}

        {state === 'questions' && (
          <motion.div
            key="questions"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="relative z-10"
          >
            <QuizFlow onComplete={handleComplete} />
          </motion.div>
        )}

        {state === 'loading' && (
          <motion.div
            key="loading"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="min-h-screen flex items-center justify-center relative z-10"
          >
            <div className="text-center">
              {/* Animated loader with particles */}
              <div className="relative mb-8">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="w-20 h-20 mx-auto"
                >
                  <Loader2 className="w-full h-full text-purple-400" />
                </motion.div>
                
                {/* Orbiting particles */}
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute top-1/2 left-1/2 w-3 h-3 bg-pink-400 rounded-full"
                    animate={{
                      rotate: 360,
                      x: Math.cos((i * 120) * Math.PI / 180) * 50,
                      y: Math.sin((i * 120) * Math.PI / 180) * 50,
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "linear",
                      delay: i * 0.2
                    }}
                    style={{ transformOrigin: '0 0' }}
                  />
                ))}
              </div>

              <motion.p
                className="text-xl text-gray-300 font-medium"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                Finding your perfect games...
              </motion.p>
              
              <motion.p
                className="text-sm text-gray-500 mt-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                Matching your preferences with our game library
              </motion.p>
            </div>
          </motion.div>
        )}

        {state === 'results' && (
          <motion.div
            key="results"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="min-h-screen py-8 relative z-10"
          >
            <QuizResults results={results} onRetake={handleRetake} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

