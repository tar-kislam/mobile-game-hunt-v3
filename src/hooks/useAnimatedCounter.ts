import { useEffect, useState } from 'react'

interface UseAnimatedCounterProps {
  value: number
  duration?: number
  formatValue?: (value: number) => string
}

export function useAnimatedCounter({ 
  value, 
  duration = 1000,
  formatValue = (val) => val.toString()
}: UseAnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState(value)

  useEffect(() => {
    if (value !== displayValue) {
      const startValue = displayValue
      const endValue = value
      const startTime = Date.now()
      
      const animate = () => {
        const elapsed = Date.now() - startTime
        const progress = Math.min(elapsed / duration, 1)
        
        // Easing function for smooth animation
        const easeOutQuart = 1 - Math.pow(1 - progress, 4)
        const currentValue = startValue + (endValue - startValue) * easeOutQuart
        
        setDisplayValue(Math.floor(currentValue))
        
        if (progress < 1) {
          requestAnimationFrame(animate)
        }
      }
      
      requestAnimationFrame(animate)
    }
  }, [value, displayValue, duration])

  return formatValue(displayValue)
}

// Format function for displaying numbers with + suffix
export function formatStatNumber(value: number): string {
  if (value >= 1000) {
    const formatted = (value / 1000).toFixed(value >= 10000 ? 0 : 1)
    return `${formatted}k+`
  }
  // Always add + suffix for consistency
  return `${value}+`
}
