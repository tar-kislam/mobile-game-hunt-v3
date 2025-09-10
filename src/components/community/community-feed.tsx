"use client"
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Heart, MessageCircle, Share2, MoreHorizontal, Trash2 } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import Image from 'next/image'
import Link from 'next/link'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { toast } from 'sonner'

interface Post {
  id: string
  content: string
  images?: string[] | null
  hashtags?: string[] | null
  createdAt: Date
  user: {
    id: string
    name: string | null
    image: string | null
  }
  _count: {
    likes: number
    comments: number
  }
}

interface CommunityFeedProps {
  posts: Post[]
  currentUserId?: string
  onTagClick?: (tag: string) => void
  onToggleLike?: (postId: string) => Promise<void> | void
}

export function CommunityFeed({ posts, currentUserId, onTagClick, onToggleLike }: CommunityFeedProps) {
  const [openCommentsFor, setOpenCommentsFor] = useState<Record<string, boolean>>({})
  const [items, setItems] = useState<Post[]>(posts)
  const [confirmId, setConfirmId] = useState<string | null>(null)

  useEffect(() => {
    setItems(posts)
  }, [posts])
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
      {items.map((post) => (
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
              <div className="flex items-center gap-1">
                {currentUserId === post.user.id ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="hover:bg-white/10">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-background/90 border-white/10">
                      <AlertDialog open={confirmId === post.id} onOpenChange={(open) => setConfirmId(open ? post.id : null)}>
                        <AlertDialogTrigger asChild>
                          <DropdownMenuItem className="text-red-400 focus:text-red-400">
                            <Trash2 className="h-4 w-4 mr-2" /> Delete Post
                          </DropdownMenuItem>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-background/95 border-white/10">
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Post?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. Your post will be permanently removed.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-red-600 hover:bg-red-700"
                              onClick={async () => {
                                try {
                                  const res = await fetch(`/api/community/posts/${post.id}`, { method: 'DELETE' })
                                  if (!res.ok) throw new Error('Failed to delete')
                                  setItems(prev => prev.filter(p => p.id !== post.id))
                                  toast.success('Post deleted successfully')
                                } catch (e) {
                                  toast.error('Failed to delete post')
                                } finally {
                                  setConfirmId(null)
                                }
                              }}
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* Post Content */}
            <div className="prose prose-invert max-w-none">
              <p className="whitespace-pre-wrap">{post.content}</p>
            </div>

            {/* Post Images */}
            {Array.isArray(post.images) && post.images.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {post.images.slice(0, 4).map((img, idx) => (
                  <div key={idx} className="relative rounded-lg overflow-hidden">
                    {/* Support data URLs and remote URLs */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={typeof img === 'string' ? img : ''} alt="Post image" className="w-full h-auto object-cover rounded-lg border border-white/10" />
                  </div>
                ))}
              </div>
            )}

            {/* Hashtags */}
            {Array.isArray(post.hashtags) && post.hashtags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {post.hashtags.map((tag) => (
                  <Badge 
                    key={tag} 
                    variant="secondary" 
                    className="bg-blue-500/20 text-blue-300 border-blue-500/30 hover:bg-blue-500/30 transition-colors cursor-pointer"
                    onClick={() => onTagClick?.(tag.replace(/^#/, ''))}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-white/10">
              <div className="flex items-center space-x-6">
                <Button variant="ghost" size="sm" className="hover:text-red-400" onClick={() => onToggleLike?.(post.id)}>
                  <Heart className="h-4 w-4 mr-1" />
                  {post._count.likes}
                </Button>
                <Button variant="ghost" size="sm" className="hover:text-blue-400" onClick={() => setOpenCommentsFor(prev => ({...prev, [post.id]: !prev[post.id]}))}>
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
          {openCommentsFor[post.id] && (
            <CardContent className="pt-0">
              <div className="mt-3 space-y-3">
                <div className="text-sm text-muted-foreground">Comments loading...</div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Write a comment..."
                    className="flex-1 bg-background/50 border border-white/10 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500/50"
                  />
                  <Button size="sm" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">Comment</Button>
                </div>
              </div>
            </CardContent>
          )}
        </Card>
      ))}
    </div>
  )
}
