import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendWelcomeEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    console.log('[BULK EMAIL] Starting bulk welcome email campaign...')

    // Tüm aktif aboneleri al
    const subscribers = await prisma.newsletterSubscription.findMany({
      where: {
        isActive: true
      },
      select: {
        email: true
      }
    })

    console.log(`[BULK EMAIL] Found ${subscribers.length} active subscribers`)

    const results = {
      total: subscribers.length,
      sent: 0,
      failed: 0,
      errors: [] as string[]
    }

    // Her aboneye email gönder (rate limiting için batch'ler halinde)
    const batchSize = 5 // Küçük batch size ile başla
    for (let i = 0; i < subscribers.length; i += batchSize) {
      const batch = subscribers.slice(i, i + batchSize)
      
      const batchPromises = batch.map(async (subscriber) => {
        try {
          console.log(`[BULK EMAIL] Sending to: ${subscriber.email}`)
          const result = await sendWelcomeEmail(subscriber.email)
          if (result.success) {
            results.sent++
            console.log(`[BULK EMAIL] ✅ Sent to: ${subscriber.email}`)
          } else {
            results.failed++
            results.errors.push(`${subscriber.email}: ${result.error}`)
            console.log(`[BULK EMAIL] ❌ Failed to send to: ${subscriber.email} - ${result.error}`)
          }
        } catch (error) {
          results.failed++
          const errorMsg = error instanceof Error ? error.message : 'Unknown error'
          results.errors.push(`${subscriber.email}: ${errorMsg}`)
          console.log(`[BULK EMAIL] ❌ Error sending to: ${subscriber.email} - ${errorMsg}`)
        }
      })

      await Promise.all(batchPromises)
      
      // Rate limiting - batch'ler arası 3 saniye bekle
      if (i + batchSize < subscribers.length) {
        console.log(`[BULK EMAIL] Waiting 3 seconds before next batch...`)
        await new Promise(resolve => setTimeout(resolve, 3000))
      }
    }

    console.log(`[BULK EMAIL] Campaign completed: ${results.sent}/${results.total} emails sent`)

    return NextResponse.json({
      success: true,
      message: `Bulk welcome email campaign completed`,
      results: {
        total: results.total,
        sent: results.sent,
        failed: results.failed,
        errors: results.errors.slice(0, 10) // İlk 10 hatayı göster
      }
    })

  } catch (error) {
    console.error('[BULK EMAIL] Campaign failed:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
