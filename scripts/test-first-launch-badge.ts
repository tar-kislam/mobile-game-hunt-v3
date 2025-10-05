#!/usr/bin/env tsx

/**
 * Test script for First Launch badge functionality
 * Run with: npx tsx scripts/test-first-launch-badge.ts
 */

import { prisma } from '../src/lib/prisma'
import { checkAndAwardBadges, getUserBadges } from '../src/lib/badgeService'

async function testFirstLaunchBadge() {
  console.log('🎯 Testing First Launch Badge Functionality\n')

  try {
    // Find a user who has published games
    const userWithGames = await prisma.user.findFirst({
      where: {
        products: {
          some: {
            status: 'PUBLISHED'
          }
        }
      },
      select: {
        id: true,
        name: true,
        email: true,
        _count: {
          select: {
            products: true
          }
        }
      }
    })

    if (!userWithGames) {
      console.log('❌ No user found with published games')
      return
    }

    console.log(`👤 Testing with user: ${userWithGames.name} (${userWithGames.email})`)
    console.log(`📊 Published games: ${userWithGames._count.products}`)

    // Check current badges
    const currentBadges = await getUserBadges(userWithGames.id)
    console.log(`🏆 Current badges: ${currentBadges.join(', ') || 'None'}`)

    // Check and award badges
    console.log('\n🔍 Checking for new badges...')
    const newBadges = await checkAndAwardBadges(userWithGames.id)
    
    if (newBadges.length > 0) {
      console.log(`✅ New badges awarded: ${newBadges.join(', ')}`)
    } else {
      console.log('ℹ️ No new badges awarded')
    }

    // Check badges again
    const updatedBadges = await getUserBadges(userWithGames.id)
    console.log(`🏆 Updated badges: ${updatedBadges.join(', ') || 'None'}`)

    // Test badge API
    console.log('\n🌐 Testing badge API...')
    const badgeApiUrl = `http://localhost:3000/api/user/${userWithGames.id}/badges`
    console.log(`📡 API URL: ${badgeApiUrl}`)
    
    try {
      const response = await fetch(badgeApiUrl)
      if (response.ok) {
        const badgeData = await response.json()
        const firstLaunchBadge = badgeData.find((badge: any) => badge.code === 'FIRST_LAUNCH')
        
        if (firstLaunchBadge) {
          console.log('✅ First Launch badge found in API:')
          console.log(`   Title: ${firstLaunchBadge.title}`)
          console.log(`   Emoji: ${firstLaunchBadge.emoji}`)
          console.log(`   Description: ${firstLaunchBadge.description}`)
          console.log(`   Locked: ${firstLaunchBadge.locked}`)
          console.log(`   Progress: ${firstLaunchBadge.progress.pct}%`)
          console.log(`   XP: ${firstLaunchBadge.xp}`)
        } else {
          console.log('❌ First Launch badge not found in API response')
        }
      } else {
        console.log(`❌ API request failed: ${response.status}`)
      }
    } catch (error) {
      console.log(`❌ API test failed: ${(error as Error).message}`)
    }

    console.log('\n✨ First Launch badge test completed!')

  } catch (error) {
    console.error('❌ Test failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the test
testFirstLaunchBadge().catch(console.error)
