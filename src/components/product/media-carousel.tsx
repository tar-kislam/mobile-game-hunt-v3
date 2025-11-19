"use client"

import { useState, useEffect, useMemo } from "react"
import Image from "next/image"
import { Card } from "@/components/ui/card"
import { 
  Carousel, 
  CarouselContent, 
  CarouselItem, 
  CarouselNext, 
  CarouselPrevious,
  type CarouselApi
} from "@/components/ui/carousel"
import { PlayIcon, ChevronLeftIcon, ChevronRightIcon, X } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"

interface MediaCarouselProps {
  images: string[]
  video?: string | null
  mainImage?: string | null
  title: string
  gameplayGifUrl?: string | null
}

export function MediaCarousel({ images, video, mainImage, title, gameplayGifUrl }: MediaCarouselProps) {
  const [api, setApi] = useState<CarouselApi>()
  const [current, setCurrent] = useState(0)
  const [count, setCount] = useState(0)
  const [isPortraitMedia, setIsPortraitMedia] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [portraitMediaMap, setPortraitMediaMap] = useState<Record<number, boolean>>({})
  type FullscreenMedia = {
    src: string
    type: "image" | "gif"
    orientation: "portrait" | "landscape" | "square"
    mediaIndex: number
  }
  const [fullscreenMedia, setFullscreenMedia] = useState<FullscreenMedia | null>(null)
  
  // Helpers
  const isValidImageUrl = (url: string): boolean => {
    try {
      const u = new URL(url)
      return u.protocol === 'http:' || u.protocol === 'https:'
    } catch {
      return url.startsWith('/') || url.startsWith('data:') || url.startsWith('blob:')
    }
  }

  const isYouTubeUrl = (url: string | null | undefined) => {
    if (!url) return false
    try {
      const u = new URL(url)
      return (/youtube\.com$/i.test(u.hostname) || /youtu\.be$/i.test(u.hostname))
    } catch { return false }
  }

  const toYouTubeEmbed = (url: string): string => {
    try {
      const u = new URL(url)
      let id = ''
      if (u.hostname.includes('youtu.be')) {
        id = u.pathname.replace('/', '')
      } else {
        // Handle standard watch URLs and Shorts URLs
        const vParam = u.searchParams.get('v')
        if (vParam) {
          id = vParam
        } else if (u.pathname.startsWith('/shorts/')) {
          // Example: https://www.youtube.com/shorts/RNH_f-TOf6A
          const parts = u.pathname.split('/').filter(Boolean)
          id = parts[1] || parts[0] || ''
        }
      }
      return id ? `https://www.youtube.com/embed/${id}` : url
    } catch { return url }
  }
  
  // Build media list in order: first gallery image, gameplay GIF, video (if any), then remaining gallery images
  const mediaItems: Array<{ type: 'image' | 'youtube' | 'video' | 'gif' | 'placeholder'; src: string }> = []

  // Get valid gallery images
  const validImages = (images || []).filter(img => img && img.trim() !== '' && isValidImageUrl(img))

  const primaryImageSrc = useMemo(() => {
    if (validImages.length > 0) {
      return validImages[0]
    }
    if (mainImage && mainImage.trim() !== '' && isValidImageUrl(mainImage)) {
      return mainImage
    }
    return null
  }, [validImages, mainImage])
  
  // Add first gallery image as main image (if available)
  if (validImages.length > 0) {
    mediaItems.push({ type: 'image', src: validImages[0] })
  }

  // Add gameplay GIF if available
  if (gameplayGifUrl && gameplayGifUrl.trim() !== '' && isValidImageUrl(gameplayGifUrl)) {
    mediaItems.push({ type: 'gif', src: gameplayGifUrl })
  }

  // Add video if available
  if (video) {
    if (isYouTubeUrl(video)) {
      mediaItems.push({ type: 'youtube', src: toYouTubeEmbed(video) })
    } else {
      mediaItems.push({ type: 'video', src: video })
    }
  }
  
  // Add remaining gallery images (skip first one as it's already added)
  const remainingImages = validImages.slice(1)
  remainingImages.forEach(img => mediaItems.push({ type: 'image', src: img }))
  
  // If no gallery images, fallback to mainImage/thumbnail for small contexts only
  if (mediaItems.length === 0 && mainImage && mainImage.trim() !== '' && isValidImageUrl(mainImage)) {
    mediaItems.push({ type: 'image', src: mainImage })
  }
  
  if (mediaItems.length === 0) {
    mediaItems.push({ type: 'placeholder', src: '' })
  }

  useEffect(() => {
    if (!api) return
    const update = () => {
      const newCount = api.scrollSnapList().length
      setCount(newCount)
      const sel = api.selectedScrollSnap() + 1
      setCurrent(sel > newCount ? newCount : sel)
    }
    update()
    api.on("select", update)
  }, [api])

  const goToSlide = (index: number) => api?.scrollTo(index)

  // Detect mobile viewport
  useEffect(() => {
    if (typeof window === "undefined") return
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768) // md breakpoint
    }
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  // Measure primary image orientation (for backward compatibility)
  useEffect(() => {
    if (typeof window === "undefined") return
    if (!primaryImageSrc) {
      setIsPortraitMedia(false)
      return
    }
    const img = new window.Image()
    const handleLoad = () => {
      setIsPortraitMedia(img.naturalHeight > img.naturalWidth)
    }
    img.onload = handleLoad
    img.onerror = () => setIsPortraitMedia(false)
    img.src = primaryImageSrc
    return () => {
      img.onload = null
      img.onerror = null
    }
  }, [primaryImageSrc])

  // Measure orientation for each image/gif media item
  useEffect(() => {
    if (typeof window === "undefined") return
    const map: Record<number, boolean> = {}
    const imagesToCheck: Array<{ index: number; src: string }> = []
    
    mediaItems.forEach((media, index) => {
      if (media.type === "image" || media.type === "gif") {
        imagesToCheck.push({ index, src: media.src })
      }
    })

    let completed = 0
    const total = imagesToCheck.length

    if (total === 0) {
      setPortraitMediaMap({})
      return
    }

    imagesToCheck.forEach(({ index, src }) => {
      const img = new window.Image()
      const handleLoad = () => {
        map[index] = img.naturalHeight > img.naturalWidth
        completed++
        if (completed === total) {
          setPortraitMediaMap(map)
        }
      }
      img.onload = handleLoad
      img.onerror = () => {
        map[index] = false
        completed++
        if (completed === total) {
          setPortraitMediaMap(map)
        }
      }
      img.src = src
    })

    return () => {
      imagesToCheck.forEach(({ src }) => {
        const img = new window.Image()
        img.src = src
        img.onload = null
        img.onerror = null
      })
    }
  }, [mediaItems])

  // Helper to check if a specific media item should use phone layout
  const shouldUsePhoneLayoutForIndex = (index: number) => {
    return isMobile && (portraitMediaMap[index] === true)
  }

  useEffect(() => {
    if (!fullscreenMedia) return
    const previousOverflow = document.body.style.overflow
    const handleKeydown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setFullscreenMedia(null)
      }
    }
    document.body.style.overflow = "hidden"
    window.addEventListener("keydown", handleKeydown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener("keydown", handleKeydown)
    }
  }, [fullscreenMedia])

  const openFullscreenMedia = (mediaIndex: number) => {
    const media = mediaItems[mediaIndex]
    if (!media || (media.type !== "image" && media.type !== "gif")) return

    const basePayload: FullscreenMedia = {
      src: media.src,
      type: media.type,
      orientation: "landscape",
      mediaIndex
    }
    setFullscreenMedia(basePayload)

    if (typeof window !== "undefined") {
      const probe = new window.Image()
      probe.onload = () => {
        const { naturalWidth, naturalHeight } = probe
        const orientation: FullscreenMedia["orientation"] =
          naturalWidth === naturalHeight
            ? "square"
            : naturalHeight > naturalWidth
              ? "portrait"
              : "landscape"

        setFullscreenMedia(current => {
          if (!current || current.mediaIndex !== mediaIndex) return current
          return { ...current, orientation }
        })
      }
      probe.onerror = () => {}
      probe.src = media.src
    }
  }

  const handleMediaClick = (media: { type: string; src: string }, index: number) => {
    if (media.type === "image" || media.type === "gif") {
      openFullscreenMedia(index)
    }
  }

  const findNextMediaIndex = (startIndex: number, direction: 1 | -1): number | null => {
    const total = mediaItems.length
    if (total === 0) return null
    let idx = startIndex
    for (let i = 0; i < total; i++) {
      idx = (idx + direction + total) % total
      const candidate = mediaItems[idx]
      if (candidate && (candidate.type === "image" || candidate.type === "gif")) {
        return idx
      }
    }
    return null
  }

  const stepFullscreen = (direction: 1 | -1) => {
    if (!fullscreenMedia) return
    const nextIndex = findNextMediaIndex(fullscreenMedia.mediaIndex, direction)
    if (nextIndex !== null && nextIndex !== fullscreenMedia.mediaIndex) {
      openFullscreenMedia(nextIndex)
    }
  }

  const fullscreenEligibleCount = mediaItems.filter(item => item.type === "image" || item.type === "gif").length

  const fullscreenOrientation = fullscreenMedia?.orientation ?? "landscape"
  const fullscreenContainerClass =
    fullscreenOrientation === "portrait"
      ? "relative w-full max-w-[420px] h-[90vh]"
      : fullscreenOrientation === "square"
        ? "relative w-full max-w-4xl h-[85vh]"
        : "relative w-full max-w-5xl h-[75vh]"

  const cardAspectClass = "aspect-video"

  return (
    <div className="w-full space-y-4">
      {/* Main Media Carousel */}
      <Carousel setApi={setApi} className="w-full">
        <CarouselContent>
          {mediaItems.map((media, index) => (
            <CarouselItem key={index}>
              <Card
                className={`relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-100 to-blue-100 dark:from-gray-800 dark:to-gray-900 ${cardAspectClass}`}
              >
                {media.type === 'youtube' ? (
                  <div className="relative w-full h-full">
                    <iframe
                      src={media.src}
                      title={`${title} - Video`}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    />
                    <div className="absolute top-4 left-4"><span className="bg-black/70 text-white px-2 py-1 rounded-lg text-xs font-medium">YouTube</span></div>
                  </div>
                ) : media.type === 'video' ? (
                  <div className="relative w-full h-full">
                    <video
                      src={media.src}
                      controls
                      className="w-full h-full object-cover"
                      poster=""
                      preload="metadata"
                    />
                    <div className="absolute top-4 left-4"><span className="bg-black/70 text-white px-2 py-1 rounded-lg text-xs font-medium">Video</span></div>
                  </div>
                ) : media.type === 'gif' ? (
                  <div
                    className="relative w-full h-full group cursor-zoom-in"
                    onClick={() => handleMediaClick(media, index)}
                  >
                    <div className="relative w-full h-full">
                    {media.src.startsWith('/') ? (
                      <img
                        src={media.src}
                        alt={`${title} - Gameplay GIF`}
                          className={`absolute inset-0 w-full h-full ${shouldUsePhoneLayoutForIndex(index) ? 'object-cover' : 'object-cover'}`}
                        onError={(e)=>{(e.currentTarget as HTMLImageElement).src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%236b7280' font-size='24'%3E%F0%9F%8E%AE%20Gameplay%20GIF%3C/text%3E%3C/svg%3E"}}
                      />
                    ) : (
                      <Image
                        src={media.src}
                        alt={`${title} - Gameplay GIF`}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 50vw"
                        loading="lazy"
                          className={`${shouldUsePhoneLayoutForIndex(index) ? 'object-cover' : 'object-cover'} transition-transform duration-300 group-hover:scale-105`}
                        placeholder="blur"
                        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          ;(target as any).onerror = null
                          target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%236b7280' font-size='24'%3E%F0%9F%8E%AE%20Gameplay%20GIF%3C/text%3E%3C/svg%3E"
                        }}
                      />
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                    <div className="absolute top-4 left-4"><span className="bg-black/70 text-white px-2 py-1 rounded-lg text-xs font-medium">Gameplay GIF</span></div>
                    </div>
                  </div>
                ) : media.type === 'image' ? (
                  <div
                    className="relative w-full h-full group cursor-zoom-in"
                    onClick={() => handleMediaClick(media, index)}
                  >
                    <div className="relative w-full h-full">
                    {media.src.startsWith('/') ? (
                      <img
                        src={media.src}
                        alt={`${title} - Image ${index + 1}`}
                          className={`absolute inset-0 w-full h-full ${shouldUsePhoneLayoutForIndex(index) ? 'object-cover' : 'object-cover'}`}
                        onError={(e)=>{(e.currentTarget as HTMLImageElement).src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%236b7280' font-size='24'%3E%F0%9F%8E%AE%20Game%20Image%3C/text%3E%3C/svg%3E"}}
                      />
                    ) : (
                      <Image
                        src={media.src}
                        alt={`${title} - Image ${index + 1}`}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 50vw"
                        loading={index === 0 ? "eager" : "lazy"}
                        priority={index === 0}
                        quality={85}
                          className={`${shouldUsePhoneLayoutForIndex(index) ? 'object-cover' : 'object-cover'} transition-transform duration-300 group-hover:scale-105`}
                        placeholder="blur"
                        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          ;(target as any).onerror = null
                          target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%236b7280' font-size='24'%3E%F0%9F%8E%AE%20Game%20Image%3C/text%3E%3C/svg%3E"
                        }}
                      />
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground">
                    <div className="mb-4">
                      <img src="/logo/logo-gamepad.webp" alt="Game" className="w-16 h-16" />
                    </div>
                    <p className="text-sm">No media available</p>
                  </div>
                )}
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        {count > 1 && (<>
          <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white border-0 w-10 h-10" />
          <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white border-0 w-10 h-10" />
        </>)}
        {count > 1 && (
          <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1 rounded-lg text-sm font-medium">
            {(current > count ? count : current)} / {count}
          </div>
        )}
      </Carousel>

      {count > 1 && (
        <div className="w-full">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
            {mediaItems.map((media, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`relative flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                  current === index + 1 ? 'border-primary shadow-lg scale-105' : 'border-transparent hover:border-muted-foreground hover:scale-102'
                }`}
              >
                {media.type === 'youtube' ? (
                  <div className="w-full h-full bg-black/90 flex items-center justify-center">
                    <PlayIcon className="w-6 h-6 text-white" />
                  </div>
                ) : media.type === 'video' ? (
                  <div className="w-full h-full bg-black/90 flex items-center justify-center">
                    <PlayIcon className="w-6 h-6 text-white" />
                  </div>
                ) : media.type === 'image' ? (
                  media.src.startsWith('/') ? (
                    <img src={media.src} alt={`Thumbnail ${index + 1}`} className="w-full h-full object-cover" />
                  ) : (
                    <Image 
                      src={media.src} 
                      alt={`Thumbnail ${index + 1}`} 
                      width={80} 
                      height={64} 
                      className="object-cover w-full h-full" 
                      sizes="80px" 
                      quality={60} 
                      loading="lazy"
                      placeholder="blur"
                      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
                      onError={(e)=>{const t=e.target as HTMLImageElement;t.onerror=null;t.src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 80 64'%3E%3Crect width='80' height='64' fill='%23e5e7eb'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%236b7280' font-size='12'%3E%F0%9F%8E%AE%3C/text%3E%3C/svg%3E"}}/>
                  )
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-purple-100 to-blue-100 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center">
                    <img src="/logo/logo-gamepad.webp" alt="Game" className="w-6 h-6" />
                  </div>
                )}
                {current === index + 1 && (<div className="absolute inset-0 border-2 border-primary rounded-lg" />)}
              </button>
            ))}
          </div>
        </div>
      )}

      <AnimatePresence>
        {fullscreenMedia && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 cursor-zoom-out"
            onClick={() => setFullscreenMedia(null)}
          >
            <motion.div
              initial={{ scale: 0.97, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.97, opacity: 0 }}
              transition={{ type: "spring", stiffness: 220, damping: 18 }}
              className={fullscreenContainerClass}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/5 via-white/0 to-white/5 blur-xl opacity-30 pointer-events-none" />
              <div className="relative flex items-center justify-center w-full h-full rounded-3xl border border-white/15 bg-black/60 backdrop-blur-md p-4">
                {fullscreenMedia.src.startsWith('/') ? (
                  <img
                    src={fullscreenMedia.src}
                    alt={`${title} fullscreen`}
                    className="max-h-full max-w-full object-contain"
                  />
                ) : (
                  <div className="relative w-full h-full">
                    <Image
                      src={fullscreenMedia.src}
                      alt={`${title} fullscreen`}
                      fill
                      sizes="100vw"
                      priority
                      className="object-contain"
                    />
                  </div>
                )}

                {/* Mobile close button - only visible on mobile */}
                {isMobile && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      setFullscreenMedia(null)
                    }}
                    className="absolute top-4 right-4 md:hidden rounded-full bg-white/10 hover:bg-white/20 border border-white/20 p-2.5 text-white transition-colors z-10"
                    aria-label="Close fullscreen"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}

                {fullscreenEligibleCount > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        stepFullscreen(-1)
                      }}
                      className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 p-3 text-white transition-colors"
                    >
                      <ChevronLeftIcon className="w-5 h-5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        stepFullscreen(1)
                      }}
                      className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 p-3 text-white transition-colors"
                    >
                      <ChevronRightIcon className="w-5 h-5" />
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
