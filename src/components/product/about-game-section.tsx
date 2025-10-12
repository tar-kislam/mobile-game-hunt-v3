'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronDown, ChevronUp } from 'lucide-react'

interface AboutGameSectionProps {
  description: string
}

export function AboutGameSection({ description }: AboutGameSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [showReadMore, setShowReadMore] = useState(false)
  const [previewText, setPreviewText] = useState('')
  const [fullText, setFullText] = useState('')
  const contentRef = useRef<HTMLDivElement>(null)
  const sectionRef = useRef<HTMLDivElement>(null)

  // Split text into words and create preview
  useEffect(() => {
    if (!description) return

    const words = description.trim().split(/\s+/)
    setFullText(description)

    // Show "Read More" if text is longer than 100 words or 500 characters
    if (words.length > 100 || description.length > 500) {
      setShowReadMore(true)
      // Show first 100 words or first 500 characters, whichever is shorter
      const wordLimit = Math.min(100, words.length)
      const charLimit = Math.min(500, description.length)
      
      let preview = ''
      if (words.slice(0, wordLimit).join(' ').length <= charLimit) {
        preview = words.slice(0, wordLimit).join(' ') + '...'
      } else {
        preview = description.substring(0, charLimit).trim() + '...'
      }
      
      setPreviewText(preview)
    } else {
      setShowReadMore(false)
      setPreviewText(description)
    }
  }, [description])

  const handleToggle = () => {
    setIsExpanded(!isExpanded)
    
    // Smooth scroll to section when expanding
    if (!isExpanded && sectionRef.current) {
      setTimeout(() => {
        sectionRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        })
      }, 200) // Delay to allow animation to start
    }
  }

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      handleToggle()
    }
  }

  if (!description) return null

  return (
    <Card 
      ref={sectionRef}
      className="rounded-3xl shadow-soft border-2 mt-6 bg-gradient-to-br from-gray-900/80 via-black/70 to-gray-900/80 backdrop-blur-xl border-gray-800/50 shadow-lg transition-all duration-500 hover:shadow-[0_0_40px_rgba(168,85,247,0.6)]"
    >
      <CardHeader className="pb-4">
        <h2 className="text-xl font-semibold text-white">
          About This Game
        </h2>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* Text Content */}
          <motion.div
            ref={contentRef}
            initial={false}
            animate={{ height: 'auto' }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <p className="text-gray-300 leading-relaxed whitespace-pre-wrap break-words">
              {isExpanded ? fullText : previewText}
            </p>
            
            {/* Fade overlay when collapsed */}
            <AnimatePresence>
              {!isExpanded && showReadMore && (
                <motion.div
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none"
                />
              )}
            </AnimatePresence>
          </motion.div>

          {/* Read More / Show Less Button */}
          {showReadMore && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="flex justify-center mt-6"
            >
              <Button
                onClick={handleToggle}
                onKeyDown={handleKeyDown}
                variant="outline"
                className="bg-purple-600/30 hover:bg-purple-600/50 border-purple-500/50 hover:border-purple-400 text-purple-200 hover:text-white transition-all duration-300 hover:shadow-[0_0_25px_rgba(168,85,247,0.6)] px-8 py-3 rounded-full font-medium text-sm"
                aria-expanded={isExpanded}
                aria-label={isExpanded ? 'Show less content' : 'Read more content'}
              >
                {isExpanded ? (
                  <>
                    <ChevronUp className="w-4 h-4 mr-2" />
                    Show Less
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4 mr-2" />
                    Read More
                  </>
                )}
              </Button>
            </motion.div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
