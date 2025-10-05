import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const yearParam = searchParams.get('year')
    const platformParam = searchParams.get('platform')
    const countryParam = searchParams.get('country')
    const categoryParam = searchParams.get('categoryId')
    
    let yearFilter: { gte?: Date; lt?: Date } | undefined
    let platformFilter: { hasSome: string[] } | undefined
    let countryFilter: { hasSome: string[] } | undefined
    let categoryFilter: { some: { categoryId: string } } | undefined

    if (yearParam) {
      const y = parseInt(yearParam, 10)
      if (!isNaN(y)) {
        yearFilter = {
          gte: new Date(y, 0, 1),
          lt: new Date(y + 1, 0, 1),
        }
      }
    }

    if (platformParam && platformParam !== 'all') {
      platformFilter = { hasSome: [platformParam.toLowerCase()] }
    }

    if (countryParam && countryParam !== 'all') {
      countryFilter = { hasSome: [countryParam] }
    }

    if (categoryParam && categoryParam !== 'all') {
      categoryFilter = { some: { categoryId: categoryParam } }
    }

    const products = await prisma.product.findMany({
      where: {
        status: 'PUBLISHED',
        releaseAt: {
          not: null,
          ...(yearFilter ?? {}),
        },
        ...(platformFilter && { platforms: platformFilter }),
        ...(countryFilter && { countries: countryFilter }),
        ...(categoryFilter && { categories: categoryFilter }),
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


