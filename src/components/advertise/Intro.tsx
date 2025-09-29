"use client"

import React, { useEffect } from 'react'
import { motion } from 'framer-motion'

interface IntroProps {
  firstName: string
  onComplete: () => void
}

export default function Intro({ firstName, onComplete }: IntroProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete()
    }, 1200) // 1.2 seconds to match the animation duration

    return () => clearTimeout(timer)
  }, [onComplete])

  return (
    <div className="w-full flex items-center justify-center p-4">
      <div className="text-center space-y-6 max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="space-y-4"
        >
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent text-center">
            Welcome back, {firstName}!
          </h1>
          
          <h2 className="text-xl md:text-2xl text-gray-300 font-medium text-center">
            Let's get your game noticed.
          </h2>
        </motion.div>
      </div>
    </div>
  )
}
