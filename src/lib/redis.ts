// Redis client configuration - Temporarily disabled
let redisClient: any = null

console.log('Redis client disabled - using fallback cache')

export { redisClient }

// Cache utility functions
export class CacheService {
  private static instance: CacheService
  private client = redisClient

  static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService()
    }
    return CacheService.instance
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      if (!this.client) return null
      const value = await this.client.get(key)
      return value ? JSON.parse(value) : null
    } catch (error) {
      console.error('Cache get error:', error)
      return null
    }
  }

  async set(key: string, value: any, ttlSeconds: number = 60): Promise<void> {
    try {
      if (!this.client) return
      await this.client.setEx(key, ttlSeconds, JSON.stringify(value))
    } catch (error) {
      console.error('Cache set error:', error)
    }
  }

  async del(key: string): Promise<void> {
    try {
      if (!this.client) return
      await this.client.del(key)
    } catch (error) {
      console.error('Cache delete error:', error)
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      if (!this.client) return false
      const result = await this.client.exists(key)
      return result === 1
    } catch (error) {
      console.error('Cache exists error:', error)
      return false
    }
  }

  // Generate cache key for leaderboard queries
  generateLeaderboardKey(
    timeWindow: string,
    sortBy: string,
    categoryId?: string,
    page: number = 1,
    limit: number = 20,
    monetization?: string[],
    engine?: string[],
    pricing?: string[]
  ): string {
    const parts = ['leaderboard', timeWindow, sortBy]
    if (categoryId) parts.push(`cat:${categoryId}`)
    if (monetization && monetization.length > 0) parts.push(`mon:${monetization.sort().join(',')}`)
    if (engine && engine.length > 0) parts.push(`eng:${engine.sort().join(',')}`)
    if (pricing && pricing.length > 0) parts.push(`pri:${pricing.sort().join(',')}`)
    parts.push(`page:${page}`, `limit:${limit}`)
    return parts.join(':')
  }

  // Generate cache key for aggregation counts
  generateAggregationKey(
    timeWindow: string,
    type: 'votes' | 'follows' | 'clicks'
  ): string {
    return `agg:${type}:${timeWindow}`
  }
}