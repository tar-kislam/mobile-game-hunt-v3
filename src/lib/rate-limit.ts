import { redisClient } from '@/lib/redis'

export async function rateLimit(key: string, limit: number, windowSeconds: number) {
  const now = Math.floor(Date.now() / 1000)
  const bucket = `rl:${key}:${Math.floor(now / windowSeconds)}`
  const count = await redisClient.incr(bucket)
  if (count === 1) {
    await redisClient.expire(bucket, windowSeconds)
  }
  return { allowed: count <= limit, count }
}


