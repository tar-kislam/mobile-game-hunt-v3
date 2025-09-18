import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session || session.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status') as any | null
  const sort = searchParams.get('sort') || 'date-desc'

  const orderBy = (() => {
    if (sort === 'date-asc') return { createdAt: 'asc' as const }
    if (sort === 'budget-desc') return { budgetTotal: 'desc' as const }
    if (sort === 'budget-asc') return { budgetTotal: 'asc' as const }
    return { createdAt: 'desc' as const }
  })()

  const where = status ? { status } : {}

  const campaigns = await prisma.advertiseCampaign.findMany({
    where,
    orderBy,
    include: {
      user: { select: { id: true, name: true, email: true } },
    },
  })

  return NextResponse.json(campaigns)
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session || session.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  const body = await req.json()
  const { id, status } = body as { id: string; status: 'PENDING' | 'APPROVED' | 'ACTIVE' | 'REJECTED' }
  if (!id || !status) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  await prisma.advertiseCampaign.update({ where: { id }, data: { status } })
  return NextResponse.json({ ok: true })
}


