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
  title: string
}

export function MediaCarousel({ images, video, title }: MediaCarouselProps) {
  const [api, setApi] = useState<CarouselApi>()
  const [current, setCurrent] = useState(0)
  const [count, setCount] = useState(0)
  
  // Combine video and images into a single media array
  const mediaItems = []
  
  // Add video first if it exists
  if (video) {
    mediaItems.push({ type: 'video', src: video })
  }
  
  // Helper function to check if image URL is valid for Next.js Image component
  const isValidImageUrl = (url: string): boolean => {
    try {
      const urlObj = new URL(url)
      const allowedHosts = [
        'images.unsplash.com',
        'lh3.googleusercontent.com', 
        'avatars.githubusercontent.com',
        'localhost'
      ]
      return allowedHosts.some(host => urlObj.hostname === host || urlObj.hostname.endsWith(`.${host}`))
    } catch {
      return false
    }
  }

  // Add images - filter out empty/invalid URLs and non-allowed domains
  const validImages = images.filter(image => 
    image && 
    image.trim() !== '' && 
    isValidImageUrl(image)
  )
  validImages.forEach(image => {
    mediaItems.push({ type: 'image', src: image })
  })
  
  // If no media items, show placeholder
  if (mediaItems.length === 0) {
    mediaItems.push({ type: 'placeholder', src: '' })
  }

  useEffect(() => {
    if (!api) {
      return
    }
    
    setCount(api.scrollSnapList().length)
    setCurrent(api.selectedScrollSnap() + 1)
    
    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1)
    })
  }, [api])

  const goToSlide = (index: number) => {
    api?.scrollTo(index)
  }

  return (
    <div className="w-full space-y-4">
      {/* Main Media Carousel */}
      <Carousel setApi={setApi} className="w-full">
        <CarouselContent>
          {mediaItems.map((media, index) => (
            <CarouselItem key={index}>
              <Card className="relative aspect-video overflow-hidden rounded-2xl bg-gradient-to-br from-purple-100 to-blue-100 dark:from-gray-800 dark:to-gray-900">
                {media.type === 'video' ? (
                  <div className="relative w-full h-full">
                    <video
                      src={media.src}
                      controls
                      className="w-full h-full object-cover"
                      poster=""
                      preload="metadata"
                    >
                      Your browser does not support the video tag.
                    </video>
                    <div className="absolute top-4 left-4">
                      <span className="bg-black/70 text-white px-2 py-1 rounded-lg text-xs font-medium">
                        Video
                      </span>
                    </div>
                  </div>
                ) : media.type === 'image' ? (
                  <div className="relative w-full h-full group">
                    <Image
                      src={media.src}
                      alt={`${title} - Image ${index + 1}`}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 50vw"
                      priority={index === 0}
                      quality={90}
                      onError={(e) => {
                        console.error('Image failed to load:', media.src)
                        const target = e.target as HTMLImageElement
                        // Prevent infinite retries by removing the onError handler
                        target.onerror = null
                        // Replace with fallback instead of hiding
                        target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%236b7280' font-size='24'%3E🎮 Game Image%3C/text%3E%3C/svg%3E"
                      }}
                    />
                    {/* Image overlay for better UX */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                  </div>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground">
                    <div className="text-6xl mb-4">🎮</div>
                    <p className="text-sm">No media available</p>
                  </div>
                )}
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        
        {/* Navigation buttons - only show if more than 1 item */}
        {mediaItems.length > 1 && (
          <>
            <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white border-0 w-10 h-10" />
            <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white border-0 w-10 h-10" />
          </>
        )}

        {/* Media Counter */}
        {mediaItems.length > 1 && (
          <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1 rounded-lg text-sm font-medium">
            {current} / {count}
          </div>
        )}
      </Carousel>

      {/* Thumbnail Navigation */}
      {mediaItems.length > 1 && (
        <div className="w-full">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
            {mediaItems.map((media, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`relative flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                  current === index + 1
                    ? 'border-primary shadow-lg scale-105'
                    : 'border-transparent hover:border-muted-foreground hover:scale-102'
                }`}
              >
                {media.type === 'video' ? (
                  <div className="w-full h-full bg-black/90 flex items-center justify-center">
                    <PlayIcon className="w-6 h-6 text-white" />
                  </div>
                ) : media.type === 'image' ? (
                  <Image
                    src={media.src}
                    alt={`Thumbnail ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="80px"
                    quality={60}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      // Prevent infinite retries by removing the onError handler
                      target.onerror = null
                      target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 80 64'%3E%3Crect width='80' height='64' fill='%23e5e7eb'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%236b7280' font-size='12'%3E🎮%3C/text%3E%3C/svg%3E"
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-purple-100 to-blue-100 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center text-2xl">
                    🎮
                  </div>
                )}
                
                {/* Active indicator */}
                {current === index + 1 && (
                  <div className="absolute inset-0 border-2 border-primary rounded-lg" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
