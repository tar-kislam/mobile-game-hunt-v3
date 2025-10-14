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
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="border border-transparent bg-gradient-to-br from-purple-900/60 via-purple-800/40 to-violet-900/60 p-[1px] rounded-2xl shadow-[0_0_30px_rgba(168,85,247,0.4)]"
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isVisible ? 1 : 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className={`relative bg-gradient-to-br from-gray-900/80 via-black/70 to-gray-900/80 backdrop-blur-xl rounded-2xl border-gray-800/50 shadow-lg transition-all duration-500 hover:shadow-[0_0_40px_rgba(168,85,247,0.6)] py-8 px-6 text-center overflow-hidden ${className}`}
      >
        {/* Background gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-transparent to-blue-900/20 rounded-t-none rounded-b-2xl" />
      
      {/* Animated title with ReactBits-style effects */}
      <motion.h1
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
        className="relative text-3xl md:text-4xl lg:text-5xl font-bold mb-6"
      >
        {/* Main title with enhanced gradient */}
        <motion.span 
          className="shiny-text bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent relative inline-block"
          animate={{
            backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{
            backgroundSize: "200% 200%",
          }}
        >
          {title}
        </motion.span>
        
        {/* Enhanced floating particles with ReactBits-style animation */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1.5 h-1.5 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full opacity-70"
              style={{
                left: `${15 + i * 12}%`,
                top: `${25 + (i % 3) * 25}%`,
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0.3, 1, 0.3],
                scale: [0.8, 1.4, 0.8],
                rotate: [0, 180, 360],
              }}
              transition={{
                duration: 4 + i * 0.3,
                repeat: Infinity,
                delay: i * 0.2,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
        
        {/* Spotlight effect overlay */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0"
          animate={{
            opacity: [0, 0.3, 0],
            x: ["-100%", "100%"],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: 1,
            ease: "easeInOut",
          }}
        />
      </motion.h1>

      {/* Enhanced animated subtitle with typewriter effect */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
        className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed relative"
      >
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="relative inline-block"
        >
          {subtitle}
        </motion.p>
        
        {/* Subtle underline animation */}
        <motion.div
          className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-purple-400 to-blue-400"
          initial={{ width: 0 }}
          animate={{ width: "100%" }}
          transition={{ duration: 1.2, delay: 1.2, ease: "easeOut" }}
        />
      </motion.div>

        {/* Enhanced decorative elements with ReactBits-style animations */}
        <motion.div 
          className="absolute top-4 left-4 w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full opacity-60"
          animate={{ 
            scale: [1, 1.3, 1],
            opacity: [0.6, 1, 0.6],
            rotate: [0, 180, 360]
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute top-8 right-8 w-1.5 h-1.5 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full opacity-70"
          animate={{ 
            scale: [1, 1.4, 1],
            opacity: [0.7, 1, 0.7],
            y: [0, -10, 0]
          }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        />
        <motion.div 
          className="absolute bottom-6 left-8 w-1.5 h-1.5 bg-gradient-to-r from-purple-300 to-violet-300 rounded-full opacity-60"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.6, 0.9, 0.6],
            x: [0, 5, 0]
          }}
          transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
        <motion.div 
          className="absolute bottom-4 right-4 w-2 h-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full opacity-50"
          animate={{ 
            scale: [1, 1.3, 1],
            opacity: [0.5, 0.8, 0.5],
            rotate: [0, -180, -360]
          }}
          transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
        />
        
        {/* Additional floating elements */}
        <motion.div 
          className="absolute top-1/2 left-1/4 w-1 h-1 bg-purple-400 rounded-full opacity-40"
          animate={{ 
            y: [0, -15, 0],
            opacity: [0.4, 0.8, 0.4]
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute top-1/3 right-1/3 w-1 h-1 bg-blue-400 rounded-full opacity-50"
          animate={{ 
            y: [0, -20, 0],
            opacity: [0.5, 0.9, 0.5]
          }}
          transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
      </motion.div>
    </motion.div>
  )
}

export default AnimatedHeader
