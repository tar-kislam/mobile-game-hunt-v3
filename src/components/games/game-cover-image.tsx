"use client"

import Image from "next/image"
import { useEffect, useMemo, useState } from "react"
import { cn } from "@/lib/utils"
import {
  canOptimizeImage,
  FALLBACK_GAME_IMAGE,
  getGameImageUrl,
} from "@/lib/image-utils"

interface GameCoverImageProps {
  src?: string | null
  alt: string
  sizes?: string
  priority?: boolean
  quality?: number
  imageClassName?: string
  containerClassName?: string
  children?: React.ReactNode
  rounded?: string
  width?: number
  height?: number
  fill?: boolean
}

export function GameCoverImage({
  src,
  alt,
  sizes,
  priority = false,
  quality = 80,
  imageClassName,
  containerClassName,
  children,
  rounded = "rounded-lg",
  width,
  height,
  fill = true,
}: GameCoverImageProps) {
  const resolvedSrc = useMemo(() => getGameImageUrl(src), [src])
  const fallbackAbsolute = useMemo(
    () => getGameImageUrl(FALLBACK_GAME_IMAGE),
    [],
  )
  const [currentSrc, setCurrentSrc] = useState(resolvedSrc)

  useEffect(() => {
    setCurrentSrc(resolvedSrc)
  }, [resolvedSrc])

  const onError = () => {
    if (currentSrc !== fallbackAbsolute) {
      setCurrentSrc(fallbackAbsolute)
    }
  }

  const optimizable = useMemo(() => canOptimizeImage(currentSrc), [currentSrc])

  return (
    <div
      className={cn(
        "relative overflow-hidden bg-gradient-to-br from-[#11112a] via-[#05050d] to-[#020205]",
        rounded,
        containerClassName,
      )}
    >
      <Image
        src={currentSrc}
        alt={alt}
        fill={fill}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        sizes={sizes}
        priority={priority}
        quality={quality}
        loading={priority ? "eager" : "lazy"}
        className={cn(
          "object-cover transition-transform duration-500 will-change-transform",
          imageClassName,
        )}
        onError={onError}
        unoptimized={!optimizable}
      />
      {children}
    </div>
  )
}

