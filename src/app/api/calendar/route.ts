import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const yearParam = searchParams.get('year')
    let yearFilter: { gte?: Date; lt?: Date } | undefined

    if (yearParam) {
      const y = parseInt(yearParam, 10)
      if (!isNaN(y)) {
        yearFilter = {
          gte: new Date(y, 0, 1),
          lt: new Date(y + 1, 0, 1),
        }
      }
    }

    const products = await prisma.product.findMany({
      where: {
        status: 'PUBLISHED',
        releaseAt: {
          not: null,
          ...(yearFilter ?? {}),
        },
      },
      select: {
        id: true,
        title: true,
        tagline: true,
        description: true,
        thumbnail: true,
        platforms: true,
        countries: true,
        releaseAt: true,
        categories: {
          select: {
            category: { select: { id: true, name: true } },
          },
        },
        user: { select: { name: true } },
      },
      orderBy: { releaseAt: 'asc' },
    })

    return NextResponse.json(products)
  } catch (error) {
    console.error('Calendar API error:', error)
    return NextResponse.json({ error: 'Failed to load calendar' }, { status: 500 })
  }
}


