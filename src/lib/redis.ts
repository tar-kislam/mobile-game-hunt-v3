import { Redis } from 'ioredis';

const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  retryDelayOnFailover: 100,
  maxRetriesPerRequest: 3,
});

// Leaderboard cache keys
export const LEADERBOARD_KEYS = {
  DAILY: 'lb:daily',
  WEEKLY: 'lb:weekly',
  ALL: 'lb:all',
} as const;

// Cache TTL in seconds
export const CACHE_TTL = {
  DAILY: 60,    // 1 minute
  WEEKLY: 120,  // 2 minutes
  ALL: 300,     // 5 minutes
} as const;

export default redis;
