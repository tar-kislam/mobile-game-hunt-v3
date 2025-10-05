import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Get all products with release dates
    const products = await prisma.product.findMany({
      where: {
        status: 'PUBLISHED',
        releaseAt: { not: null }
      },
      select: { 
        platforms: true, 
        countries: true, 
        releaseAt: true,
        categories: {
          select: {
            category: { select: { id: true, name: true } }
          }
        }
      }
    })

    // Process platforms (flatten arrays and get unique values)
    const platforms = Array.from(
      new Set(
        products
          .flatMap(p => p.platforms || [])
          .filter(Boolean)
          .map(p => p.toUpperCase())
      )
    ).sort()

    // Process countries (flatten arrays and get unique values)
    const countries = Array.from(
      new Set(
        products
          .flatMap(p => p.countries || [])
          .filter(Boolean)
      )
    ).sort()

    // Process categories (deduplicate by ID)
    const categoryMap = new Map()
    products
      .flatMap(p => p.categories || [])
      .map(c => c.category)
      .filter(Boolean)
      .forEach(category => {
        categoryMap.set(category.id, category)
      })
    const categories = Array.from(categoryMap.values()).sort((a, b) => a.name.localeCompare(b.name))

    // Process years
    const years = Array.from(
      new Set(
        products
          .map(p => new Date(p.releaseAt!).getFullYear())
          .filter(year => !isNaN(year))
      )
    ).sort((a, b) => b - a) // Sort descending (newest first)

    return NextResponse.json({
      platforms,
      countries,
      categories,
      years
    })
  } catch (error) {
    console.error('Calendar filters API error:', error)
    return NextResponse.json({ error: 'Failed to load filter options' }, { status: 500 })
  }
}
