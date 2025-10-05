import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function tokenize(text: string): string[] {
  return (text || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s,_-]/g, ' ')
    .split(/[\s,._-]+/)
    .filter(Boolean)
}

function vectorize(tokens: string[]): Map<string, number> {
  const map = new Map<string, number>()
  for (const t of tokens) map.set(t, (map.get(t) || 0) + 1)
  return map
}

function cosineSim(a: Map<string, number>, b: Map<string, number>): number {
  let dot = 0
  let na = 0
  let nb = 0
  a.forEach((va, k) => {
    na += va * va
    const vb = b.get(k) || 0
    dot += va * vb
  })
  b.forEach((vb, k) => {
    nb += vb * vb
  })
  if (na === 0 || nb === 0) return 0
  return dot / (Math.sqrt(na) * Math.sqrt(nb))
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const likes = searchParams.get('likes') || ''
    const take = Math.min(parseInt(searchParams.get('take') || '8'), 24)

    const likeTokens = tokenize(likes)
    const likeVec = vectorize(likeTokens)

    const products = await prisma.product.findMany({
      where: { status: 'PUBLISHED' },
      include: {
        _count: { select: { votes: true, comments: true } },
        user: { select: { id: true, name: true, image: true } }
      },
      orderBy: { createdAt: 'desc' }
    })

    const scored = products.map((p) => {
      const corpus = [
        p.title,
        p.tagline || '',
        p.description || '',
        ...(p.platforms || []).join(' '),
        ...(p.countries || []).join(' ')
      ].join(' ')
      const vec = vectorize(tokenize(corpus))
      const score = cosineSim(likeVec, vec)
      return { product: p, score }
    })
      .filter(s => s.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, take)

    return NextResponse.json({ likes: likeTokens, products: scored.map(s => ({ ...s.product, _score: s.score })) })
  } catch (e) {
    console.error('recommend error', e)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}


