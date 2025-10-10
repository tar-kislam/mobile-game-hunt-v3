import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Badge XP rewards mapping
const BADGE_XP_REWARDS = {
  WISE_OWL: 100,
  FIRE_DRAGON: 200,
  CLEVER_FOX: 150,
  GENTLE_PANDA: 120,
  SWIFT_PUMA: 80,
  EXPLORER: 100,
  RISING_STAR: 300,
  PIONEER: 500,
  FIRST_LAUNCH: 150,
} as const

async function migrateBadgeXP() {
  console.log('🔄 Starting badge XP migration...')

  try {
    // Get all users with their current XP and badges
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        xp: true,
      },
    })

    console.log(`📊 Found ${users.length} users to process`)

    let migratedCount = 0
    let skippedCount = 0

    for (const user of users) {
      try {
        // Check if user already has XP logs (already migrated)
        const existingXpLogs = await prisma.userXpLog.findFirst({
          where: { userId: user.id },
        })

        if (existingXpLogs) {
          console.log(`⏭️  User ${user.name || user.email} already has XP logs, skipping`)
          skippedCount++
          continue
        }

        // Check user's current XP - if they have XP but no logs, it's likely from badges
        if (user.xp > 0) {
          console.log(`🎯 Migrating XP for user ${user.name || user.email}: ${user.xp} XP`)

          // Create a migration XP log entry for the existing XP
          await prisma.userXpLog.create({
            data: {
              userId: user.id,
              action: 'BADGE_MIGRATION',
              xpDelta: user.xp,
              referenceId: 'migration',
            },
          })

          console.log(`✅ Created migration XP log for user ${user.name || user.email}`)
          migratedCount++
        } else {
          console.log(`⏭️  User ${user.name || user.email} has no XP, skipping`)
          skippedCount++
        }
      } catch (error) {
        console.error(`❌ Error migrating user ${user.name || user.email}:`, error)
      }
    }

    console.log(`🎉 Migration completed!`)
    console.log(`✅ Migrated: ${migratedCount} users`)
    console.log(`⏭️  Skipped: ${skippedCount} users`)

    // Now recalculate all user XP to ensure consistency
    console.log(`🔄 Recalculating XP for all users...`)
    
    const allUsers = await prisma.user.findMany({
      select: { id: true },
    })

    for (const user of allUsers) {
      try {
        // Get sum of all non-reverted XP changes
        const xpResult = await prisma.userXpLog.aggregate({
          where: {
            userId: user.id,
            reverted: false,
          },
          _sum: {
            xpDelta: true,
          },
        })

        const totalXp = Math.max(0, xpResult._sum.xpDelta || 0)
        
        // Update user's XP to match the calculated total
        await prisma.user.update({
          where: { id: user.id },
          data: { xp: totalXp },
        })
      } catch (error) {
        console.error(`❌ Error recalculating XP for user ${user.id}:`, error)
      }
    }

    console.log(`✅ XP recalculation completed!`)

  } catch (error) {
    console.error('❌ Migration failed:', error)
    throw error
  }
}

async function main() {
  try {
    await migrateBadgeXP()
  } catch (error) {
    console.error('❌ Migration script failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
