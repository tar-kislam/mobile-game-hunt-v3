import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()

    // Normalize accepted payloads
    // v1 (detailed wizard): advertisingGoal, promotionFocus, durationType, ...
    // v2 (simple): goal, package, promotions, game, notes, email
    const advertisingGoal: string = body.advertisingGoal ?? body.goal
    const promotionFocus: string[] = Array.isArray(body.promotionFocus)
      ? body.promotionFocus
      : Array.isArray(body.placements)
        ? body.placements
        : Array.isArray(body.promotions)
          ? body.promotions
          : []
    const durationType: 'daily' | 'weekly' | 'monthly' = body.durationType ?? body.package
    const totalPrice: number = Number(body.totalPrice) || 0
    const priceBreakdown: any = body.priceBreakdown ?? {}
    const strategySuggestion: string | undefined = body.strategySuggestion
    const gameId: string | undefined = body.gameId
    const gameName: string | undefined = body.gameName ?? body.game
    // Always attach contact email from auth session; ignore client-provided email
    const contactEmail: string | undefined = session.user.email || undefined
    const notes: string | undefined = body.notes

    // Create AdRequest with nested AdvertiseCampaign for traceability
    const adRequest = await prisma.adRequest.create({
      data: {
        userId: session.user.id,
        gameId: gameId,
        gameName: gameName,
        promotionType: advertisingGoal, // legacy field mapping
        packageType: durationType,
        duration: durationType,
        price: totalPrice,
        status: 'PENDING',
        AdvertiseCampaign: {
          create: {
            userId: session.user.id,
            advertisingGoal,
            promotionType: promotionFocus?.join(', ') || 'N/A',
            packageType: durationType,
            durationDays: durationType === 'daily' ? 1 : durationType === 'weekly' ? 7 : 30,
            totalPrice,
            priceBreakdown,
            strategySuggestion,
            placements: promotionFocus || [],
            gameId: gameId ?? null,
            gameName: gameName ?? null,
            // Optional extras (kept for schema compatibility)
            campaignTagline: body.campaignTagline ?? null,
            creativeUrl: body.creativeUrl ?? null,
            contactEmail: contactEmail ?? null,
          },
        },
      },
      include: { AdvertiseCampaign: true },
    })

    // Optionally store contactEmail/notes if your schema supports it
    // (ignored here to keep compatibility)

    return NextResponse.json(adRequest, { status: 200 })
  } catch (error) {
    console.error('Error submitting campaign:', error)
    return NextResponse.json({ error: 'Failed to submit campaign' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const client: any = prisma as any
    let items
    if (client.adRequest) {
      items = await client.adRequest.findMany({
        include: { AdvertiseCampaign: true, user: { select: { email: true, name: true } } },
        orderBy: { createdAt: 'desc' },
      })
    } else {
      // Fallback for environments where AdRequest model is not available in the generated client
      items = await prisma.advertiseCampaign.findMany({
        include: { user: { select: { email: true, name: true } } },
        orderBy: { createdAt: 'desc' },
      })
      // Normalize shape to match AdRequest list expectations
      items = items.map((c: any) => ({
        id: c.id,
        user: c.user,
        promotionType: c.promotionType,
        packageType: c.packageType,
        duration: String(c.durationDays ?? ''),
        gameName: c.gameName,
        status: c.status,
        createdAt: c.createdAt,
        AdvertiseCampaign: {
          advertisingGoal: c.advertisingGoal,
          placements: c.placements,
          totalPrice: c.totalPrice,
        },
        price: c.totalPrice,
      }))
    }
    return NextResponse.json(items)
  } catch (error) {
    console.error('Error fetching campaigns:', error)
    return NextResponse.json({ error: 'Failed to fetch campaigns' }, { status: 500 })
  }
}


