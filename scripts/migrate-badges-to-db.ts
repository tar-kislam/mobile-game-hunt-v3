#!/usr/bin/env tsx

import { config } from 'dotenv'
config()

import { prisma } from '../src/lib/prisma'

async function migrateBadgesToDatabase() {
  console.log('🔄 Migrating Badges from Notifications to UserBadge Table...\n')

  try {
    // Get all badge-related notifications
    const badgeNotifications = await prisma.notification.findMany({
      where: {
        type: { in: ['badge', 'badge_unlocked'] },
        meta: {
          path: ['badgeId'],
          not: null
        }
      },
      select: {
        userId: true,
        meta: true,
        createdAt: true
      }
    })

    console.log(`📬 Found ${badgeNotifications.length} badge notifications`)

    let migrated = 0
    let skipped = 0

    for (const notification of badgeNotifications) {
      const badgeId = notification.meta?.badgeId as string
      if (!badgeId) continue

      // Check if badge already exists in UserBadge table
      const existingBadge = await prisma.userBadge.findUnique({
        where: {
          userId_badgeKey: {
            userId: notification.userId,
            badgeKey: badgeId
          }
        }
      })

      if (existingBadge) {
        console.log(`⏭️  Skipping ${badgeId} for user ${notification.userId} (already exists)`)
        skipped++
        continue
      }

      // Create UserBadge entry
      await prisma.userBadge.create({
        data: {
          userId: notification.userId,
          badgeKey: badgeId,
          earnedAt: notification.createdAt
        }
      })

      console.log(`✅ Migrated ${badgeId} for user ${notification.userId}`)
      migrated++
    }

    console.log(`\n📋 Migration Summary:`)
    console.log(`✅ Migrated: ${migrated} badges`)
    console.log(`⏭️  Skipped: ${skipped} badges`)

    // Verify migration
    const totalUserBadges = await prisma.userBadge.count()
    console.log(`🏆 Total UserBadge entries: ${totalUserBadges}`)

  } catch (error) {
    console.error('❌ Migration failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

migrateBadgesToDatabase()
