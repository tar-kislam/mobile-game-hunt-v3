/**
 * FallbackImage Component
 * 
 * A robust image component with comprehensive fallback handling
 * for cases where images fail to load or are missing.
 */

import Image from 'next/image'
import { useState } from 'react'
import { cn } from '@/lib/utils'

interface FallbackImageProps {
  src: string | null | undefined
  alt: string
  fallback?: string | React.ReactNode
  className?: string
  fill?: boolean
  width?: number
  height?: number
  sizes?: string
  priority?: boolean
  unoptimized?: boolean
  onClick?: () => void
}

export function FallbackImage({
  src,
  alt,
  fallback,
  className,
  fill = false,
  width,
  height,
  sizes,
  priority = false,
  unoptimized = true,
  onClick,
  ...props
}: FallbackImageProps) {
  const [hasError, setHasError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Default fallback content
  const defaultFallback = (
    <div className={cn(
      "w-full h-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white",
      className
    )}>
      <div className="text-center">
        <div className="mb-2">
          <img src="/logo/logo-gamepad.webp" alt="Game" className="w-10 h-10" />
        </div>
        <div className="text-xs opacity-75">No Image</div>
      </div>
    </div>
  )

  const handleError = () => {
    setHasError(true)
    setIsLoading(false)
  }

  const handleLoad = () => {
    setIsLoading(false)
    setHasError(false)
  }

  // If no src or error occurred, show fallback
  if (!src || hasError) {
    return (
      <div 
        className={cn("relative", fill && "absolute inset-0", className)}
        onClick={onClick}
        {...props}
      >
        {fallback || defaultFallback}
      </div>
    )
  }

  // Show loading state
  if (isLoading) {
    return (
      <div 
        className={cn(
          "relative bg-gray-200 animate-pulse flex items-center justify-center",
          fill && "absolute inset-0",
          className
        )}
        onClick={onClick}
        {...props}
      >
        <div className="text-gray-400 text-sm">Loading...</div>
      </div>
    )
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill={fill}
      width={!fill ? width : undefined}
      height={!fill ? height : undefined}
      sizes={sizes}
      priority={priority}
      unoptimized={unoptimized}
      className={cn("transition-opacity duration-200", className)}
      onError={handleError}
      onLoad={handleLoad}
      onClick={onClick}
      {...props}
    />
  )
}

/**
 * Game-specific fallback image component
 */
interface GameFallbackImageProps extends Omit<FallbackImageProps, 'fallback'> {
  gameTitle?: string
  variant?: 'hero' | 'card' | 'thumbnail'
}

export function GameFallbackImage({ 
  gameTitle, 
  variant = 'card', 
  ...props 
}: GameFallbackImageProps) {
  const getFallbackContent = () => {
    const baseStyle = "w-full h-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white"
    
    switch (variant) {
      case 'hero':
        return (
          <div className={cn(baseStyle, "text-center p-8")}>
            <div className="mb-4">
              <img src="/logo/logo-gamepad.webp" alt="Game" className="w-32 h-32" />
            </div>
            <div className="text-lg font-semibold">{gameTitle || 'Featured Game'}</div>
            <div className="text-sm opacity-75 mt-2">No image available</div>
          </div>
        )
      case 'thumbnail':
        return (
          <div className={cn(baseStyle, "text-center")}>
            <div>
              <img src="/logo/logo-gamepad.webp" alt="Game" className="w-6 h-6" />
            </div>
          </div>
        )
      case 'card':
      default:
        return (
          <div className={cn(baseStyle, "text-center p-4")}>
            <div className="mb-2">
          <img src="/logo/logo-gamepad.webp" alt="Game" className="w-10 h-10" />
        </div>
            <div className="text-xs opacity-75">{gameTitle || 'Game'}</div>
          </div>
        )
    }
  }

  return (
    <FallbackImage
      {...props}
      fallback={getFallbackContent()}
    />
  )
}

/**
 * User avatar fallback component
 */
interface AvatarFallbackImageProps extends Omit<FallbackImageProps, 'fallback'> {
  userName?: string
}

export function AvatarFallbackImage({ userName, ...props }: AvatarFallbackImageProps) {
  const getInitials = (name?: string) => {
    if (!name) return '?'
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const fallbackContent = (
    <div className="w-full h-full bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center text-white font-semibold">
      <span className="text-sm">{getInitials(userName)}</span>
    </div>
  )

  return (
    <FallbackImage
      {...props}
      fallback={fallbackContent}
    />
  )
}
