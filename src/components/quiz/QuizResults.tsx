"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, Play, RotateCcw, ArrowUpIcon, MessageCircleIcon } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { useState } from "react"

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
  matchedCategories?: string[]
  reasons: string[]
  metrics: {
    likes: number
  }
}

interface QuizResultsProps {
  results: QuizResult[]
  onRetake: () => void
}

export function QuizResults({ results, onRetake }: QuizResultsProps) {
  const [hoveredButton, setHoveredButton] = useState<string | null>(null)

  const handlePlayNow = (url: string | null | undefined) => {
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer')
    }
  }

  const quizUrl = typeof window !== 'undefined' ? `${window.location.origin}/quest` : ''

  // Track results shown
  if (typeof window !== 'undefined' && results.length > 0 && (window as any).gtag) {
      (window as any).gtag('event', 'quest_results_shown', {
      event_category: 'Quest',
      event_label: 'Game Discovery Quest',
      value: results[0].id
    })
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  }

  const titleVariants = {
    hidden: { 
      opacity: 0, 
      y: -30,
      scale: 0.9
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
        duration: 0.6
      }
    }
  }

  const subtitleVariants = {
    hidden: { 
      opacity: 0, 
      y: 20 
    },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        delay: 0.3,
        duration: 0.5,
        ease: "easeOut"
      }
    }
  }

  const buttonVariants = {
    hidden: { 
      opacity: 0, 
      scale: 0.8,
      y: 20
    },
    visible: { 
      opacity: 1, 
      scale: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 15
      }
    },
    hover: {
      scale: 1.05,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 10
      }
    },
    tap: {
      scale: 0.95
    }
  }

  const iconVariants = {
    rest: { rotate: 0 },
    hover: { rotate: 180, transition: { duration: 0.3 } }
  }

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8">
      {/* Header with animations */}
      <motion.div 
        className="text-center mb-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.h1 
          className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent bg-[length:200%_100%] relative"
          variants={titleVariants}
          style={{
            animation: 'gradient-shimmer 3s ease-in-out infinite'
          }}
        >
          Your Game Matches
        </motion.h1>
        <motion.p 
          className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed"
          variants={subtitleVariants}
        >
          Based on your answers, here are some mobile games you might enjoy.
        </motion.p>
      </motion.div>

      {/* Action Button with animations */}
      <motion.div 
        className="flex justify-center mb-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Retake Button - Futuristic Glassmorphism Style - Centered */}
        <motion.div
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
          onHoverStart={() => setHoveredButton('retake')}
          onHoverEnd={() => setHoveredButton(null)}
        >
          <Button
            variant="outline"
            onClick={onRetake}
            className="relative group px-8 py-4 rounded-2xl overflow-hidden transition-all duration-500 backdrop-blur-xl"
            style={{
              background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(236, 72, 153, 0.15) 100%)',
              border: '2px solid rgba(139, 92, 246, 0.4)',
              boxShadow: '0 8px 32px rgba(139, 92, 246, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
            }}
          >
            {/* Animated gradient overlay */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-purple-600/20"
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
            
            {/* Holographic shimmer effect */}
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000 skew-x-12" />
            
            {/* Neon glow on hover */}
            <motion.div
              className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{
                boxShadow: '0 0 30px rgba(139, 92, 246, 0.6), 0 0 60px rgba(236, 72, 153, 0.4)'
              }}
            />
            
            <motion.div
              variants={iconVariants}
              animate={hoveredButton === 'retake' ? 'hover' : 'rest'}
              className="inline-block relative z-10"
            >
              <RotateCcw className="w-5 h-5 mr-3 text-purple-300 group-hover:text-purple-200 transition-colors" />
            </motion.div>
            <span className="relative z-10 font-bold text-white text-lg tracking-wide group-hover:text-purple-100 transition-colors">
              Go Another Quest
            </span>
          </Button>
        </motion.div>
      </motion.div>

      {/* Empty State */}
      {results.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center py-16 px-4"
        >
          <motion.div
            animate={{ 
              rotate: [0, 10, -10, 10, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity,
              repeatDelay: 3
            }}
            className="text-6xl mb-6"
          >
            🎮😅
          </motion.div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Oops! No games found
          </h2>
          <p className="text-lg text-gray-400 mb-2 max-w-md mx-auto">
            We couldn't find any games that match your unique taste... yet!
          </p>
          <p className="text-base text-gray-500 mb-8 max-w-md mx-auto">
            Don't worry though - maybe your preferences are just too cool for the rest of us! 😎
          </p>
        </motion.div>
      ) : (
        <>
          {/* Results Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {results.map((game, index) => (
          <Link key={game.id} href={`/product/${game.slug}`} className="block group">
            <Card className="overflow-hidden bg-card hover:shadow-lg transition-all duration-300 border border-white/10 shadow-lg rounded-xl hover:shadow-black/20 h-full flex flex-col">
              {/* Game Image - Same style as landing page */}
              <div className="relative aspect-square bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                {game.thumbnail ? (
                  <Image
                    src={game.thumbnail}
                    alt={game.title}
                    fill
                    className="object-cover transition-transform duration-300"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    unoptimized={true}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.style.display = 'none';
                      if (e.currentTarget.parentElement) {
                        const fallback = e.currentTarget.parentElement.querySelector('.fallback-icon');
                        if (fallback) {
                          (fallback as HTMLElement).style.display = 'flex';
                        }
                      }
                    }}
                  />
                ) : null}
                
                {/* Fallback icon */}
                <div className={`fallback-icon absolute inset-0 flex items-center justify-center text-4xl text-gray-400 ${game.thumbnail ? 'hidden' : ''}`}>
                  <img src="/logo/logo-gamepad.webp" alt="Game" className="w-6 h-6" />
                </div>

                {/* Match Badge - Top Left (same position as platform badge in landing page) */}
                <div className="absolute top-3 left-3">
                  <Badge 
                    className="bg-black/70 text-white text-xs px-2 py-1 rounded-md font-medium border-0"
                  >
                    #{index + 1} Match
                  </Badge>
                </div>

                {/* Upvote Badge - Top Right (same style as landing page) */}
                <div className="absolute top-2 right-2">
                  <Badge 
                    variant="secondary" 
                    className="bg-[rgb(60,41,100)] text-white text-xs font-bold px-2 py-1 rounded-full shadow-sm"
                  >
                    ⭐ {game.metrics.likes}
                  </Badge>
                </div>
              </div>

              {/* Game Info - Same style as landing page */}
              <CardContent className="p-3 flex-1 flex flex-col">
                {/* Title */}
                <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100 line-clamp-1 mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {game.title}
                </h3>

                {/* Short Pitch or Tagline */}
                {(game.shortPitch || game.tagline) && (
                  <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-1 mb-2">
                    {game.shortPitch || game.tagline}
                  </p>
                )}

                {/* Why this game? - Quiz specific */}
                {game.reasons.length > 0 && (
                  <div className="mb-2">
                    <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                      {game.reasons.slice(0, 2).join(' • ')}
                    </p>
                  </div>
                )}

                {/* Stats - Same style as landing page */}
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-2 mt-auto">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <ArrowUpIcon className="w-3 h-3" />
                      <span className="font-medium">{game.metrics.likes}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <ExternalLink className="w-3 h-3" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
        </>
      )}
    </div>
  )
}

