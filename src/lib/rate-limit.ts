import { redisClient } from '@/lib/redis'

export async function rateLimit(key: string, limit: number, windowSeconds: number) {
  // If Redis client is not available, allow all requests (fail open)
  if (!redisClient) {
    console.log('Redis client not available - allowing request (fail open)')
    return { allowed: true, count: 0 }
  }

  try {
    const now = Math.floor(Date.now() / 1000)
    const bucket = `rl:${key}:${Math.floor(now / windowSeconds)}`
    const count = await redisClient.incr(bucket)
    if (count === 1) {
      await redisClient.expire(bucket, windowSeconds)
    }
    return { allowed: count <= limit, count }
  } catch (error) {
    console.error('Rate limiting error:', error)
    // Fail open - allow request if rate limiting fails
    return { allowed: true, count: 0 }
  }
}


