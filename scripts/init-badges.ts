import { PrismaClient } from '@prisma/client'
import { redisClient } from '../src/lib/redis'

const prisma = new PrismaClient()

async function initBadges() {
  console.log('🏆 Initializing badge system...')

  try {
    // Check if badges are already initialized
    const existingBadges = await redisClient.get('badges:users')
    if (existingBadges) {
      console.log('🏆 Badge system already initialized, skipping...')
      return
    }

    // Initialize empty badge system
    await redisClient.set('badges:users', JSON.stringify([]))
    console.log('✅ Badge system initialized successfully!')
    
  } catch (error) {
    console.error('❌ Failed to initialize badge system:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

initBadges()
  .catch((e) => {
    console.error('❌ Badge initialization failed:', e)
    process.exit(1)
  })
