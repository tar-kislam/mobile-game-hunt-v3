#!/usr/bin/env tsx

import { config } from 'dotenv'
config()

import { prisma } from '../src/lib/prisma'

async function checkBadgeNotifications() {
  console.log('🔍 Checking Badge Notifications...\n')

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

    console.log(`👤 Test user: ${testUser.username} (${testUser.id})`)

    // Check notifications for badge-related messages
    const notifications = await prisma.notification.findMany({
      where: {
        userId: testUser.id,
        OR: [
          { type: { contains: 'badge' } },
          { message: { contains: 'First Launch' } },
          { message: { contains: 'FIRST_LAUNCH' } }
        ]
      },
      orderBy: { createdAt: 'desc' }
    })

    console.log(`📬 Found ${notifications.length} badge-related notifications:`)
    notifications.forEach(notif => {
      console.log(`  - ${notif.type}: ${notif.message}`)
      console.log(`    Meta: ${JSON.stringify(notif.meta)}`)
      console.log(`    Created: ${notif.createdAt}`)
      console.log('')
    })

    // Check UserBadge table
    const userBadges = await prisma.userBadge.findMany({
      where: { userId: testUser.id }
    })
    console.log(`🏆 UserBadge entries: ${userBadges.map(b => b.badgeKey).join(', ')}`)

  } catch (error) {
    console.error('❌ Check failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkBadgeNotifications()
