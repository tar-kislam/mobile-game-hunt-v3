import { Suspense } from 'react'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { CommunityFeed } from '@/components/community/community-feed'
import { CommunityFeedContainer } from '@/components/community/CommunityFeedContainer'
import { TrendingTopics } from '@/components/community/trending-topics'
import { CommunitySidebar } from '@/components/community/community-sidebar'
import { CreatePostBox } from '@/components/community/create-post-box'
import { Skeleton } from '@/components/ui/skeleton'
import { CreatePostRefresh } from '@/components/community/CreatePostRefresh'

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
        comments: {
          select: {
            id: true,
          }
        },
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
            comments: true,
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
        hashtags: {
          not: null
        }
      }
    })

    // Count hashtag usage
    const tagCounts: Record<string, number> = {}
    trendingTags.forEach(post => {
      if (post.hashtags && Array.isArray(post.hashtags)) {
        post.hashtags.forEach((hashtag: string) => {
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
          {session && (
            <Suspense fallback={<Skeleton className="h-40 w-full rounded-xl" />}>
              <CreatePostBox />
            </Suspense>
          )}
          {/* lightweight client refresh hook for after-create */}
          <CreatePostRefresh trigger={0} />
          <CommunityFeedContainer />
        </main>
        <aside className="lg:col-span-1">
          <Suspense fallback={<Skeleton className="h-64 w-full rounded-xl" />}>
            <TrendingTopics topics={trendingTopics} />
          </Suspense>
        </aside>
      </div>
    </div>
  )
}