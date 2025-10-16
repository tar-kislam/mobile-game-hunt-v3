#!/usr/bin/env tsx

import { config } from 'dotenv'
config()

import { prisma } from '../src/lib/prisma'
import { getUserBadges, awardBadge, checkAndAwardBadges } from '../src/lib/badgeService'
import { awardBadgeXP } from '../src/lib/xpService'
import { calculateLevelProgress } from '../src/lib/xpCalculator'

async function fixBadgesAndXP() {
  console.log('🔧 Starting Badge & XP Fix Process...\n')

  try {
    // Get all users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        role: true,
        xp: true
      },
      orderBy: { createdAt: 'asc' }
    })

    console.log(`👥 Found ${users.length} users to process\n`)

    let fixedUsers = 0
    let totalBadgesAwarded = 0
    let totalXPAwarded = 0

    for (const user of users) {
      console.log(`👤 Processing user: ${user.username} (${user.role})`)
      
      // Skip admin users for badge awarding (they shouldn't get badges)
      if (user.role === 'ADMIN') {
        console.log(`  ⏭️  Skipping admin user`)
        continue
      }

      // Get current badges
      const currentBadges = await getUserBadges(user.id)
      
      // Get user's published games count
      const publishedGamesCount = await prisma.product.count({
        where: {
          userId: user.id,
          status: 'PUBLISHED'
        }
      })

      // Get user stats
      const userStats = await prisma.user.findUnique({
        where: { id: user.id },
        select: {
          _count: {
            select: {
              products: true,
              votes: true,
              comments: true,
              following: true
            }
          }
        }
      })

      if (!userStats) {
        console.log(`  ❌ User stats not found`)
        continue
      }

      // Check each badge eligibility and award if missing
      const badgesToCheck = [
        {
          code: 'WISE_OWL',
          condition: userStats._count.comments >= 50,
          xp: 100
        },
        {
          code: 'FIRE_DRAGON',
          condition: publishedGamesCount >= 10,
          xp: 200
        },
        {
          code: 'CLEVER_FOX',
          condition: userStats._count.votes >= 100,
          xp: 150
        },
        {
          code: 'GENTLE_PANDA',
          condition: false, // We'll calculate this separately
          xp: 120
        },
        {
          code: 'SWIFT_PUMA',
          condition: userStats._count.following >= 25,
          xp: 80
        },
        {
          code: 'EXPLORER',
          condition: false, // We'll calculate this separately
          xp: 100
        },
        {
          code: 'RISING_STAR',
          condition: false, // We'll calculate this separately
          xp: 300
        },
        {
          code: 'PIONEER',
          condition: false, // We'll calculate this separately
          xp: 500
        },
        {
          code: 'FIRST_LAUNCH',
          condition: publishedGamesCount >= 1,
          xp: 150
        }
      ]

      // Check Gentle Panda (likes received)
      const likesReceived = await prisma.vote.count({
        where: {
          product: {
            userId: user.id
          }
        }
      })
      badgesToCheck[3].condition = likesReceived >= 50

      // Check Explorer (user follows)
      const userFollows = await prisma.follow.count({
        where: { followerId: user.id }
      })
      badgesToCheck[5].condition = userFollows >= 10

      // Check Rising Star (followers)
      const followers = await prisma.follow.count({
        where: { followingId: user.id }
      })
      badgesToCheck[6].condition = followers >= 100

      // Check Pioneer (first 1000 users)
      const usersBeforeCount = await prisma.user.count({
        where: {
          createdAt: {
            lt: user.createdAt
          }
        }
      })
      badgesToCheck[7].condition = usersBeforeCount < 1000

      // Award missing badges
      let userBadgesAwarded = 0
      let userXPAwarded = 0

      for (const badge of badgesToCheck) {
        if (badge.condition && !currentBadges.includes(badge.code as any)) {
          console.log(`  🏆 Awarding badge: ${badge.code}`)
          
          const awarded = await awardBadge(user.id, badge.code as any)
          if (awarded) {
            userBadgesAwarded++
            userXPAwarded += badge.xp
            console.log(`    ✅ Badge awarded (+${badge.xp} XP)`)
          } else {
            console.log(`    ❌ Failed to award badge`)
          }
        }
      }

      // Alternative approach: Use the existing checkAndAwardBadges function
      console.log(`  🔄 Running comprehensive badge check...`)
      const newlyAwarded = await checkAndAwardBadges(user.id)
      
      if (newlyAwarded.length > 0) {
        console.log(`    ✅ Awarded ${newlyAwarded.length} new badges: ${newlyAwarded.join(', ')}`)
        userBadgesAwarded += newlyAwarded.length
      }

      if (userBadgesAwarded > 0) {
        fixedUsers++
        totalBadgesAwarded += userBadgesAwarded
        
        // Get updated user XP
        const updatedUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { xp: true }
        })
        
        const levelInfo = calculateLevelProgress(updatedUser?.xp || 0)
        console.log(`  📊 Final XP: ${updatedUser?.xp || 0} (Level ${levelInfo.level})`)
      } else {
        console.log(`  ✅ No badges needed`)
      }

      console.log('')
    }

    // Summary
    console.log('📋 FIX SUMMARY')
    console.log('==============')
    console.log(`👥 Users processed: ${users.length}`)
    console.log(`🔧 Users fixed: ${fixedUsers}`)
    console.log(`🏆 Total badges awarded: ${totalBadgesAwarded}`)
    console.log(`⭐ Total XP awarded: ${totalXPAwarded}`)

    console.log('\n✅ Badge & XP fix process completed!')

  } catch (error) {
    console.error('❌ Fix process failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Add command line argument handling
const args = process.argv.slice(2)
const dryRun = args.includes('--dry-run')

if (dryRun) {
  console.log('🔍 DRY RUN MODE - No changes will be made')
  console.log('Run without --dry-run to apply fixes\n')
}

fixBadgesAndXP()
