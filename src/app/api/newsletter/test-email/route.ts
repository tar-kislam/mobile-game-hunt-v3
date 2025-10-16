import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { testEmailConfiguration, sendWelcomeEmail } from '@/lib/email'

// POST /api/newsletter/test-email - Test email configuration and send test email
export async function POST(req: NextRequest) {
  try {
    // Check if user is admin (optional security)
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { email, testType = 'config' } = await req.json()

    if (testType === 'config') {
      // Test SMTP configuration
      console.log('[EMAIL TEST] Testing SMTP configuration...')
      const configResult = await testEmailConfiguration()
      
      if (configResult.success) {
        return NextResponse.json({ 
          success: true, 
          message: 'SMTP configuration is working correctly' 
        })
      } else {
        return NextResponse.json({ 
          success: false, 
          error: configResult.error 
        }, { status: 500 })
      }
    }

    if (testType === 'send' && email) {
      // Test sending welcome email
      console.log(`[EMAIL TEST] Sending test welcome email to: ${email}`)
      const emailResult = await sendWelcomeEmail(email)
      
      if (emailResult.success) {
        return NextResponse.json({ 
          success: true, 
          message: `Test welcome email sent successfully to ${email}` 
        })
      } else {
        return NextResponse.json({ 
          success: false, 
          error: emailResult.error 
        }, { status: 500 })
      }
    }

    return NextResponse.json({ 
      error: 'Invalid test type or missing email' 
    }, { status: 400 })

  } catch (error) {
    console.error('[EMAIL TEST] Error:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}

// GET /api/newsletter/test-email - Get email configuration status
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const configResult = await testEmailConfiguration()
    
    return NextResponse.json({
      smtpConfigured: !!process.env.SMTP_HOST && !!process.env.SMTP_USER && !!process.env.SMTP_PASS,
      smtpWorking: configResult.success,
      error: configResult.error,
      fromEmail: process.env.SMTP_FROM || 'info@mobilegamehunt.com'
    })
  } catch (error) {
    console.error('[EMAIL TEST] Error:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}
