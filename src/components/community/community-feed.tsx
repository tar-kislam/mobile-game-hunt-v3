import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Heart, MessageCircle, Share2, MoreHorizontal } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import Image from 'next/image'
import Link from 'next/link'

interface Post {
  id: string
  content: string
  imageUrl?: string | null
  tags: string[]
  likes: number
  createdAt: Date
  user: {
    id: string
    name: string | null
    image: string | null
  }
  _count: {
    postLikes: number
    comments: number
  }
}

interface CommunityFeedProps {
  posts: Post[]
  currentUserId?: string
}

export function CommunityFeed({ posts, currentUserId }: CommunityFeedProps) {
  if (posts.length === 0) {
    return (
      <Card className="bg-card/50 border-white/10 backdrop-blur-sm">
        <CardContent className="p-8 text-center">
          <div className="text-muted-foreground">
            <h3 className="text-lg font-semibold mb-2">No posts yet</h3>
            <p>Be the first to share something with the community!</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {posts.map((post) => (
        <Card 
          key={post.id} 
          className="bg-card/50 border-white/10 backdrop-blur-sm hover:border-blue-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10"
        >
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={post.user.image || ''} />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                    {post.user.name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <Link 
                    href={`/profile/${post.user.id}`}
                    className="font-semibold hover:text-blue-400 transition-colors"
                  >
                    {post.user.name || 'Anonymous'}
                  </Link>
                  <p className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* Post Content */}
            <div className="prose prose-invert max-w-none">
              <p className="whitespace-pre-wrap">{post.content}</p>
            </div>

            {/* Post Image */}
            {post.imageUrl && (
              <div className="relative rounded-lg overflow-hidden">
                <Image
                  src={post.imageUrl}
                  alt="Post image"
                  width={600}
                  height={400}
                  className="w-full h-auto object-cover"
                />
              </div>
            )}

            {/* Tags */}
            {post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <Badge 
                    key={tag} 
                    variant="secondary" 
                    className="bg-blue-500/20 text-blue-300 border-blue-500/30 hover:bg-blue-500/30 transition-colors cursor-pointer"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-white/10">
              <div className="flex items-center space-x-6">
                <Button variant="ghost" size="sm" className="hover:text-red-400">
                  <Heart className="h-4 w-4 mr-1" />
                  {post._count.postLikes}
                </Button>
                <Button variant="ghost" size="sm" className="hover:text-blue-400">
                  <MessageCircle className="h-4 w-4 mr-1" />
                  {post._count.comments}
                </Button>
                <Button variant="ghost" size="sm" className="hover:text-green-400">
                  <Share2 className="h-4 w-4 mr-1" />
                  Share
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
