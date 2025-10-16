import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendWelcomeEmail } from '@/lib/email'

// POST /api/newsletter/subscribe
export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })
    }

    console.log(`[NEWSLETTER] Processing subscription for: ${email}`)

    // Check if email already exists
    const existingSubscription = await prisma.newsletterSubscription.findUnique({
      where: { email }
    })

    if (existingSubscription) {
      if (existingSubscription.isActive) {
        console.log(`[NEWSLETTER] Email ${email} already subscribed`)
        return NextResponse.json({ message: 'Already subscribed' }, { status: 200 })
      } else {
        // Reactivate subscription
        console.log(`[NEWSLETTER] Reactivating subscription for: ${email}`)
        await prisma.newsletterSubscription.update({
          where: { email },
          data: { isActive: true, updatedAt: new Date() }
        })
        
        // Send welcome email for reactivated subscription
        const emailResult = await sendWelcomeEmail(email)
        if (!emailResult.success) {
          console.error(`[NEWSLETTER] Failed to send welcome email to ${email}:`, emailResult.error)
        }
        
        return NextResponse.json({ message: 'Subscription reactivated successfully' })
      }
    }

    // Create new subscription
    console.log(`[NEWSLETTER] Creating new subscription for: ${email}`)
    await prisma.newsletterSubscription.create({
      data: {
        email,
        isActive: true
      }
    })

    // Send welcome email to new subscriber
    console.log(`[NEWSLETTER] Sending welcome email to: ${email}`)
    const emailResult = await sendWelcomeEmail(email)
    
    if (emailResult.success) {
      console.log(`[NEWSLETTER] Welcome email sent successfully to: ${email}`)
      return NextResponse.json({ message: 'Subscribed successfully' })
    } else {
      console.error(`[NEWSLETTER] Failed to send welcome email to ${email}:`, emailResult.error)
      // Still return success since subscription was created, but log the email failure
      return NextResponse.json({ 
        message: 'Subscribed successfully', 
        warning: 'Welcome email could not be sent' 
      })
    }
  } catch (error) {
    console.error('[NEWSLETTER] Subscription error:', error)
    return NextResponse.json({ error: 'Failed to subscribe to newsletter' }, { status: 500 })
  }
}
