import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { CommunityFeed } from '@/components/community/community-feed'
import { TrendingTopics } from '@/components/community/trending-topics'
import { CommunitySidebar } from '@/components/community/community-sidebar'
import { prisma } from '@/lib/prisma'

async function fetchUserPostsDirect(userId: string) {
  try {
    const posts = await prisma.post.findMany({
      where: { userId },
      include: {
        user: { select: { id: true, name: true, image: true } },
        _count: { select: { likes: true, comments: true } }
      },
      orderBy: { createdAt: 'desc' }
    })
    return { posts }
  } catch {
    return { posts: [] }
  }
}

export default async function MyPostsPage() {
  const session = await getServerSession(authOptions)
  const userId = session?.user?.id

  let posts: any[] = []
  if (userId) {
    const data = await fetchUserPostsDirect(userId)
    posts = data.posts || []
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
      <div className="container mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
        <aside className="lg:col-span-1 hidden lg:block">
          <CommunitySidebar />
        </aside>
        <main className="lg:col-span-2 space-y-6">

          {!userId && (
            <Card className="bg-card/50 border-white/10 backdrop-blur-sm">
              <CardContent className="p-8 text-center text-muted-foreground">
                Please sign in to view your posts.
              </CardContent>
            </Card>
          )}

          {userId && posts.length === 0 && (
            <Card className="bg-card/50 border-white/10 backdrop-blur-sm">
              <CardContent className="p-10 text-center">
                <div className="text-6xl mb-3">📝</div>
                <div className="text-lg font-semibold mb-1">You haven’t posted anything yet.</div>
                <div className="text-muted-foreground">Start posting in the Community!</div>
              </CardContent>
            </Card>
          )}

          {userId && posts.length > 0 && (
            <CommunityFeed 
              posts={posts} 
              currentUserId={userId as string}
            />
          )}
        </main>
        <aside className="lg:col-span-1">
          <TrendingTopics topics={[]} />
        </aside>
      </div>
    </div>
  )
}


