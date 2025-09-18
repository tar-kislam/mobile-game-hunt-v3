"use client"

import React, { useEffect, useMemo } from "react"

type SplitType = "chars" | "words"

interface SplitTextProps {
  text: string
  className?: string
  delay?: number // per item delay in ms
  duration?: number // seconds
  ease?: string
  splitType?: SplitType
  from?: { opacity?: number; y?: number }
  to?: { opacity?: number; y?: number }
  threshold?: number
  rootMargin?: string
  textAlign?: "left" | "center" | "right"
  onLetterAnimationComplete?: () => void
}

export default function SplitText(props: SplitTextProps) {
  const {
    text,
    className,
    delay = 80,
    duration = 0.6,
    splitType = "chars",
    from = { opacity: 0, y: 40 },
    to = { opacity: 1, y: 0 },
    textAlign = "center",
    onLetterAnimationComplete,
  } = props

  const parts = useMemo(() => {
    if (splitType === "words") return text.split(/(\s+)/)
    return Array.from(text)
  }, [text, splitType])

  useEffect(() => {
    // Fallback callback after all items would have animated
    const totalMs = delay * (parts.length - 1) + duration * 1000 + 50
    const t = window.setTimeout(() => onLetterAnimationComplete?.(), Math.max(0, totalMs))
    return () => window.clearTimeout(t)
  }, [delay, duration, parts.length, onLetterAnimationComplete])

  return (
    <div className={className} style={{ textAlign, visibility: 'visible' }} aria-label={text}>
      {parts.map((p, i) => {
        const isSpace = p === " "
        const style: React.CSSProperties = {
          display: isSpace ? "inline" : "inline-block",
          transition: `transform ${duration}s, opacity ${duration}s`,
          transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
          transform: `translateY(${from.y ?? 0}px)`,
          opacity: from.opacity ?? 0,
          willChange: "transform, opacity",
        }
        // Trigger animation on mount
        const onRef = (el: HTMLSpanElement | null) => {
          if (!el) return
          const start = () => {
            requestAnimationFrame(() => {
              el.style.transitionDelay = `${i * delay}ms`
              el.style.transform = `translateY(${to.y ?? 0}px)`
              el.style.opacity = `${to.opacity ?? 1}`
            })
          }
          // Start immediately
          start()
        }
        return (
          <span key={i} ref={onRef} style={style} aria-hidden>
            {p}
          </span>
        )
      })}
    </div>
  )
}


