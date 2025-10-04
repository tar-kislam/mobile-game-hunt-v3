#!/usr/bin/env tsx

/**
 * Test script for First Launch badge image functionality
 * Run with: npx tsx scripts/test-badge-image.ts
 */

import { getBadgeIconPath, getBadgeIconFilename } from '../src/lib/badgeIconMapper'

async function testBadgeImage() {
  console.log('🖼️ Testing First Launch Badge Image Functionality\n')

  // Test badge icon mapping
  const badgeCode = 'FIRST_LAUNCH'
  const filename = getBadgeIconFilename(badgeCode)
  const path = getBadgeIconPath(badgeCode)

  console.log(`🎯 Badge Code: ${badgeCode}`)
  console.log(`📁 Filename: ${filename}`)
  console.log(`🔗 Path: ${path}`)

  // Test if the image exists
  try {
    const fs = await import('fs')
    const imagePath = `public/badges/${filename}`
    const exists = fs.existsSync(imagePath)
    
    if (exists) {
      const stats = fs.statSync(imagePath)
      console.log(`✅ Image exists: ${imagePath}`)
      console.log(`📊 File size: ${(stats.size / 1024).toFixed(2)} KB`)
      console.log(`📅 Last modified: ${stats.mtime.toLocaleString()}`)
    } else {
      console.log(`❌ Image not found: ${imagePath}`)
    }
  } catch (error) {
    console.log(`❌ Error checking image: ${(error as Error).message}`)
  }

  // Test all badge mappings
  console.log('\n📋 All Badge Mappings:')
  const allBadges = [
    'PIONEER', 'WISE_OWL', 'FIRE_DRAGON', 'CLEVER_FOX', 
    'GENTLE_PANDA', 'SWIFT_PUMA', 'EXPLORER', 'RISING_STAR', 'FIRST_LAUNCH'
  ]

  for (const badge of allBadges) {
    const badgeFilename = getBadgeIconFilename(badge)
    const badgePath = getBadgeIconPath(badge)
    console.log(`  ${badge}: ${badgeFilename} → ${badgePath}`)
  }

  console.log('\n✨ Badge image test completed!')
}

// Run the test
testBadgeImage().catch(console.error)
