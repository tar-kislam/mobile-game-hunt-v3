#!/usr/bin/env node

/**
 * Test script for the newsletter email system
 * Usage: node scripts/test-email.js [email]
 */

const testEmail = async (email) => {
  try {
    console.log('🧪 Testing MobileGameHunt Email System...\n')
    
    // Test 1: Newsletter subscription
    console.log('📧 Testing newsletter subscription...')
    const subscribeResponse = await fetch('http://localhost:3001/api/newsletter/subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email })
    })
    
    const subscribeResult = await subscribeResponse.json()
    console.log('Subscription result:', subscribeResult)
    
    if (subscribeResponse.ok) {
      console.log('✅ Newsletter subscription test passed!\n')
    } else {
      console.log('❌ Newsletter subscription test failed!\n')
    }
    
    // Test 2: Email configuration (admin only)
    console.log('⚙️ Testing email configuration...')
    const configResponse = await fetch('http://localhost:3001/api/newsletter/test-email', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    })
    
    if (configResponse.status === 403) {
      console.log('⚠️ Email configuration test requires admin authentication')
    } else {
      const configResult = await configResponse.json()
      console.log('Email configuration:', configResult)
    }
    
    console.log('\n🎉 Email system test completed!')
    console.log('Check your email inbox for the welcome message.')
    
  } catch (error) {
    console.error('❌ Test failed:', error.message)
    console.log('\n💡 Make sure:')
    console.log('1. The development server is running (npm run dev)')
    console.log('2. SMTP credentials are configured in .env')
    console.log('3. The email address is valid')
  }
}

// Get email from command line argument or use default
const email = process.argv[2] || 'test@example.com'

if (!email.includes('@')) {
  console.error('❌ Please provide a valid email address')
  console.log('Usage: node scripts/test-email.js your-email@example.com')
  process.exit(1)
}

testEmail(email)
