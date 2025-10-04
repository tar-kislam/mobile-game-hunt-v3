import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { calculateLevelProgress } from '@/lib/xpCalculator'

export const dynamic = 'force-dynamic'
export const revalidate = 0

type ScoreRow = {
  userId: string
  votes: number
  comments: number
  follows: number
  posts: number
  submits: number
  score: number
}

type NormalizedBadge = {
  id: string
  name: string
  icon?: string | null
}

async function fetchUserBadges(userIds: string[]) {
  // Olası join tablo isimleri (şemanıza göre biri tutacaktır)
  const candidates = [
    'userBadge',
    'userBadges',
    'badgeAward',
    'badgeAwards',
    'awardedBadge',
    'awardedBadges',
  ]

  const byUser = new Map<string, NormalizedBadge[]>()

  for (const key of candidates) {
    const client: any = prisma as any
    const model = client?.[key]
    if (!model || typeof model.findMany !== 'function') continue

    try {
      // Badge detayına erişmek için en yaygın isim 'badge' / 'Badge'
      const rows = await model.findMany({
        where: { userId: { in: userIds } },
        include: { badge: true },
      })

      if (!rows || rows.length === 0) continue

      for (const row of rows) {
        const uid: string = row.userId
        const b =
          row.badge ??
          row.Badge ??
          row // bazen join tablosu doğrudan badge alanlarını taşıyabilir

        // Alan isimlerini normalize et (hangisi varsa onu kullan)
        const id: string =
          b?.code ?? b?.slug ?? b?.name ?? b?.id ?? 'badge'
        const name: string =
          b?.title ?? b?.name ?? String(id)
        const icon: string | null =
          b?.icon ?? b?.image ?? b?.emoji ?? null

        const arr = byUser.get(uid) ?? []
        arr.push({ id: String(id), name: String(name), icon: icon ?? null })
        byUser.set(uid, arr)
      }

      // Bir modelden veri aldıysak diğerlerini denemeye gerek yok
      return byUser
    } catch {
      // Bu model tutmadı, diğer adaya geç
      continue
    }
  }

  // Hiçbiri tutmazsa boş dön
  return byUser
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url)
    const takeRaw = url.searchParams.get('take')
    const take = Math.max(1, Math.min(Number.isFinite(Number(takeRaw)) ? Number(takeRaw) : 5, 50))

    // Son 30 gün
    const since = new Date()
    since.setDate(since.getDate() - 30)

    // Önce admin olmayan kullanıcıları al
    const nonAdminUsers = await prisma.user.findMany({
      where: { role: { not: 'ADMIN' } },
      select: { id: true }
    });
    const nonAdminUserIds = nonAdminUsers.map(u => u.id);

    // Gruplamalar (tek transaction) - sadece admin olmayan kullanıcılar için
    const [votes, comments, follows, posts, submits] = await prisma.$transaction([
      prisma.vote.groupBy({
        by: ['userId'],
        where: { 
          createdAt: { gte: since },
          userId: { in: nonAdminUserIds }
        },
        _count: { userId: true },
        orderBy: { userId: 'asc' },
      }),
      prisma.productComment.groupBy({
        by: ['userId'],
        where: { 
          createdAt: { gte: since },
          userId: { in: nonAdminUserIds }
        },
        _count: { userId: true },
        orderBy: { userId: 'asc' },
      }),
      prisma.follow.groupBy({
        by: ['followerId'],
        where: { 
          createdAt: { gte: since },
          followerId: { in: nonAdminUserIds }
        },
        _count: { followerId: true },
        orderBy: { followerId: 'asc' },
      }),
      prisma.post.groupBy({
        by: ['userId'],
        where: { 
          createdAt: { gte: since },
          userId: { in: nonAdminUserIds }
        },
        _count: { userId: true },
        orderBy: { userId: 'asc' },
      }),
      prisma.product.groupBy({
        by: ['userId'],
        where: { 
          createdAt: { gte: since },
          userId: { in: nonAdminUserIds }
        },
        _count: { userId: true },
        orderBy: { userId: 'asc' },
      }),
    ])

    // Skor haritası
    const map = new Map<string, ScoreRow>()
    const ensure = (userId: string) => {
      let row = map.get(userId)
      if (!row) {
        row = { userId, votes: 0, comments: 0, follows: 0, posts: 0, submits: 0, score: 0 }
        map.set(userId, row)
      }
      return row
    }

    for (const v of votes)   ensure(v.userId).votes   = (v._count as any)?.userId || 0
    for (const c of comments) ensure(c.userId).comments = (c._count as any)?.userId || 0
    for (const f of follows)  ensure(f.followerId).follows = (f._count as any)?.followerId || 0
    for (const p of posts)    ensure(p.userId).posts   = (p._count as any)?.userId || 0
    for (const s of submits)  ensure(s.userId).submits = (s._count as any)?.userId || 0

    const top = Array.from(map.values())
      .map(r => ({
        ...r,
        // Ağırlıklar
        score: (r.votes * 2) + (r.comments * 3) + (r.follows) + (r.posts * 5) + (r.submits * 10),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, take)

    if (top.length === 0) {
      return NextResponse.json({ users: [] }, { headers: { 'Cache-Control': 'no-store' } })
    }

    // Kullanıcı temel bilgileri
    const userIds = top.map(t => t.userId)
    const userInfos = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { 
        id: true, 
        name: true, 
        image: true, 
        username: true,
        level: true,
        xp: true
      }
    })
    const infoById = new Map(userInfos.map(u => [u.id, u]))

    // Badge'leri esnekçe çek
    const badgesByUser = await fetchUserBadges(userIds)

    const payload = {
      users: top.map((r, i) => {
        const info = infoById.get(r.userId)
        const badges = badgesByUser.get(r.userId) ?? []
        const userXP = info?.xp || 0
        const calculatedLevel = calculateLevelProgress(userXP).level
        
        return {
          rank: i + 1,
          id: r.userId,
          name: info?.name ?? 'Anonymous',
          image: info?.image ?? null,
          username: info?.username ?? null,
          level: calculatedLevel, // Use calculated level from XP
          xp: userXP,
          score: r.score,
          votes: r.votes,
          comments: r.comments,
          follows: r.follows,
          posts: r.posts,
          submits: r.submits,
          badgesCount: badges.length,
          badges, // {id,name,icon?} listesi (mevcutsa)
        }
      }),
    }

    return NextResponse.json(payload, { headers: { 'Cache-Control': 'no-store' } })
  } catch (e) {
    console.error('[LEADERBOARD:USERS] error:', e)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}