"use client"

import { useRef, useEffect, useState } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'

const springConfig = {
  damping: 25,
  stiffness: 120,
  mass: 1.5
}

interface TiltedGameCardProps {
  children: React.ReactNode
  className?: string
  scaleOnHover?: number
  rotateAmplitude?: number
}

export function TiltedGameCard({
  children,
  className = '',
  scaleOnHover = 1.02,
  rotateAmplitude = 8
}: TiltedGameCardProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [isMounted, setIsMounted] = useState(false)
  
  const rotateX = useSpring(0, springConfig)
  const rotateY = useSpring(0, springConfig)
  const scale = useSpring(1, springConfig)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current || !isMounted) return
    
    // Only apply on desktop (768px and above)
    if (typeof window !== 'undefined' && window.innerWidth < 768) return

    const rect = ref.current.getBoundingClientRect()
    const offsetX = e.clientX - rect.left - rect.width / 2
    const offsetY = e.clientY - rect.top - rect.height / 2

    const rotationX = (offsetY / (rect.height / 2)) * -rotateAmplitude
    const rotationY = (offsetX / (rect.width / 2)) * rotateAmplitude

    rotateX.set(rotationX)
    rotateY.set(rotationY)
  }

  const handleMouseEnter = () => {
    if (!isMounted) return
    
    // Only apply on desktop (768px and above)
    if (typeof window !== 'undefined' && window.innerWidth >= 768) {
      scale.set(scaleOnHover)
    }
  }

  const handleMouseLeave = () => {
    scale.set(1)
    rotateX.set(0)
    rotateY.set(0)
  }

  if (!isMounted) {
    return <div className={`w-full h-full ${className}`}>{children}</div>
  }

  return (
    <div className={`relative w-full h-full [perspective:1000px] ${className}`}>
      <motion.div
        ref={ref}
        className="relative w-full h-full [transform-style:preserve-3d] origin-center"
        style={{
          rotateX,
          rotateY,
          scale
        }}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Enhanced shadow for 3D effect - only on desktop */}
        <motion.div
          className="absolute inset-0 bg-black/10 rounded-xl blur-lg -z-10 hidden md:block"
          style={{
            scale,
            opacity: 0.5
          }}
        />
        
        {/* Card content */}
        <div className="relative w-full h-full [transform:translateZ(0)] [backface-visibility:hidden]">
          {children}
        </div>
      </motion.div>
    </div>
  )
}