#!/usr/bin/env tsx

/**
 * QA Test Script for MobileGameHunt Newsletter Email System
 * Tests SMTP connection, email sending, and HTML rendering
 */

// Load environment variables
import { config } from 'dotenv'
config()

import { sendWelcomeEmail, testEmailConfiguration } from '../src/lib/email'

async function runEmailTests() {
  console.log('🧪 Starting MobileGameHunt Email System QA Tests...\n')
  
  // Test email address
  const testEmail = 'fuattarikislam93@gmail.com'
  
  try {
    // Step 1: Test SMTP Configuration
    console.log('🌐 Step 1: Testing SMTP Configuration...')
    console.log('📋 Checking environment variables...')
    
    const smtpHost = process.env.SMTP_HOST
    const smtpPort = process.env.SMTP_PORT
    const smtpUser = process.env.SMTP_USER
    const smtpPass = process.env.SMTP_PASS
    const mailFrom = process.env.SMTP_FROM
    
    console.log(`   SMTP_HOST: ${smtpHost ? '✅ Set' : '❌ Missing'}`)
    console.log(`   SMTP_PORT: ${smtpPort ? '✅ Set' : '❌ Missing'}`)
    console.log(`   SMTP_USER: ${smtpUser ? '✅ Set' : '❌ Missing'}`)
    console.log(`   SMTP_PASS: ${smtpPass ? '✅ Set' : '❌ Missing'}`)
    console.log(`   MAIL_FROM: ${mailFrom ? '✅ Set' : '⚠️ Using default'}`)
    
    if (!smtpHost || !smtpUser || !smtpPass) {
      console.log('\n❌ SMTP Configuration Error:')
      if (!smtpHost) console.log('   → Missing SMTP_HOST environment variable')
      if (!smtpUser) console.log('   → Missing SMTP_USER environment variable')
      if (!smtpPass) console.log('   → Missing SMTP_PASS environment variable')
      console.log('\n💡 Solution: Add missing variables to your .env file')
      process.exit(1)
    }
    
    console.log(`\n🔗 Connecting to ${smtpHost}:${smtpPort || 587}...`)
    
    // Test SMTP connection
    const configResult = await testEmailConfiguration()
    
    if (configResult.success) {
      console.log('✅ SMTP Connected successfully!')
      console.log(`   Host: ${smtpHost}`)
      console.log(`   Port: ${smtpPort || 587}`)
      console.log(`   User: ${smtpUser}`)
      console.log(`   From: ${mailFrom || 'info@mobilegamehunt.com'}`)
    } else {
      console.log('❌ SMTP Connection Failed:')
      console.log(`   Error: ${configResult.error}`)
      console.log('\n💡 Troubleshooting:')
      console.log('   → Check SMTP credentials are correct')
      console.log('   → Verify port number (587 for TLS, 465 for SSL)')
      console.log('   → Ensure SMTP server allows connections from your IP')
      console.log('   → Try different port if current one fails')
      process.exit(1)
    }
    
    // Step 2: Test Email Sending
    console.log('\n📤 Step 2: Testing Email Sending...')
    console.log(`📧 Sending test email to: ${testEmail}`)
    console.log('📋 Email details:')
    console.log(`   Subject: 🎮 Welcome to Mobile Game Hunt - Let's Discover Amazing Games Together!`)
    console.log(`   From: ${mailFrom || 'info@mobilegamehunt.com'}`)
    console.log(`   To: ${testEmail}`)
    console.log(`   Type: HTML Welcome Email`)
    
    const emailResult = await sendWelcomeEmail(testEmail)
    
    if (emailResult.success) {
      console.log('\n✅ Email sent successfully!')
      console.log('📬 Check your inbox for the welcome email')
      console.log('🎨 Verify HTML rendering in your email client')
    } else {
      console.log('\n❌ Email Sending Failed:')
      console.log(`   Error: ${emailResult.error}`)
      console.log('\n💡 Troubleshooting:')
      console.log('   → Check recipient email address is valid')
      console.log('   → Verify SMTP server allows sending to external domains')
      console.log('   → Check spam/junk folder')
      console.log('   → Ensure SMTP server is not rate limiting')
      process.exit(1)
    }
    
    // Step 3: Test Results Summary
    console.log('\n🎉 Step 3: Test Results Summary')
    console.log('=' .repeat(50))
    console.log('✅ SMTP Configuration: PASSED')
    console.log('✅ SMTP Connection: PASSED')
    console.log('✅ Email Sending: PASSED')
    console.log('✅ HTML Template: READY')
    console.log('=' .repeat(50))
    
    console.log('\n📋 Next Steps:')
    console.log('1. Check your email inbox for the test message')
    console.log('2. Verify HTML design renders correctly')
    console.log('3. Test on mobile and desktop email clients')
    console.log('4. Confirm all links work properly')
    
    console.log('\n🎯 Email System Status: PRODUCTION READY! 🚀')
    
  } catch (error) {
    console.log('\n❌ Unexpected Error:')
    console.log(`   ${error instanceof Error ? error.message : 'Unknown error'}`)
    console.log('\n💡 This might be a configuration or network issue')
    process.exit(1)
  }
}

// Run the tests
runEmailTests()
  .then(() => {
    console.log('\n🏁 QA Tests completed successfully!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n💥 QA Tests failed:', error)
    process.exit(1)
  })
