import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    // Get a game ID to use for test data
    const game = await prisma.product.findFirst({
      select: { id: true }
    })

    if (!game) {
      return NextResponse.json({ error: 'No games found' }, { status: 404 })
    }

    // Create test metrics with realistic country and language data
    const testMetrics = [
      { country: 'United States', language: 'en', type: 'view' },
      { country: 'United States', language: 'en', type: 'click' },
      { country: 'Turkey', language: 'tr', type: 'view' },
      { country: 'Turkey', language: 'tr', type: 'click' },
      { country: 'Germany', language: 'de', type: 'view' },
      { country: 'United Kingdom', language: 'en', type: 'view' },
      { country: 'France', language: 'fr', type: 'view' },
      { country: 'Japan', language: 'ja', type: 'view' },
      { country: 'South Korea', language: 'ko', type: 'view' },
      { country: 'Brazil', language: 'pt', type: 'view' },
      { country: 'Spain', language: 'es', type: 'view' },
      { country: 'Italy', language: 'it', type: 'view' },
      { country: 'Russia', language: 'ru', type: 'view' },
      { country: 'China', language: 'zh', type: 'view' },
      { country: 'India', language: 'en', type: 'view' },
      { country: 'Canada', language: 'en', type: 'view' },
      { country: 'Australia', language: 'en', type: 'view' },
      { country: 'Netherlands', language: 'en', type: 'view' },
      { country: 'Sweden', language: 'en', type: 'view' },
      { country: 'Norway', language: 'en', type: 'view' }
    ]

    const createdMetrics = []
    for (const metric of testMetrics) {
      const created = await prisma.metric.create({
        data: {
          gameId: game.id,
          type: metric.type,
          country: metric.country,
          language: metric.language,
          userAgent: `Mozilla/5.0 (compatible; test-${metric.language})`,
          ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
          timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000) // Random time in last 7 days
        }
      })
      createdMetrics.push(created)
    }

    return NextResponse.json({ 
      message: 'Test data created successfully', 
      created: createdMetrics.length,
      gameId: game.id
    })

  } catch (error) {
    console.error('Error creating test data:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
