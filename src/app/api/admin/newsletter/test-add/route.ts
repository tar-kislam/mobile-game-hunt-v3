import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// POST - Add test email to newsletter (admin only, no welcome email)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })
    }

    // Check if email already exists
    const existingSubscription = await prisma.newsletterSubscription.findUnique({
      where: { email }
    })

    if (existingSubscription) {
      if (existingSubscription.isActive) {
        return NextResponse.json({ 
          success: false, 
          error: 'Email already subscribed',
          id: existingSubscription.id
        }, { status: 400 })
      } else {
        // Reactivate subscription (no welcome email for test)
        await prisma.newsletterSubscription.update({
          where: { email },
          data: { isActive: true, updatedAt: new Date() }
        })
        return NextResponse.json({ 
          success: true, 
          message: 'Subscription reactivated',
          id: existingSubscription.id
        })
      }
    }

    // Create new subscription (no welcome email for test)
    const subscription = await prisma.newsletterSubscription.create({
      data: {
        email,
        isActive: true
      }
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Test email added successfully',
      id: subscription.id
    })
  } catch (error) {
    console.error('Error adding test email:', error)
    return NextResponse.json({ error: 'Failed to add test email' }, { status: 500 })
  }
}

