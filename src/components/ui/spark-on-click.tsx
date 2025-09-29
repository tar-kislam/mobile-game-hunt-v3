"use client"

import React from 'react'
import ClickSpark from '@/components/ui/ClickSpark'

type SparkOnClickProps = {
  children: React.ReactNode
  className?: string
  sparkColor?: string
  sparkSize?: number
  sparkRadius?: number
  sparkCount?: number
  duration?: number
}

export function SparkOnClick({
  children,
  className,
  sparkColor = '#a78bfa', // violet-400 neon-ish
  sparkSize = 10,
  sparkRadius = 15,
  sparkCount = 8,
  duration = 400,
}: SparkOnClickProps) {
  return (
    <ClickSpark
      className={className}
      sparkColor={sparkColor}
      sparkColors={["#ffffff", "#a78bfa", "#60a5fa"]}
      sparkSize={sparkSize}
      sparkRadius={sparkRadius}
      sparkCount={sparkCount}
      duration={duration}
      easing="ease-out"
      extraScale={1}
    >
      {children}
    </ClickSpark>
  )
}

export default SparkOnClick


