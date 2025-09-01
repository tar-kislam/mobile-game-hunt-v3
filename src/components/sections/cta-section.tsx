"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import PixelBlast from '@/components/effects/pixel-blast'
import FuzzyText from '@/components/effects/fuzzy-text'
import ShinyText from '@/components/ui/shiny-text'
import { toast } from 'sonner'

export function CTASection() {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

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
                color="#ffffff"
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
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold text-foreground leading-tight" style={{ fontFamily: "'Roboto Mono', monospace" }}>
              Be part of the beginning.{' '}
              <span className="text-primary">Join our early community</span>{' '}
              and help shape the future.
            </h2>
            
            {/* Email Form */}
            <form onSubmit={handleSubmit} className="w-full max-w-lg mx-auto">
              <div className="flex flex-col sm:flex-row gap-3">
                <Input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 bg-background/90 border-2 border-muted-foreground/20 text-foreground placeholder:text-muted-foreground focus:border-primary focus:bg-background transition-all duration-200 backdrop-blur-sm text-base py-3"
                  disabled={isSubmitting}
                />
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-8 py-3 bg-primary hover:bg-primary/90 font-semibold transition-all duration-200 shadow-lg hover:shadow-xl text-base"
                >
                  <ShinyText 
                    text={isSubmitting ? 'Joining...' : 'Join Now'} 
                    disabled={isSubmitting} 
                    speed={3} 
                    className="cta-button" 
                  />
                </Button>
              </div>
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
