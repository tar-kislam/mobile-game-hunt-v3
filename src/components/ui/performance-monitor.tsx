"use client"

import { useEffect } from 'react'

// Performance monitoring component for Lighthouse optimization
export function PerformanceMonitor() {
  useEffect(() => {
    // Report Web Vitals for monitoring
    if (typeof window !== 'undefined' && 'performance' in window) {
      // Core Web Vitals monitoring
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          // Report metrics to analytics service
          if (process.env.NODE_ENV === 'production') {
            // You can integrate with services like Google Analytics, Sentry, etc.
            console.log('Performance metric:', {
              name: entry.name,
              value: (entry as any).value || entry.duration,
              type: entry.entryType,
            })
          }
        })
      })

      // Observe Core Web Vitals
      try {
        observer.observe({ entryTypes: ['navigation', 'paint', 'largest-contentful-paint'] })
      } catch (error) {
        console.warn('Performance observer not supported:', error)
      }

      // Cleanup on unmount
      return () => {
        observer.disconnect()
      }
    }
  }, [])

  return null // This component doesn't render anything
}

// Lazy loading intersection observer for images
export function useLazyLoading() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const img = entry.target as HTMLImageElement
              if (img.dataset.src) {
                img.src = img.dataset.src
                img.removeAttribute('data-src')
                imageObserver.unobserve(img)
              }
            }
          })
        },
        {
          rootMargin: '50px 0px',
          threshold: 0.01,
        }
      )

      // Observe all images with data-src attribute
      const lazyImages = document.querySelectorAll('img[data-src]')
      lazyImages.forEach((img) => imageObserver.observe(img))

      return () => {
        imageObserver.disconnect()
      }
    }
  }, [])
}

// Preload critical resources - Hook renamed to follow React naming convention
export function usePreloadCriticalResources() {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Preload critical fonts
      const fontLink = document.createElement('link')
      fontLink.rel = 'preload'
      fontLink.as = 'font'
      fontLink.type = 'font/woff2'
      fontLink.crossOrigin = 'anonymous'
      fontLink.href = '/fonts/geist-sans.woff2'
      document.head.appendChild(fontLink)

      // Preload critical images
      const heroImage = new Image()
      heroImage.src = '/images/hero-bg.webp'

      // Prefetch likely next pages
      const router = document.createElement('link')
      router.rel = 'prefetch'
      router.href = '/submit'
      document.head.appendChild(router)
    }
  }, [])
}
