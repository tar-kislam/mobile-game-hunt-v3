"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ChevronLeftIcon, ChevronRightIcon, PlayIcon } from "lucide-react"

interface MediaCarouselProps {
  images: string[]
  video?: string | null
  title: string
}

export function MediaCarousel({ images, video, title }: MediaCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  
  // Combine video and images into a single media array
  const mediaItems = []
  
  // Add video first if it exists
  if (video) {
    mediaItems.push({ type: 'video', src: video })
  }
  
  // Add images
  images.forEach(image => {
    mediaItems.push({ type: 'image', src: image })
  })
  
  // If no media items, show placeholder
  if (mediaItems.length === 0) {
    mediaItems.push({ type: 'placeholder', src: '' })
  }

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % mediaItems.length)
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + mediaItems.length) % mediaItems.length)
  }

  const goToSlide = (index: number) => {
    setCurrentIndex(index)
  }

  const currentMedia = mediaItems[currentIndex]

  return (
    <div className="w-full space-y-4">
      {/* Main Media Display */}
      <Card className="relative aspect-video overflow-hidden rounded-2xl bg-gradient-to-br from-purple-100 to-blue-100">
        {currentMedia.type === 'video' ? (
          <div className="relative w-full h-full">
            <video
              src={currentMedia.src}
              controls
              className="w-full h-full object-cover"
              poster=""
            >
              Your browser does not support the video tag.
            </video>
            <div className="absolute top-4 left-4">
              <span className="bg-black/70 text-white px-2 py-1 rounded text-xs">
                Video
              </span>
            </div>
          </div>
        ) : currentMedia.type === 'image' ? (
          <div className="relative w-full h-full">
            <Image
              src={currentMedia.src}
              alt={`${title} - Image ${currentIndex + 1}`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              unoptimized={true}
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.style.display = 'none'
              }}
            />
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-6xl">
            🎮
          </div>
        )}

        {/* Navigation Arrows */}
        {mediaItems.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="sm"
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full w-8 h-8 p-0"
              onClick={prevSlide}
            >
              <ChevronLeftIcon className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full w-8 h-8 p-0"
              onClick={nextSlide}
            >
              <ChevronRightIcon className="w-4 h-4" />
            </Button>
          </>
        )}

        {/* Media Counter */}
        {mediaItems.length > 1 && (
          <div className="absolute bottom-4 right-4 bg-black/70 text-white px-2 py-1 rounded text-xs">
            {currentIndex + 1} / {mediaItems.length}
          </div>
        )}
      </Card>

      {/* Thumbnail Navigation */}
      {mediaItems.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {mediaItems.map((media, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                currentIndex === index
                  ? 'border-primary shadow-lg'
                  : 'border-transparent hover:border-muted-foreground'
              }`}
            >
              {media.type === 'video' ? (
                <div className="w-full h-full bg-black flex items-center justify-center">
                  <PlayIcon className="w-6 h-6 text-white" />
                </div>
              ) : media.type === 'image' ? (
                <Image
                  src={media.src}
                  alt={`Thumbnail ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="64px"
                  unoptimized={true}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.style.display = 'none'
                  }}
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center text-2xl">
                  🎮
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
