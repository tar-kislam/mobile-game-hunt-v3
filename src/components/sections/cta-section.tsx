"use client"

import { motion, useReducedMotion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import Particles from '@/components/effects/Particles'
import FuzzyText from '@/components/effects/fuzzy-text'
import Link from 'next/link'
import { LuGamepad2 } from 'react-icons/lu'
import { IoPeople } from 'react-icons/io5'
import { HiOutlineChat } from 'react-icons/hi'

export function CTASection() {
  const brandColor = '#ffffff'
  
  // Performance: Respect user's motion preferences
  const shouldReduceMotion = useReducedMotion()

  return (
    <section className="relative w-full h-[500px] md:h-[600px] lg:h-[700px] overflow-hidden mb-12">
      {/* Particles Background */}
      <div className="absolute inset-0 z-0">
        <Particles
          particleColors={['#8B5CF6', '#A78BFA', '#C4B5FD']}
          particleCount={200}
          particleSpread={10}
          speed={0.1}
          particleBaseSize={100}
          moveParticlesOnHover={true}
          alphaParticles={false}
          disableRotation={false}
        />
      </div>
      
      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background/80 z-10" />
      
      {/* Content */}
      <div className="relative z-20 flex flex-col items-center justify-center h-full px-4 text-center">
        <div className="max-w-5xl mx-auto space-y-10">
          {/* Mobile Layout: Perfect vertical stack - Logo > Text > Buttons */}
          <div className="block md:hidden w-full flex flex-col items-center justify-center min-h-[80vh] px-4">
            
            {/* 1. LOGO - Lower position */}
            <motion.div
              initial={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.8, y: shouldReduceMotion ? 0 : -20 }}
              animate={{ 
                opacity: 1, 
                scale: 1,
                y: shouldReduceMotion ? 0 : [0, -3, 0],
              }}
              transition={{ 
                duration: shouldReduceMotion ? 0.01 : 0.8, 
                delay: shouldReduceMotion ? 0 : 0.1, 
                ease: 'easeOut',
                y: {
                  duration: 4,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }
              }}
              className="flex justify-center mb-4 mt-8"
            >
              <motion.img 
                src="/logo/mgh.png" 
                alt="Fox mascot of Mobile Game Hunt" 
                className="object-contain h-16 w-16"
                style={{
                  filter: 'drop-shadow(0 0 15px rgba(139, 92, 246, 0.4))',
                }}
                whileHover={shouldReduceMotion ? {} : { 
                  scale: 1.05,
                  filter: 'drop-shadow(0 0 20px rgba(139, 92, 246, 0.6))',
                  transition: { duration: 0.3 }
                }}
                onError={(e) => {
                  e.currentTarget.src = '/logo/moblogo.png';
                }}
              />
            </motion.div>

            {/* 2. TEXT - Compact and no overflow */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col items-center justify-center text-center mb-6 w-full px-2"
            >
              {/* Main Title - Mobile: Very small and centered */}
              <motion.h1
                initial={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: shouldReduceMotion ? 0.01 : 0.8, delay: shouldReduceMotion ? 0 : 0.4, ease: 'easeOut' }}
                className="mb-3 text-center w-full"
              >
                <div className="flex flex-col items-center justify-center space-y-1">
                  <div className="text-center">
                    <span 
                      className="text-white font-bold"
                      style={{ 
                        fontSize: '14px',
                        lineHeight: '1.2',
                        textShadow: '0 0 8px rgba(168, 85, 247, 0.6)'
                      }}
                    >
                      Mobile Game
                    </span>
                  </div>
                  <div className="text-center">
                    <span 
                      className="text-white font-bold"
                      style={{ 
                        fontSize: '14px',
                        lineHeight: '1.2',
                        textShadow: '0 0 8px rgba(168, 85, 247, 0.6)'
                      }}
                    >
                      Hunt
                    </span>
                  </div>
                </div>
              </motion.h1>

              {/* Tagline - Compact */}
              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="text-xs text-gray-300 leading-relaxed px-3 max-w-[300px]"
                style={{ 
                  fontFamily: '"Underdog", cursive',
                  textShadow: '0 0 6px rgba(168, 85, 247, 0.3)'
                }}
              >
                Join the hunt — submit games, cast your votes, and rise to the top!
              </motion.h2>
            </motion.div>

            {/* 3. BUTTONS - Bottom */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="flex flex-col items-center justify-center w-full max-w-xs space-y-3"
            >
              <Link href="/submit" className="w-full">
                <Button 
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-full font-semibold transition-all duration-300 hover:shadow-[0_0_25px_rgba(168,85,247,0.7)] hover:scale-105 text-sm"
                >
                  Submit Game
                </Button>
              </Link>
              
              <Link href="/community" className="w-full">
                <Button 
                  variant="outline"
                  className="w-full bg-transparent border-2 border-purple-500/70 text-purple-300 hover:text-white hover:bg-purple-500/20 px-8 py-3 rounded-full font-semibold transition-all duration-300 hover:shadow-[0_0_20px_rgba(168,85,247,0.5)] hover:border-purple-400 hover:scale-105 text-sm"
                >
                  Join Community
                </Button>
              </Link>
            </motion.div>

            {/* 4. STATS - Very Bottom (Optional) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.0 }}
              className="grid grid-cols-3 gap-4 w-full max-w-xs mt-8"
            >
              {/* Stat 1 */}
              <section className="text-center">
                <div className="mb-1 flex justify-center">
                  <div className="text-base drop-shadow-[0_0_4px_rgba(168,85,247,0.6)]" style={{ color: '#a855f7' }}>
                    <LuGamepad2 />
                  </div>
                </div>
                <div className="text-sm font-bold text-white mb-0.5">100+</div>
                <p className="text-xs text-gray-400 leading-tight">Games</p>
              </section>

              {/* Stat 2 */}
              <section className="text-center">
                <div className="mb-1 flex justify-center">
                  <div className="text-base drop-shadow-[0_0_4px_rgba(168,85,247,0.6)]" style={{ color: '#a855f7' }}>
                    <IoPeople />
                  </div>
                </div>
                <div className="text-sm font-bold text-white mb-0.5">10k+</div>
                <p className="text-xs text-gray-400 leading-tight">Members</p>
              </section>

              {/* Stat 3 */}
              <section className="text-center">
                <div className="mb-1 flex justify-center">
                  <div className="text-base drop-shadow-[0_0_4px_rgba(168,85,247,0.6)]" style={{ color: '#a855f7' }}>
                    <HiOutlineChat />
                  </div>
                </div>
                <div className="text-sm font-bold text-white mb-0.5">250+</div>
                <p className="text-xs text-gray-400 leading-tight">Reviews</p>
              </section>
            </motion.div>
          </div>

          {/* Desktop Layout: Keep existing design */}
          <div className="hidden md:block">
            {/* Hero Content with Title and Avatar */}
            <div className="flex flex-col lg:flex-row items-center justify-center lg:justify-between w-full max-w-5xl mx-auto mb-8 gap-4 lg:gap-2">
              {/* Left side - Title */}
              <div className="flex-1 text-left mb-8 lg:mb-0">
                <div className="flex flex-col">
                  <motion.div
                    initial={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: shouldReduceMotion ? 0.01 : 0.8, delay: shouldReduceMotion ? 0 : 0.3, ease: 'easeOut' }}
                  >
                    <FuzzyText
                      fontSize={80}
                      fontWeight={900}
                      color={brandColor}
                      enableHover={true}
                      baseIntensity={0.2}
                      hoverIntensity={0.5}
                    >
                      Mobile Game
                    </FuzzyText>
                  </motion.div>
                  <div className="flex justify-end">
                    <div className="mr-0">
                      <motion.div
                        initial={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: shouldReduceMotion ? 0.01 : 0.8, delay: shouldReduceMotion ? 0 : 0.3, ease: 'easeOut' }}
                      >
              <FuzzyText
                fontSize={80}
                fontWeight={900}
                color={brandColor}
                enableHover={true}
                baseIntensity={0.2}
                hoverIntensity={0.5}
              >
                          Hunt
              </FuzzyText>
                      </motion.div>
                    </div>
                  </div>
            </div>
          </div>

              {/* Right side - Clean Avatar (no circular background) */}
              <motion.div
                initial={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.8, y: shouldReduceMotion ? 0 : -20 }}
                animate={{ 
                  opacity: 1, 
                  scale: 1,
                  y: shouldReduceMotion ? 0 : [0, -15, 0],
                }}
                transition={{ 
                  duration: shouldReduceMotion ? 0.01 : 0.8, 
                  delay: shouldReduceMotion ? 0 : 0.3,
                  ease: 'easeOut',
                  y: {
                    duration: 4,
                    repeat: Infinity,
                    ease: 'easeInOut'
                  }
                }}
                className="flex-shrink-0 lg:-ml-8 xl:-ml-12"
              >
                <motion.img 
                  src="/logo/mgh.png" 
                  alt="Fox mascot of Mobile Game Hunt" 
                  className="w-36 h-36 md:w-44 md:h-44 lg:w-52 lg:h-52 object-contain"
                  style={{
                    filter: 'drop-shadow(0 0 25px rgba(139, 92, 246, 0.6))',
                  }}
                  whileHover={shouldReduceMotion ? {} : { 
                    scale: 1.15,
                    rotate: [0, -8, 8, -8, 0],
                    filter: 'drop-shadow(0 0 40px rgba(139, 92, 246, 1))',
                    transition: { 
                      duration: 0.8,
                      rotate: {
                        duration: 0.6,
                        ease: 'easeInOut'
                      }
                    }
                  }}
                  onError={(e) => {
                    e.currentTarget.src = '/logo/moblogo.png';
                  }}
                />
              </motion.div>
              </div>

            {/* CTA Text */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-center mb-6"
            >
              <p 
                className="text-lg md:text-xl font-semibold text-white"
                style={{
                  fontFamily: '"Underdog", cursive',
                  textShadow: '0 0 10px rgba(168, 85, 247, 0.5)'
                }}
              >
                Join the Hunt — Submit games, cast your votes, and rise to the top!
              </p>
            </motion.div>

            {/* Action Buttons - positioned above stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="flex items-center justify-center mb-8"
            >
              {/* Wrapper defines width based on first row buttons; newsletter fills full width below */}
              <div className="inline-block">
                <div className="inline-flex gap-3 sm:gap-4 items-center justify-center w-full">
                  <Link href="/submit">
                    <Button 
                      className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-full font-semibold transition-all duration-300 hover:shadow-[0_0_30px_rgba(168,85,247,0.8)] hover:scale-105"
                    >
                      Submit Game
                    </Button>
                  </Link>
                  
                  <Link href="/community">
                    <Button 
                      variant="outline"
                      className="bg-transparent border-2 border-purple-500/70 text-purple-300 hover:text-white hover:bg-purple-500/20 px-8 py-3 rounded-full font-semibold transition-all duration-300 hover:shadow-[0_0_25px_rgba(168,85,247,0.6)] hover:border-purple-400 hover:scale-105"
                    >
                      Join Community
                    </Button>
                  </Link>
                </div>

                {/* Newsletter CTA - full width under the two buttons */}
                <div className="mt-3 sm:mt-4">
                  <Button
                    onClick={() => (window as any)?.dispatchEvent?.(new CustomEvent('newsletter:open'))}
                    className="w-full p-[2px] rounded-full bg-gradient-to-r from-purple-500 via-blue-500 to-pink-500 [background-size:200%_200%] [background-position:0%_50%] hover:[background-position:100%_50%] transition-all duration-300 shadow-md hover:shadow-purple-500/50 hover:scale-105"
                  >
                    <span className="block w-full text-center px-8 sm:px-16 py-3 rounded-full bg-black/90 text-white font-semibold">
                      Subscribe to Newsletter
                    </span>
                  </Button>
                </div>
              </div>
            </motion.div>

            {/* Transparent Stats Row - below buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="flex flex-col sm:flex-row gap-6 sm:gap-8 items-center justify-center"
            >
              {/* Stat 1: Curated Games */}
              <div className="text-center hover:scale-105 transition-all duration-300">
                <div className="mb-2 flex justify-center">
                  <div className="text-3xl drop-shadow-[0_0_6px_rgba(168,85,247,0.8)]" style={{ color: '#a855f7' }}>
                    <LuGamepad2 />
                  </div>
                </div>
                <div className="text-2xl font-bold text-white mb-1">100+</div>
                <div className="text-sm text-gray-400">Curated Games</div>
              </div>

              {/* Stat 2: Community Members */}
              <div className="text-center hover:scale-105 transition-all duration-300">
                <div className="mb-2 flex justify-center">
                  <div className="text-3xl drop-shadow-[0_0_6px_rgba(168,85,247,0.8)]" style={{ color: '#a855f7' }}>
                    <IoPeople />
                  </div>
                </div>
                <div className="text-2xl font-bold text-white mb-1">10k+</div>
                <div className="text-sm text-gray-400">Community Members</div>
              </div>

              {/* Stat 3: User Reviews */}
              <div className="text-center hover:scale-105 transition-all duration-300">
                <div className="mb-2 flex justify-center">
                  <div className="text-3xl drop-shadow-[0_0_6px_rgba(168,85,247,0.8)]" style={{ color: '#a855f7' }}>
                    <HiOutlineChat />
                  </div>
                </div>
                <div className="text-2xl font-bold text-white mb-1">250+</div>
                <div className="text-sm text-gray-400">User Reviews</div>
              </div>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  )
}
