"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { XIcon } from 'lucide-react'
import ShinyText from '@/components/ui/shiny-text'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import PixelBlast from '@/components/effects/pixel-blast'

interface NewsletterModalProps {
  isOpen: boolean
  onClose: () => void
  onSubscribed?: () => void
  onDismissed?: () => void
}

export function NewsletterModal({ isOpen, onClose, onSubscribed, onDismissed }: NewsletterModalProps) {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const brandColor = '#ffffff'

  // Handle close with dismissal tracking
  const handleClose = () => {
    if (onDismissed) {
      onDismissed()
    }
    onClose()
  }

  // Handle ESC key press
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        handleClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscKey)
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey)
    }
  }, [isOpen, onClose])

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email.trim()) {
      toast.error('Please enter your email address')
      return
    }

    if (!validateEmail(email)) {
      toast.error('Please enter a valid email address')
      return
    }

    setIsSubmitting(true)
    
    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success(data.message || 'Welcome to the early community! We\'ll be in touch soon.')
        setEmail('')
        
        // Mark as subscribed in localStorage
        if (onSubscribed) {
          onSubscribed()
        }
        
        // Close modal after 2 seconds
        setTimeout(() => {
          onClose()
        }, 2000)
      } else {
        if (response.status === 409) {
          toast.info('You\'re already subscribed to our newsletter!')
          // Mark as subscribed even if already exists
          if (onSubscribed) {
            onSubscribed()
          }
        } else {
          toast.error(data.error || 'Something went wrong. Please try again.')
        }
      }
    } catch (error) {
      console.error('Newsletter subscription error:', error)
      toast.error('Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

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
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-zinc-900 border border-purple-600 shadow-xl rounded-2xl max-w-5xl w-full mx-auto p-8 relative overflow-hidden">
              {/* Pixel Blast Background - Same as hero section */}
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
                {/* Close Button (pushed further to the corner) */}
                <button
                  onClick={handleClose}
                  className="absolute -top-3 -right-3 p-2 rounded-full bg-black/60 border border-white/10 text-gray-300 hover:text-white hover:bg-white/10 transition-colors z-30"
                  aria-label="Close"
                >
                  <XIcon className="h-4 w-4" />
                </button>

              {/* Content - Hero Section Style */}
              <div className="text-center space-y-10">
                {/* CTA Message */}
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                  className="text-center mb-8"
                >
                  {/* Title Text */}
                  <h2 className="text-xl md:text-2xl lg:text-3xl font-semibold text-foreground leading-tight" style={{ fontFamily: "'Roboto Mono', monospace" }}>
                    Be part of the beginning.{' '}
                    <span className="text-primary">Join our early community</span>{' '}
                    and help shape the future of Mobile Game Hunt.
                  </h2>
                </motion.div>

                {/* Futuristic Email Form with Logo - Same as hero section */}
                <motion.form
                  onSubmit={handleSubmit}
                  className="flex flex-col lg:flex-row gap-6 items-center justify-center w-full mx-auto"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                >
                  {/* Logo and Input Container */}
                  <div className="flex items-center gap-4 w-full lg:w-auto">
                    {/* Logo */}
                    <img
                      src="/logo/mgh-newsletter.png"
                      alt="Mobile Game Hunt Logo"
                      className="object-contain flex-shrink-0"
                      style={{ width: '150px', height: '150px' }}
                      onError={(e) => {
                        e.currentTarget.src = '/logo/moblogo.png';
                      }}
                    />
                    
                    {/* Input Field */}
                    <div 
                      className="w-full lg:w-[450px] p-1 rounded-md relative animate-pulse"
                      style={{
                        background: 'linear-gradient(45deg, rgba(177, 158, 239, 0.3), rgba(177, 158, 239, 0.1))',
                        borderRadius: '8px',
                        boxShadow: '0 0 20px rgba(177, 158, 239, 0.3), inset 0 0 20px rgba(177, 158, 239, 0.1)',
                        border: '1px solid rgba(177, 158, 239, 0.4)',
                        animation: 'pulse 2s infinite',
                      }}
                    >
                      {/* Corner decorations */}
                      <div className="absolute top-0 left-0 w-3 h-3 border-l-2 border-t-2 border-purple-400 animate-pulse"></div>
                      <div className="absolute top-0 right-0 w-3 h-3 border-r-2 border-t-2 border-purple-400 animate-pulse"></div>
                      <div className="absolute bottom-0 left-0 w-3 h-3 border-l-2 border-b-2 border-purple-400 animate-pulse"></div>
                      <div className="absolute bottom-0 right-0 w-3 h-3 border-r-2 border-b-2 border-purple-400 animate-pulse"></div>
                      
                      <input
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={isSubmitting}
                        className="w-full p-3 bg-transparent outline-none text-white placeholder:text-gray-300 rounded-md focus:shadow-[0_0_25px_rgba(177,158,239,0.8)] hover:shadow-[0_0_15px_rgba(177,158,239,0.4)] transition-all duration-500"
                        style={{
                          background: 'rgba(0, 0, 0, 0.5)',
                          border: 'none',
                          backdropFilter: 'blur(15px)',
                        }}
                        required
                      />
                    </div>
                  </div>

                  {/* Join Now Button - Same as hero section */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-8 py-3 font-bold rounded-md transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(177,158,239,0.8)] focus:outline-none focus:ring-2 focus:ring-purple-400 active:scale-95 text-white"
                    style={{
                      background: 'rgba(60, 41, 100, 1)',
                      border: '1px solid rgba(177, 158, 239, 0.5)',
                      boxShadow: '0 0 15px rgba(177, 158, 239, 0.4)',
                      backdropFilter: 'blur(10px)',
                    }}
                  >
                    <ShinyText 
                      text={isSubmitting ? 'Joining...' : 'Join Now'} 
                      disabled={isSubmitting} 
                      speed={3} 
                      className="cta-button" 
                    />
                  </button>
                </motion.form>
                
                {/* Additional text - Same as hero section */}
                <motion.p
                  className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                >
                  Get exclusive early access, shape new features, and be the first to discover the next big mobile games.
                </motion.p>
              </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
