import { createClient } from 'redis'

// Redis client configuration
const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  socket: {
    connectTimeout: 5000,
  },
})

// Error handling
redisClient.on('error', (err) => {
  console.error('Redis Client Error:', err)
})

redisClient.on('connect', () => {
  console.log('Redis Client Connected')
})

// Connect to Redis
redisClient.connect().catch(console.error)

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
      const value = await this.client.get(key)
      return value ? JSON.parse(value) : null
    } catch (error) {
      console.error('Cache get error:', error)
      return null
    }
  }

  async set(key: string, value: any, ttlSeconds: number = 60): Promise<void> {
    try {
      await this.client.setEx(key, ttlSeconds, JSON.stringify(value))
    } catch (error) {
      console.error('Cache set error:', error)
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.client.del(key)
    } catch (error) {
      console.error('Cache delete error:', error)
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
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
    limit: number = 20
  ): string {
    const parts = ['leaderboard', timeWindow, sortBy]
    if (categoryId) parts.push(`cat:${categoryId}`)
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