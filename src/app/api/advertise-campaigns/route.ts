import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    const body = await req.json()

    // Normalize arrays from comma-separated strings if needed
    const normalizeList = (value: unknown): string[] => {
      if (Array.isArray(value)) return value.map(String)
      if (typeof value === 'string') {
        return value.split(',').map((s) => s.trim()).filter(Boolean)
      }
      return []
    }

    const data = {
      userId: session?.user?.id ?? null,
      goal: String(body.advertisingGoal || body.goal || ''),
      placements: normalizeList(body.placements ?? body.promotionFocus ?? []),
      durationType: String(body.durationType ?? body.duration ?? ''),
      totalPrice: Number(body.totalPrice ?? 0),
      priceBreakdown: body.priceBreakdown ?? null,
      gameId: body.gameId ? String(body.gameId) : null,
      campaignTagline: body.campaignTagline ? String(body.campaignTagline) : null,
      creativeUrl: body.creativeUrl ? String(body.creativeUrl) : null,
      budgetDaily: Number(body.dailyBudget ?? body.budget?.daily ?? 0),
      budgetTotal: Number(body.totalBudget ?? body.budget?.total ?? 0),
      duration: String(body.duration ?? body.budget?.duration ?? ''),
      countries: normalizeList(body.countries ?? body.audience?.countries ?? []),
      platforms: normalizeList(body.platforms ?? body.audience?.platforms ?? []),
      ageGroups: normalizeList(body.ageGroups ?? body.audience?.age ?? []),
      promotionFocus: normalizeList(body.promotionFocus ?? []),
      bannerPlacement: String(body.bannerPlacement ?? body.format?.bannerPlacement ?? ''),
      featuredSlot: String(body.featuredSlot ?? body.format?.featuredSlot ?? ''),
      newsletterHighlight: String(body.newsletterHighlight ?? body.format?.newsletterHighlight ?? ''),
      strategySuggestion: body.strategySuggestion ? String(body.strategySuggestion) : null,
      contactEmail: body.contactEmail ? String(body.contactEmail) : null,
      notes: body.notes ? String(body.notes) : null,
    }

    // Basic required validation
    const missing = [] as string[]
    if (!data.goal) missing.push('goal')
    if (!data.placements?.length) missing.push('placements')
    if (!data.durationType) missing.push('durationType')
    if (!data.budgetDaily) missing.push('budgetDaily')
    if (!data.budgetTotal) missing.push('budgetTotal')
    if (!data.duration) missing.push('duration')
    if (!data.bannerPlacement) missing.push('bannerPlacement')
    if (!data.featuredSlot) missing.push('featuredSlot')
    if (!data.newsletterHighlight) missing.push('newsletterHighlight')
    if (missing.length) {
      return NextResponse.json({ error: `Missing fields: ${missing.join(', ')}` }, { status: 400 })
    }

    const created = await prisma.advertiseCampaign.create({ data })

    // Also persist a simplified ad request row for dashboard queueing
    try {
      await prisma.adRequest.create({
        data: {
          userId: data.userId || '',
          gameId: data.gameId || '',
          gameName: String(body.gameName || ''),
          promotionType: (data.placements?.[0] || 'featured'),
          package: data.durationType || 'daily',
          duration: data.duration || '',
          price: data.totalPrice || 0,
          status: 'PENDING',
        }
      })
    } catch (e) {
      console.warn('[AD REQUEST] Failed to create simplified ad request, continuing', e)
    }

    return NextResponse.json({ ok: true, id: created.id }, { status: 201 })
  } catch (err) {
    console.error('Advertise campaign create failed', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


