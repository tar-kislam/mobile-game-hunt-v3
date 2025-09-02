import redis from '@/lib/redis'

export async function rateLimit(key: string, limit: number, windowSeconds: number) {
  const now = Math.floor(Date.now() / 1000)
  const bucket = `rl:${key}:${Math.floor(now / windowSeconds)}`
  const count = await redis.incr(bucket)
  if (count === 1) {
    await redis.expire(bucket, windowSeconds)
  }
  return { allowed: count <= limit, count }
}


