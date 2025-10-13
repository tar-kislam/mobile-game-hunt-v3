"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"

interface AnimatedHeaderProps {
  title: string
  subtitle: string
  className?: string
}

export function AnimatedHeader({ title, subtitle, className = "" }: AnimatedHeaderProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  return (
    <div className="border border-transparent bg-gradient-to-br from-purple-900/60 via-purple-800/40 to-violet-900/60 p-[1px] rounded-t-none rounded-b-2xl shadow-[0_0_30px_rgba(168,85,247,0.4)]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className={`relative bg-gradient-to-br from-gray-900/80 via-black/70 to-gray-900/80 backdrop-blur-xl rounded-t-none rounded-b-2xl border-gray-800/50 shadow-lg transition-all duration-500 hover:shadow-[0_0_40px_rgba(168,85,247,0.6)] pt-0 pb-6 px-6 text-center ${className}`}
      >
        {/* Background gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-transparent to-blue-900/20 rounded-t-none rounded-b-2xl" />
      
      {/* Animated title */}
      <motion.h1
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
        className="relative text-3xl md:text-4xl lg:text-5xl font-bold mb-4"
      >
        <span className="shiny-text bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent">
          {title}
        </span>
        
        {/* Floating particles effect */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-purple-400 rounded-full opacity-60"
              style={{
                left: `${20 + i * 15}%`,
                top: `${30 + (i % 2) * 40}%`,
              }}
              animate={{
                y: [0, -20, 0],
                opacity: [0.6, 1, 0.6],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 3 + i * 0.5,
                repeat: Infinity,
                delay: i * 0.3,
              }}
            />
          ))}
        </div>
      </motion.h1>

      {/* Animated subtitle */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
        className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed"
      >
        {subtitle}
      </motion.p>

        {/* Decorative elements */}
        <div className="absolute top-4 left-4 w-2 h-2 bg-purple-500 rounded-full opacity-50 animate-pulse" />
        <div className="absolute top-8 right-8 w-1 h-1 bg-blue-400 rounded-full opacity-70 animate-pulse" />
        <div className="absolute bottom-6 left-8 w-1.5 h-1.5 bg-purple-300 rounded-full opacity-60 animate-pulse" />
        <div className="absolute bottom-4 right-4 w-2 h-2 bg-blue-500 rounded-full opacity-40 animate-pulse" />
      </motion.div>
    </div>
  )
}

export default AnimatedHeader
