import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { OriginalPostCard } from '@/components/community/OriginalPostCard'
import { PostActionBar } from '@/components/community/PostActionBar'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface PostPageProps {
  params: Promise<{ id: string }>
}

async function getPost(id: string) {
  try {
    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true
          }
        },
        _count: {
          select: {
            likes: true
          }
        }
      }
    })
    return post
  } catch (error) {
    console.error('Error fetching post:', error)
    return null
  }
}


export default async function PostPage({ params }: PostPageProps) {
  const { id } = await params
  const post = await getPost(id)

  if (!post) {
    notFound()
  }

  // Debug logging
  console.log('[POST DETAIL] Post ID:', post.id)
  console.log('[POST DETAIL] Post content:', post.content)
  console.log('[POST DETAIL] Post user:', post.user.name)
  console.log('[POST DETAIL] Post counts:', post._count)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-center space-x-4">
            <Link href="/community">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h1 className="text-xl font-semibold text-foreground">Post</h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[650px] mx-auto">
        {/* Original Post */}
        <div className="border-b border-border/40">
          <OriginalPostCard post={post} />
          <PostActionBar 
            postId={id}
            likeCount={post._count?.likes ?? 0}
          />
        </div>

      </div>
    </div>
  )
}

export async function generateMetadata({ params }: PostPageProps) {
  const { id } = await params
  const post = await getPost(id)
  
  if (!post) {
    return {
      title: 'Post Not Found'
    }
  }

  return {
    title: `Post • ${post.user.name} - Mobile Game Hunt`,
    description: `View ${post.user.name}'s post`
  }
}
