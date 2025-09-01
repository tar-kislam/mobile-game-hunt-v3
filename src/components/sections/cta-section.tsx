"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import PixelBlast from '@/components/effects/pixel-blast'
import FuzzyText from '@/components/effects/fuzzy-text'
import ShinyText from '@/components/ui/shiny-text'
import { toast } from 'sonner'
import { useTheme } from 'next-themes'


export function CTASection() {
  const { resolvedTheme } = useTheme()
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const brandColor = resolvedTheme === 'dark' ? '#ffffff' : '#000000'

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
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success('Welcome to the early community! We\'ll be in touch soon.')
      setEmail('')
    } catch (error) {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="relative w-full h-[500px] md:h-[600px] lg:h-[700px] overflow-hidden mb-12">
      {/* Pixel Blast Background */}
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
      <div className="relative z-20 flex flex-col items-center justify-center h-full px-4 text-center">
        <div className="max-w-5xl mx-auto space-y-10">
          {/* Fuzzy Brand Title */}
          <div className="space-y-4">
            <div className="flex justify-center">
              <FuzzyText
                fontSize="clamp(2rem, 8vw, 6rem)"
                fontWeight={900}
                color={brandColor}
                enableHover={true}
                baseIntensity={0.2}
                hoverIntensity={0.5}
              >
                Mobile Game Hunt
              </FuzzyText>
            </div>
            <p className="text-lg md:text-xl lg:text-2xl text-muted-foreground max-w-3xl mx-auto">
              Discover the best mobile games, curated by the gaming community.
            </p>
          </div>

          {/* CTA Message */}
          <div className="space-y-6">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold text-foreground leading-tight mb-8" style={{ fontFamily: "'Roboto Mono', monospace" }}>
              Be part of the beginning.{' '}
              <span className="text-primary">Join our early community</span>{' '}
              and help shape the future of Mobile Game Hunt.
            </h2>
            
            {/* Futuristic Email Form */}
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 items-center w-full max-w-lg mx-auto">
              <div 
                className="w-full flex-1 p-1 rounded-md relative animate-pulse"
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
            </form>
            
            {/* Additional text */}
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
              Get exclusive early access, shape new features, and be the first to discover the next big mobile games.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
