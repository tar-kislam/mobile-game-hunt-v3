import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { RateLimiter } from '@/lib/rate-limiter'

function sanitize(str?: string | null) {
  return (str || '').trim()
}

function normalizeStoreUrl(url?: string | null) {
  if (!url) return ''
  try {
    const u = new URL(url)
    // Keep origin + pathname; drop query/ref to avoid duplicates via trackers
    return `${u.origin}${u.pathname}`
  } catch {
    return ''
  }
}

export async function GET(req: NextRequest) {
  try {
    // basic rate limit: 5 req/sec per IP
    const rl = await RateLimiter.getInstance().checkLimit(req, { windowMs: 1000, maxRequests: 5 })
    if (!rl.allowed) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    const { searchParams } = new URL(req.url)
    const rawTitle = searchParams.get('title')
    const rawIos = searchParams.get('iosUrl')
    const rawAndroid = searchParams.get('androidUrl')
    const excludeId = searchParams.get('excludeId') || undefined

    const title = sanitize(rawTitle)
    const iosUrl = normalizeStoreUrl(rawIos)
    const androidUrl = normalizeStoreUrl(rawAndroid)

    const [titleExists, iosExists, androidExists] = await Promise.all([
      title
        ? prisma.product.findFirst({ where: { title: { equals: title, mode: 'insensitive' }, NOT: excludeId ? { id: excludeId } : undefined }, select: { id: true, slug: true } })
        : null,
      iosUrl
        ? prisma.product.findFirst({ where: { iosUrl, NOT: excludeId ? { id: excludeId } : undefined }, select: { id: true } })
        : null,
      androidUrl
        ? prisma.product.findFirst({ where: { androidUrl, NOT: excludeId ? { id: excludeId } : undefined }, select: { id: true } })
        : null,
    ])

    return NextResponse.json({
      titleExists: !!titleExists,
      iosExists: !!iosExists,
      androidExists: !!androidExists,
      existingSlug: titleExists?.slug || null,
      existingId: titleExists?.id || null,
    })
  } catch (error) {
    console.error('validate-game error', error)
    return NextResponse.json({ error: 'Validation failed' }, { status: 500 })
  }
}
