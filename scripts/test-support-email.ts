import { config } from 'dotenv';
config();

import { sendSupportMessageEmail } from '../src/lib/email';

async function testSupportEmail() {
  console.log('🧪 Testing Support Email Functionality...\n');

  // Test data
  const testEmail = 'test@example.com';
  const testMessage = `Test support message from automated test.

This is a test message to verify that the support email system is working correctly.

Details:
- Time: ${new Date().toISOString()}
- Test ID: ${Math.random().toString(36).substr(2, 9)}
- Purpose: Verify email delivery to info@mobilegamehunt.com

If you receive this email, the support system is working properly!`;

  try {
    console.log('📧 Sending test support email...');
    console.log(`   From: ${testEmail}`);
    console.log(`   To: info@mobilegamehunt.com`);
    console.log(`   Message Length: ${testMessage.length} characters\n`);

    const result = await sendSupportMessageEmail(testEmail, testMessage);

    if (result.success) {
      console.log('✅ Support email sent successfully!');
      console.log('📬 Check info@mobilegamehunt.com inbox for the test message.\n');
      
      console.log('📋 Email Details:');
      console.log('   - Subject: 🆘 Support Request from test@example.com');
      console.log('   - Reply-To: test@example.com');
      console.log('   - Priority: High');
      console.log('   - Format: HTML with dark theme styling');
    } else {
      console.error('❌ Failed to send support email:');
      console.error(`   Error: ${result.error}\n`);
      
      console.log('🔧 Troubleshooting:');
      console.log('   1. Check SMTP configuration in .env file');
      console.log('   2. Verify SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS');
      console.log('   3. Test SMTP connection with: npm run test:email');
    }

  } catch (error) {
    console.error('❌ Unexpected error during test:');
    console.error(error);
  }
}

// Run the test
testSupportEmail()
  .then(() => {
    console.log('\n🏁 Support email test completed.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Test failed with error:', error);
    process.exit(1);
  });
