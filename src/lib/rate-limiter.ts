import { NextRequest } from 'next/server'
import { CacheService } from './redis'

interface RateLimitConfig {
  windowMs: number // Time window in milliseconds
  maxRequests: number // Maximum requests per window
  keyGenerator?: (req: NextRequest) => string
}

export class RateLimiter {
  private static instance: RateLimiter
  private cacheService = CacheService.getInstance()

  static getInstance(): RateLimiter {
    if (!RateLimiter.instance) {
      RateLimiter.instance = new RateLimiter()
    }
    return RateLimiter.instance
  }

  async checkLimit(
    req: NextRequest,
    config: RateLimitConfig
  ): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
    const key = config.keyGenerator 
      ? config.keyGenerator(req)
      : this.getDefaultKey(req)

    const now = Date.now()
    const windowStart = Math.floor(now / config.windowMs) * config.windowMs
    const rateLimitKey = `rate_limit:${key}:${windowStart}`

    try {
      const currentCount = await this.cacheService.get<number>(rateLimitKey) || 0
      
      if (currentCount >= config.maxRequests) {
        return {
          allowed: false,
          remaining: 0,
          resetTime: windowStart + config.windowMs
        }
      }

      // Increment counter
      await this.cacheService.set(rateLimitKey, currentCount + 1, Math.ceil(config.windowMs / 1000))
      
      return {
        allowed: true,
        remaining: config.maxRequests - currentCount - 1,
        resetTime: windowStart + config.windowMs
      }
    } catch (error) {
      console.error('Rate limiting error:', error)
      // Fail open - allow request if rate limiting fails
      return {
        allowed: true,
        remaining: config.maxRequests,
        resetTime: now + config.windowMs
      }
    }
  }

  private getDefaultKey(req: NextRequest): string {
    // Use IP address as default key
    const forwarded = req.headers.get('x-forwarded-for')
    const ip = forwarded ? forwarded.split(',')[0] : req.headers.get('x-real-ip') || 'unknown'
    return ip
  }
}

// Predefined rate limit configurations
export const RATE_LIMITS = {
  // General API rate limit: 100 requests per minute
  GENERAL: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 100,
  },
  
  // Products API rate limit: 200 requests per minute
  PRODUCTS: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 200,
  },
  
  // Strict rate limit for heavy operations: 20 requests per minute
  STRICT: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 20,
  }
} as const
