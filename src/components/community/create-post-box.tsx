'use client'

import { useState, useRef, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { ImageIcon, Send, X, Film, Smile, Calendar, MapPin } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface CreatePostBoxProps {
  userId?: string
}

interface ImagePreview {
  id: string
  url: string
  file: File
}

export function CreatePostBox({ userId }: CreatePostBoxProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const [content, setContent] = useState('')
  const [images, setImages] = useState<ImagePreview[]>([])
  const [refreshTick, setRefreshTick] = useState<number>(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!content.trim()) {
      toast.error('Please write something before posting')
      return
    }

    if (images.length > 4) {
      toast.error('Maximum 4 images allowed')
      return
    }

    setIsSubmitting(true)

    try {
      // Convert images to data URLs so they render consistently from DB
      const fileToDataUrl = (file: File) => new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = () => reject(new Error('Failed to read image'))
        reader.readAsDataURL(file)
      })

      const imageUrls: string[] = []
      for (const image of images) {
        const dataUrl = await fileToDataUrl(image.file)
        imageUrls.push(dataUrl)
      }

      const response = await fetch('/api/community/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: content.trim(),
          images: imageUrls.length > 0 ? imageUrls : undefined,
          hashtags: extractHashtags(content),
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create post')
      }

      const created = await response.json()
      toast.success('Post created successfully!')
      setContent('')
      setImages([])
      // Trigger a client refresh without full reload
      setRefreshTick((t) => t + 1)
      // Immediately refresh the feed so the new post appears on Latest
      try { router.refresh() } catch {}
      try { window.dispatchEvent(new CustomEvent('community:post-created', { detail: created })) } catch {}
    } catch (error) {
      console.error('Error creating post:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to create post. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const extractHashtags = (text: string): string[] => {
    const hashtagRegex = /#[\w]+/g
    const matches = text.match(hashtagRegex) || []
    return [...new Set(matches)] // Remove duplicates
  }

  const handleImageUpload = useCallback((files: FileList | null) => {
    if (!files) return

    const newImages: ImagePreview[] = []
    
    Array.from(files).forEach((file) => {
      if (file.type.startsWith('image/')) {
        if (images.length + newImages.length >= 4) {
          toast.error('Maximum 4 images allowed')
          return
        }
        
        const id = Math.random().toString(36).substr(2, 9)
        newImages.push({
          id,
          url: URL.createObjectURL(file),
          file
        })
      }
    })

    if (newImages.length > 0) {
      setImages(prev => [...prev, ...newImages])
      toast.success(`${newImages.length} image(s) added`)
    }
  }, [images.length])

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleImageUpload(e.target.files)
  }

  // Drag & drop removed in favor of Twitter-style toolbar upload

  const removeImage = (id: string) => {
    setImages(prev => {
      const image = prev.find(img => img.id === id)
      if (image) {
        URL.revokeObjectURL(image.url)
      }
      return prev.filter(img => img.id !== id)
    })
  }

  const hashtags = extractHashtags(content)

  return (
    <Card className="bg-card/50 border-white/10 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
          Share with the Community
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-start space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={session?.user?.image || ''} />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                {session?.user?.name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-3">
              <Textarea
                placeholder="What's on your mind? Use #hashtags to categorize your post..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[100px] resize-none bg-background/50 border-white/20 focus:border-blue-500/50"
                maxLength={2000}
              />
              
              {/* Hashtag Preview */}
              {hashtags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  <span className="text-sm text-muted-foreground">Detected hashtags:</span>
                  {hashtags.map((hashtag, index) => (
                    <Badge key={index} variant="secondary" className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                      {hashtag}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Image Previews */}
              {images.length > 0 && (
                <div className="grid grid-cols-2 gap-2">
                  {images.map((image) => (
                    <div key={image.id} className="relative group">
                      <img
                        src={image.url}
                        alt="Preview"
                        className="w-full h-24 object-cover rounded-lg border border-white/20"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeImage(image.id)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {/* Twitter-style toolbar */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-sky-400">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className={`p-2 rounded-full hover:bg-sky-500/10 transition ${images.length >= 4 ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={images.length >= 4}
                    aria-label="Add images"
                  >
                    <ImageIcon className="h-5 w-5" />
                  </button>
                  <button type="button" className="p-2 rounded-full hover:bg-sky-500/10 transition" aria-label="GIF" disabled>
                    <Film className="h-5 w-5" />
                  </button>
                  <button type="button" className="p-2 rounded-full hover:bg-sky-500/10 transition" aria-label="Poll" disabled>
                    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current"><rect x="3" y="4" width="4" height="16" rx="1"></rect><rect x="10" y="9" width="4" height="11" rx="1"></rect><rect x="17" y="13" width="4" height="7" rx="1"></rect></svg>
                  </button>
                  <button type="button" className="p-2 rounded-full hover:bg-sky-500/10 transition" aria-label="Emoji" disabled>
                    <Smile className="h-5 w-5" />
                  </button>
                  <button type="button" className="p-2 rounded-full hover:bg-sky-500/10 transition" aria-label="Schedule" disabled>
                    <Calendar className="h-5 w-5" />
                  </button>
                  <button type="button" className="p-2 rounded-full hover:bg-sky-500/10 transition" aria-label="Location" disabled>
                    <MapPin className="h-5 w-5" />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileInputChange}
                    className="hidden"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {content.length}/2000
                  </span>
                  <Button
                    type="submit"
                    disabled={!content.trim() || isSubmitting}
                    className="rounded-full bg-slate-600 hover:bg-slate-500 text-white px-5"
                  >
                    {isSubmitting ? 'Posting...' : 'Post'}
                  </Button>
                </div>
              </div>

              {/* Bottom controls replaced by toolbar above */}
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
