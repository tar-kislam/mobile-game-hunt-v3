export const dynamic = "force-dynamic";
export const revalidate = 0;
import { Suspense } from 'react'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { CommunityFeed } from '@/components/community/community-feed'
import { CommunityFeedContainer } from '@/components/community/CommunityFeedContainer'
import { TrendingTopicsWrapper } from '@/components/community/trending-topics-wrapper'
import { CommunitySidebar } from '@/components/community/community-sidebar'
import { CreatePostBox } from '@/components/community/create-post-box'
import { Skeleton } from '@/components/ui/skeleton'
import { CreatePostRefresh } from '@/components/community/CreatePostRefresh'
import { Button } from '@/components/ui/button'

export default async function CommunityPage() {
  const session = await getServerSession(authOptions)
  
  // Fetch posts with user data
  let posts = []
  let trendingTopics = []
  
  try {
    posts = await prisma.post.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          }
        },
        likes: true,
        poll: {
          include: {
            options: {
              include: {
                _count: {
                  select: { votes: true }
                }
              }
            }
          }
        },
        _count: {
          select: {
            likes: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 20
    })

    // Fetch trending topics (most used hashtags in posts)
    const trendingTags = await prisma.post.findMany({
      select: {
        hashtags: true,
      },
      where: {
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
        },
        hashtags: { not: Prisma.JsonNull }
      }
    })

    // Count hashtag usage
    const tagCounts: Record<string, number> = {}
    trendingTags.forEach(post => {
      if (post.hashtags && Array.isArray(post.hashtags)) {
        const tags = post.hashtags as unknown as Array<unknown>
        tags.forEach((hashtag) => {
          if (typeof hashtag === 'string' && hashtag.trim()) {
            const cleanHashtag = hashtag.trim().toLowerCase()
            tagCounts[cleanHashtag] = (tagCounts[cleanHashtag] || 0) + 1
          }
        })
      }
    })

    // Get top 5 trending hashtags
    trendingTopics = Object.entries(tagCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([tag]) => `#${tag}`)
  } catch (error) {
    console.error('Error fetching community data:', error)
    posts = []
    trendingTopics = ['#IndieDev', '#PixelArt', '#GameDev', '#MobileGames', '#Unity']
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
      <div className="container mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
        <aside className="lg:col-span-1 hidden lg:block">
          <Suspense fallback={<Skeleton className="h-64 w-full rounded-xl" />}>
            <CommunitySidebar />
          </Suspense>
        </aside>
        <main className="lg:col-span-2 space-y-6">
          {/* Create Post Box */}
          {session ? (
            <Suspense fallback={<Skeleton className="h-40 w-full rounded-xl" />}>
              <CreatePostBox />
            </Suspense>
          ) : (
            <div className="bg-card/50 border-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
              <h3 className="text-lg font-semibold text-white mb-2">Join the Conversation</h3>
              <p className="text-gray-400 mb-4">Sign in to share your thoughts with the community</p>
              <Button asChild className="bg-blue-600 hover:bg-blue-700">
                <a href="/auth/signin">Sign In to Post</a>
              </Button>
            </div>
          )}
          {/* lightweight client refresh hook for after-create */}
          <CreatePostRefresh trigger={0} />
          <CommunityFeedContainer />
        </main>
        <aside className="lg:col-span-1">
          <Suspense fallback={<Skeleton className="h-64 w-full rounded-xl" />}>
            <TrendingTopicsWrapper topics={trendingTopics} />
          </Suspense>
        </aside>
      </div>
    </div>
  )
}