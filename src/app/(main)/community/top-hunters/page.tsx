export const dynamic = "force-dynamic";
export const revalidate = 0;
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { CommunitySidebar } from '@/components/community/community-sidebar'
import { Badge } from '@/components/ui/badge'
import { prisma } from '@/lib/prisma'

async function computeTopHunters(limit: number = 20) {
  const users = await prisma.user.findMany({ select: { id: true, name: true, image: true } })
  const scored = await Promise.all(users.map(async (u) => {
    const [postsCount, likesCount, commentsCount] = await Promise.all([
      prisma.post.count({ where: { userId: u.id } }),
      prisma.like.count({ where: { post: { userId: u.id } } }),
      prisma.postComment.count({ where: { post: { userId: u.id } } }),
    ])
    const engagementScore = postsCount * 2 + likesCount + commentsCount
    return { userId: u.id, name: u.name, avatar: u.image, postsCount, likesCount, commentsCount, engagementScore }
  }))
  return scored.filter(u => u.engagementScore > 0).sort((a, b) => b.engagementScore - a.engagementScore).slice(0, limit)
}

export default async function TopHuntersPage() {
  const users = await computeTopHunters(20)
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
      <div className="container mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
        <aside className="lg:col-span-1 hidden lg:block">
          <CommunitySidebar />
        </aside>
        <main className="lg:col-span-2 space-y-6">
          <Card className="bg-card/50 border-white/10 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-xl font-semibold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">Top Hunters</CardTitle>
            </CardHeader>
            <CardContent>
              {(!users || users.length === 0) ? (
                <div className="text-center text-muted-foreground py-8">No data yet</div>
              ) : (
                <div className="space-y-3">
                  {users.map((u: any, idx: number) => {
                    const medal = idx === 0
                      ? { emoji: '🥇', badge: 'bg-yellow-500/20 text-yellow-300 border-yellow-400/40', glow: 'shadow-[0_0_24px_rgba(234,179,8,0.45)]' }
                      : idx === 1
                      ? { emoji: '🥈', badge: 'bg-gray-400/20 text-gray-200 border-gray-300/40', glow: 'shadow-[0_0_24px_rgba(209,213,219,0.35)]' }
                      : idx === 2
                      ? { emoji: '🥉', badge: 'bg-orange-500/20 text-orange-300 border-orange-400/40', glow: 'shadow-[0_0_24px_rgba(249,115,22,0.40)]' }
                      : null
                    return (
                    <div key={u.userId} className={`flex items-center justify-between rounded-lg border border-white/10 bg-background/40 px-4 py-3 ${medal ? medal.glow : ''}`}>
                      <div className="flex items-center gap-4">
                        {medal ? (
                          <Badge variant="secondary" className={`${medal.badge} border ${medal.glow?.replace('shadow-', 'shadow-') || ''}`}>{medal.emoji}</Badge>
                        ) : (
                          <div className="w-8 text-center font-semibold text-blue-400">#{idx + 1}</div>
                        )}
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={u.avatar || ''} />
                          <AvatarFallback>{(u.name || 'U')[0]}</AvatarFallback>
                        </Avatar>
                        <div className="font-medium">{u.name || 'Unknown'}</div>
                      </div>
                      <div className="flex items-center gap-6 text-sm text-muted-foreground">
                        <div>Posts <span className="text-foreground ml-1">{u.postsCount}</span></div>
                        <div>Likes <span className="text-foreground ml-1">{u.likesCount}</span></div>
                        <div>Comments <span className="text-foreground ml-1">{u.commentsCount}</span></div>
                        <Badge variant="secondary" className="bg-purple-500/20 text-purple-300 border-purple-500/30">{u.engagementScore}</Badge>
                      </div>
                    </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </main>
        <aside className="lg:col-span-1" />
      </div>
    </div>
  )
}


