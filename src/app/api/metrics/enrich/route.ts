import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { detectGeoInfo } from '@/lib/geo-detection'

export async function POST(request: NextRequest) {
  try {
    // Allow admin access or skip auth for this endpoint
    const session = await getServerSession(authOptions)
    // Skip auth check for now - this is a utility endpoint

    // Get metrics without country/language data
    const metricsToEnrich = await prisma.metric.findMany({
      where: {
        OR: [
          { country: null },
          { language: null }
        ]
      },
      select: {
        id: true,
        ipAddress: true,
        userAgent: true,
        country: true,
        language: true
      },
      take: 10 // Process in smaller batches for testing
    })

    if (metricsToEnrich.length === 0) {
      return NextResponse.json({ message: 'No metrics to enrich', processed: 0 })
    }

    let processed = 0
    const updates = []

    for (const metric of metricsToEnrich) {
      if (!metric.ipAddress || !metric.userAgent) continue

      const geoInfo = detectGeoInfo(metric.ipAddress, metric.userAgent)
      
      const updateData: any = {}
      if (!metric.country) updateData.country = geoInfo.country
      if (!metric.language) updateData.language = geoInfo.language

      if (Object.keys(updateData).length > 0) {
        updates.push(
          prisma.metric.update({
            where: { id: metric.id },
            data: updateData
          })
        )
        processed++
      }
    }

    // Execute all updates
    if (updates.length > 0) {
      await prisma.$transaction(updates)
    }

    return NextResponse.json({ 
      message: 'Metrics enriched successfully', 
      processed,
      total: metricsToEnrich.length
    })

  } catch (error) {
    console.error('Error enriching metrics:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
