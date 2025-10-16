#!/usr/bin/env tsx

import { config } from 'dotenv'
config()

import { prisma } from '../src/lib/prisma'
import { awardBadge } from '../src/lib/badgeService'

async function debugBadgeAward() {
  console.log('🔍 Debug Badge Award Process...\n')

  try {
    // Find test user
    const testUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username: 'test' },
          { email: { contains: 'test' } }
        ]
      }
    })

    if (!testUser) {
      console.log('❌ Test user not found')
      return
    }

    console.log(`👤 Found test user: ${testUser.username} (${testUser.id})`)

    // Check current badges
    const currentBadges = await prisma.userBadge.findMany({
      where: { userId: testUser.id }
    })
    console.log(`🏆 Current badges: ${currentBadges.map(b => b.badgeKey).join(', ')}`)

    // Check published games
    const publishedGames = await prisma.product.count({
      where: {
        userId: testUser.id,
        status: 'PUBLISHED'
      }
    })
    console.log(`🎮 Published games: ${publishedGames}`)

    // Try to award FIRST_LAUNCH badge
    if (publishedGames >= 1) {
      console.log('\n🏆 Attempting to award FIRST_LAUNCH badge...')
      try {
        const result = await awardBadge(testUser.id, 'FIRST_LAUNCH')
        console.log(`✅ Award result: ${result}`)
      } catch (error) {
        console.error(`❌ Award failed:`, error)
      }
    }

    // Check badges after award attempt
    const badgesAfter = await prisma.userBadge.findMany({
      where: { userId: testUser.id }
    })
    console.log(`🏆 Badges after: ${badgesAfter.map(b => b.badgeKey).join(', ')}`)

  } catch (error) {
    console.error('❌ Debug failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

debugBadgeAward()
