#!/usr/bin/env tsx

import { config } from 'dotenv'
config()

import { prisma } from '../src/lib/prisma'
import { checkAndAwardBadges, getUserBadges } from '../src/lib/badgeService'

async function productionBadgeFix() {
  console.log('🚀 Production Badge Fix Process...\n')

  try {
    // Get all users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        role: true
      },
      where: {
        role: { not: 'ADMIN' } // Skip admin users
      }
    })

    console.log(`👥 Processing ${users.length} non-admin users`)

    let fixedUsers = 0
    let totalBadgesAwarded = 0

    for (const user of users) {
      console.log(`\n👤 Processing: ${user.username || 'Unknown'}`)
      
      // Run comprehensive badge check
      const newlyAwarded = await checkAndAwardBadges(user.id)
      
      if (newlyAwarded.length > 0) {
        console.log(`  ✅ Awarded ${newlyAwarded.length} badges: ${newlyAwarded.join(', ')}`)
        fixedUsers++
        totalBadgesAwarded += newlyAwarded.length
      } else {
        console.log(`  ✅ No badges needed`)
      }
    }

    console.log(`\n📋 Production Fix Summary:`)
    console.log(`👥 Users processed: ${users.length}`)
    console.log(`🔧 Users fixed: ${fixedUsers}`)
    console.log(`🏆 Total badges awarded: ${totalBadgesAwarded}`)

  } catch (error) {
    console.error('❌ Production fix failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

productionBadgeFix()
