// Analytics and monitoring utilities for production

// Web Vitals reporting
export function reportWebVitals(metric: any) {
  if (process.env.NODE_ENV === 'production') {
    // Send to analytics service (Google Analytics, Vercel Analytics, etc.)
    
    // Example: Google Analytics 4
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', metric.name, {
        event_category: 'Web Vitals',
        event_label: metric.id,
        value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
        non_interaction: true,
      })
    }

    // Example: Send to custom analytics endpoint
    if (typeof window !== 'undefined') {
      fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: metric.name,
          value: metric.value,
          id: metric.id,
          delta: metric.delta,
          url: window.location.href,
          timestamp: Date.now(),
        }),
      }).catch((error) => {
        console.warn('Failed to send analytics:', error)
      })
    }
  }
}

// Error reporting
export function reportError(error: Error, context?: any) {
  if (process.env.NODE_ENV === 'production') {
    // Send to error reporting service (Sentry, LogRocket, etc.)
    console.error('Application error:', error, context)
    
    // Example: Send to error endpoint
    if (typeof window !== 'undefined') {
      fetch('/api/errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: error.message,
          stack: error.stack,
          context,
          url: window.location.href,
          userAgent: navigator.userAgent,
          timestamp: Date.now(),
        }),
      }).catch(() => {
        // Silently fail to prevent error loops
      })
    }
  }
}

// Performance monitoring
export function trackPageView(url: string) {
  if (process.env.NODE_ENV === 'production') {
    // Track page views
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('config', process.env.NEXT_PUBLIC_GA_ID, {
        page_path: url,
      })
    }
  }
}

// User interaction tracking
export function trackEvent(action: string, category: string, label?: string, value?: number) {
  if (process.env.NODE_ENV === 'production') {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', action, {
        event_category: category,
        event_label: label,
        value: value,
      })
    }
  }
}
