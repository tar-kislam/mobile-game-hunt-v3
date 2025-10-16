#!/usr/bin/env tsx

import { config } from 'dotenv'
config()

import { prisma } from '../src/lib/prisma'
import { getUserBadges } from '../src/lib/badgeService'
import { calculateLevelProgress } from '../src/lib/xpCalculator'

async function auditBadgesAndXP() {
  console.log('🔍 Starting Badge & XP Audit...\n')

  try {
    // Get all users with their stats
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        xp: true,
        createdAt: true,
        _count: {
          select: {
            products: true,
            votes: true,
            comments: true,
            following: true
          }
        }
      },
      orderBy: { createdAt: 'asc' }
    })

    console.log(`📊 Found ${users.length} users to audit\n`)

    const auditResults = []

    for (const user of users) {
      console.log(`👤 Auditing user: ${user.username} (${user.role})`)
      
      // Get user's published games count
      const publishedGamesCount = await prisma.product.count({
        where: {
          userId: user.id,
          status: 'PUBLISHED'
        }
      })

      // Get user's earned badges
      const earnedBadges = await getUserBadges(user.id)
      
      // Calculate expected badges based on current stats
      const expectedBadges = []
      
      // Check each badge eligibility
      if (user._count.comments >= 50) {
        expectedBadges.push('WISE_OWL')
      }
      
      if (publishedGamesCount >= 10) {
        expectedBadges.push('FIRE_DRAGON')
      }
      
      if (user._count.votes >= 100) {
        expectedBadges.push('CLEVER_FOX')
      }

      // Count likes received
      const likesReceived = await prisma.vote.count({
        where: {
          product: {
            userId: user.id
          }
        }
      })
      
      if (likesReceived >= 50) {
        expectedBadges.push('GENTLE_PANDA')
      }
      
      if (user._count.following >= 25) {
        expectedBadges.push('SWIFT_PUMA')
      }

      // Count user follows
      const userFollows = await prisma.follow.count({
        where: { followerId: user.id }
      })
      
      if (userFollows >= 10) {
        expectedBadges.push('EXPLORER')
      }

      // Count followers
      const followers = await prisma.follow.count({
        where: { followingId: user.id }
      })
      
      if (followers >= 100) {
        expectedBadges.push('RISING_STAR')
      }

      // Check Pioneer eligibility (first 1000 users)
      const usersBeforeCount = await prisma.user.count({
        where: {
          createdAt: {
            lt: user.createdAt
          }
        }
      })
      
      if (usersBeforeCount < 1000) {
        expectedBadges.push('PIONEER')
      }

      // Check First Launch
      if (publishedGamesCount >= 1) {
        expectedBadges.push('FIRST_LAUNCH')
      }

      // Calculate expected XP from badges
      const badgeXPValues = {
        WISE_OWL: 100,
        FIRE_DRAGON: 200,
        CLEVER_FOX: 150,
        GENTLE_PANDA: 120,
        SWIFT_PUMA: 80,
        EXPLORER: 100,
        RISING_STAR: 300,
        PIONEER: 500,
        FIRST_LAUNCH: 150
      }

      const expectedXPFromBadges = earnedBadges.reduce((total, badge) => {
        return total + (badgeXPValues[badge] || 0)
      }, 0)

      const missingBadges = expectedBadges.filter(badge => !earnedBadges.includes(badge as any))
      const extraBadges = earnedBadges.filter(badge => !expectedBadges.includes(badge))

      const levelInfo = calculateLevelProgress(user.xp || 0)

      const auditResult = {
        userId: user.id,
        username: user.username,
        role: user.role,
        currentXP: user.xp || 0,
        currentLevel: levelInfo.level,
        publishedGames: publishedGamesCount,
        totalProducts: user._count.products,
        earnedBadges,
        expectedBadges,
        missingBadges,
        extraBadges,
        expectedXPFromBadges,
        hasIssues: missingBadges.length > 0 || extraBadges.length > 0
      }

      auditResults.push(auditResult)

      // Log issues
      if (missingBadges.length > 0) {
        console.log(`  ❌ Missing badges: ${missingBadges.join(', ')}`)
      }
      
      if (extraBadges.length > 0) {
        console.log(`  ⚠️  Extra badges: ${extraBadges.join(', ')}`)
      }

      if (missingBadges.length === 0 && extraBadges.length === 0) {
        console.log(`  ✅ Badge status: OK`)
      }

      console.log(`  📊 XP: ${user.xp || 0} (Level ${levelInfo.level})`)
      console.log(`  🎮 Published Games: ${publishedGamesCount}/${user._count.products}`)
      console.log(`  🏆 Earned Badges: ${earnedBadges.length}/${expectedBadges.length}`)
      console.log('')
    }

    // Summary
    console.log('📋 AUDIT SUMMARY')
    console.log('================')
    
    const usersWithIssues = auditResults.filter(r => r.hasIssues)
    const totalMissingBadges = auditResults.reduce((sum, r) => sum + r.missingBadges.length, 0)
    const totalExtraBadges = auditResults.reduce((sum, r) => sum + r.extraBadges.length, 0)

    console.log(`👥 Total users audited: ${users.length}`)
    console.log(`❌ Users with badge issues: ${usersWithIssues.length}`)
    console.log(`🏆 Total missing badges: ${totalMissingBadges}`)
    console.log(`⚠️  Total extra badges: ${totalExtraBadges}`)

    if (usersWithIssues.length > 0) {
      console.log('\n🔧 USERS NEEDING FIXES:')
      console.log('======================')
      
      usersWithIssues.forEach(user => {
        console.log(`\n👤 ${user.username} (${user.role})`)
        if (user.missingBadges.length > 0) {
          console.log(`  Missing: ${user.missingBadges.join(', ')}`)
        }
        if (user.extraBadges.length > 0) {
          console.log(`  Extra: ${user.extraBadges.join(', ')}`)
        }
      })
    }

    // Recommendations
    console.log('\n💡 RECOMMENDATIONS:')
    console.log('==================')
    console.log('1. Run badge recalculation for users with missing badges')
    console.log('2. Check users with extra badges (may need manual review)')
    console.log('3. Consider running XP recalculation based on earned badges')
    console.log('4. Verify admin users are not getting badges they shouldn\'t')

    return auditResults

  } catch (error) {
    console.error('❌ Audit failed:', error)
    return []
  } finally {
    await prisma.$disconnect()
  }
}

auditBadgesAndXP()
