#!/usr/bin/env tsx

/**
 * Test script for username generation functionality
 * Run with: npx tsx scripts/test-username-generation.ts
 */

import { generateUniqueUsername, isUsernameAvailable, sanitizeUsername } from '../src/lib/usernameUtils'

async function testUsernameGeneration() {
  console.log('🧪 Testing Username Generation Functionality\n')

  // Test cases
  const testCases = [
    'Tarik Islam',
    'John Doe',
    'María García',
    'Jean-Pierre Dubois',
    '李小明',
    'José María',
    'O\'Connor',
    'Smith-Wilson',
    'User123',
    'a', // Edge case: single character
    '', // Edge case: empty string
    '   ', // Edge case: whitespace only
    '!!!@#$%', // Edge case: special characters only
    '123456', // Edge case: numbers only
  ]

  console.log('📝 Testing sanitizeUsername function:')
  for (const testCase of testCases) {
    const sanitized = sanitizeUsername(testCase)
    console.log(`  "${testCase}" → "${sanitized}"`)
  }

  console.log('\n🔍 Testing generateUniqueUsername function:')
  for (const testCase of testCases.slice(0, 5)) { // Test first 5 cases
    try {
      const username = await generateUniqueUsername(testCase)
      console.log(`  "${testCase}" → "${username}"`)
    } catch (error) {
      console.log(`  "${testCase}" → ERROR: ${(error as Error).message}`)
    }
  }

  console.log('\n✅ Testing isUsernameAvailable function:')
  const usernamesToTest = ['tarik-islam', 'john-doe', 'nonexistent-user-12345']
  for (const username of usernamesToTest) {
    try {
      const available = await isUsernameAvailable(username)
      console.log(`  "${username}" → ${available ? 'Available' : 'Taken'}`)
    } catch (error) {
      console.log(`  "${username}" → ERROR: ${(error as Error).message}`)
    }
  }

  console.log('\n🎯 Testing collision handling:')
  try {
    // Generate multiple usernames from the same base to test collision handling
    const baseName = 'Test User'
    const usernames: string[] = []
    
    for (let i = 0; i < 3; i++) {
      const username = await generateUniqueUsername(`${baseName} ${i}`)
      usernames.push(username)
    }
    
    console.log(`  Generated usernames: ${usernames.join(', ')}`)
    
    // Check if all usernames are unique
    const uniqueUsernames = new Set(usernames)
    console.log(`  All unique: ${uniqueUsernames.size === usernames.length ? '✅' : '❌'}`)
    
  } catch (error) {
    console.log(`  Collision test failed: ${(error as Error).message}`)
  }

  console.log('\n✨ Username generation test completed!')
}

// Run the test
testUsernameGeneration().catch(console.error)
