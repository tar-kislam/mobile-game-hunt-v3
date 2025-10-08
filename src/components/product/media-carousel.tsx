"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { 
  Carousel, 
  CarouselContent, 
  CarouselItem, 
  CarouselNext, 
  CarouselPrevious,
  type CarouselApi
} from "@/components/ui/carousel"
import { ChevronLeftIcon, ChevronRightIcon, PlayIcon } from "lucide-react"

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
        id = u.searchParams.get('v') || ''
      }
      return id ? `https://www.youtube.com/embed/${id}` : url
    } catch { return url }
  }
  
  // Build media list in order: first gallery image, gameplay GIF, video (if any), then remaining gallery images
  const mediaItems: Array<{ type: 'image' | 'youtube' | 'video' | 'gif' | 'placeholder'; src: string }> = []

  // Get valid gallery images
  const validImages = (images || []).filter(img => img && img.trim() !== '' && isValidImageUrl(img))
  
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

  return (
    <div className="w-full space-y-4">
      {/* Main Media Carousel */}
      <Carousel setApi={setApi} className="w-full">
        <CarouselContent>
          {mediaItems.map((media, index) => (
            <CarouselItem key={index}>
              <Card className="relative aspect-video overflow-hidden rounded-2xl bg-gradient-to-br from-purple-100 to-blue-100 dark:from-gray-800 dark:to-gray-900">
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
                  <div className="relative w-full h-full group">
                    {media.src.startsWith('/') ? (
                      <img
                        src={media.src}
                        alt={`${title} - Gameplay GIF`}
                        className="w-full h-full object-cover"
                        onError={(e)=>{(e.currentTarget as HTMLImageElement).src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%236b7280' font-size='24'%3E%F0%9F%8E%AE%20Gameplay%20GIF%3C/text%3E%3C/svg%3E"}}
                      />
                    ) : (
                      <Image
                        src={media.src}
                        alt={`${title} - Gameplay GIF`}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 50vw"
                        unoptimized={true}
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
                ) : media.type === 'image' ? (
                  <div className="relative w-full h-full group">
                    {media.src.startsWith('/') ? (
                      <img
                        src={media.src}
                        alt={`${title} - Image ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e)=>{(e.currentTarget as HTMLImageElement).src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%236b7280' font-size='24'%3E%F0%9F%8E%AE%20Game%20Image%3C/text%3E%3C/svg%3E"}}
                      />
                    ) : (
                      <Image
                        src={media.src}
                        alt={`${title} - Image ${index + 1}`}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 50vw"
                        priority={index === 0}
                        quality={90}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          ;(target as any).onerror = null
                          target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%236b7280' font-size='24'%3E%F0%9F%8E%AE%20Game%20Image%3C/text%3E%3C/svg%3E"
                        }}
                      />
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
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
                    <Image src={media.src} alt={`Thumbnail ${index + 1}`} fill className="object-cover" sizes="80px" quality={60}
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
    </div>
  )
}
