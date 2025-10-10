'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { ImageIcon, Send, X, Smile, Clock, AlertCircle } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { PollModal } from './poll-modal'
import { PollSummary } from './poll-summary'
import { usePostLimit } from '@/hooks/usePostLimit'
import { Progress } from '@/components/ui/progress'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

interface CreatePostBoxProps {
  userId?: string
}

interface ImagePreview {
  id: string
  url: string
  file: File
}

interface DraftPoll {
  options: string[]
  duration: { days: number; hours: number; minutes: number }
}

export function CreatePostBox({ userId }: CreatePostBoxProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const [content, setContent] = useState('')
  const [images, setImages] = useState<ImagePreview[]>([])
  const [refreshTick, setRefreshTick] = useState<number>(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [showPollModal, setShowPollModal] = useState(false)
  const [draftPoll, setDraftPoll] = useState<DraftPoll | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const emojiPickerRef = useRef<HTMLDivElement>(null)
  
  // Post limit hook
  const { canPost, remaining, used, limit, getStatusMessage, getProgressPercentage, isLoading: limitLoading } = usePostLimit()

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

    // Check daily post limit
    if (!canPost) {
      toast.error(`Daily post limit reached (${limit} posts per day). Try again tomorrow!`)
      return
    }

    // If there's a draft poll, create post with poll
    if (draftPoll) {
      await handlePostWithPoll(draftPoll)
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
      setDraftPoll(null)
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

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false)
      }
    }

    if (showEmojiPicker) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showEmojiPicker])

  // Emoji picker functionality
  const handleEmojiClick = () => {
    setShowEmojiPicker(!showEmojiPicker)
  }

  const insertEmoji = (emoji: string) => {
    const textarea = textareaRef.current
    if (textarea) {
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const newContent = content.substring(0, start) + emoji + content.substring(end)
      setContent(newContent)
      
      // Set cursor position after the inserted emoji
      setTimeout(() => {
        textarea.focus()
        textarea.setSelectionRange(start + emoji.length, start + emoji.length)
      }, 0)
    }
    setShowEmojiPicker(false)
  }

  // Poll functionality
  const handlePollClick = () => {
    setShowPollModal(true)
  }

  const handlePostWithPoll = async (draftPoll: DraftPoll) => {
    setIsSubmitting(true)

    try {
      // Convert images to data URLs
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

      // Calculate expiration date using seconds: now + (days*86400 + hours*3600 + minutes*60)
      const now = new Date()
      const totalSeconds = draftPoll.duration.days * 86400 + 
                          draftPoll.duration.hours * 3600 + 
                          draftPoll.duration.minutes * 60
      
      // Check if all duration values are 0
      if (totalSeconds === 0) {
        toast.error('Please set a duration for the poll')
        return
      }
      
      const expirationDate = new Date(now.getTime() + totalSeconds * 1000)

      // Create payload as specified
      const payload = {
        content: content.trim(),
        images: imageUrls.length > 0 ? imageUrls : undefined,
        hashtags: extractHashtags(content),
        poll: {
          questionFromPost: true,
          options: draftPoll.options,
          expiresAt: expirationDate.toISOString()
        }
      }

      // Send to /api/community/posts
      const response = await fetch('/api/community/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create post with poll')
      }

      const post = await response.json()
      
      // Clear draftPoll after successful submission
      setDraftPoll(null)
      setContent('')
      setImages([])
      setRefreshTick((t) => t + 1)
      
      // Show toast confirmation
      toast.success('Post with poll created successfully!')
      
      // Refresh and dispatch events
      try { router.refresh() } catch {}
      try { window.dispatchEvent(new CustomEvent('community:post-created', { detail: post })) } catch {}
    } catch (error) {
      console.error('Error creating post with poll:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to create post with poll. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDraftPollSave = (draftPoll: DraftPoll) => {
    setDraftPoll(draftPoll)
    toast.success('Poll draft saved!')
  }

  const handlePollEdit = () => {
    setShowPollModal(true)
  }

  const handlePollRemove = () => {
    setDraftPoll(null)
    toast.success('Poll removed from your post')
  }

  // Common emojis for the picker
  const commonEmojis = [
    '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃',
    '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😙',
    '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔',
    '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥',
    '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢', '🤮', '🤧',
    '🥵', '🥶', '🥴', '😵', '🤯', '🤠', '🥳', '😎', '🤓', '🧐',
    '👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉',
    '👆', '👇', '☝️', '✋', '🤚', '🖐', '🖖', '👋', '🤝', '👏',
    '🙌', '👐', '🤲', '🤜', '🤛', '✊', '👊', '👎', '❤️', '🧡',
    '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕',
    '💞', '💓', '💗', '💖', '💘', '💝', '💟', '☮️', '✝️', '☪️',
    '🕉', '☸️', '✡️', '🔯', '🕎', '☯️', '☦️', '🛐', '⛎', '♈',
    '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒',
    '♓', '🆔', '⚛️', '🉑', '☢️', '☣️', '📴', '📳', '🈶', '🈚',
    '🈸', '🈺', '🈷️', '✴️', '🆚', '💮', '🉐', '㊙️', '㊗️', '🈴',
    '🈵', '🈹', '🈲', '🅰️', '🅱️', '🆎', '🆑', '🅾️', '🆘', '❌',
    '⭕', '🛑', '⛔', '📛', '🚫', '💯', '💢', '♨️', '🚷', '🚯',
    '🚳', '🚱', '🔞', '📵', '🚭', '❗', '❕', '❓', '❔', '‼️',
    '⁉️', '🔅', '🔆', '〽️', '⚠️', '🚸', '🔱', '⚜️', '🔰', '♻️',
    '✅', '🈯', '💹', '❇️', '✳️', '❎', '🌐', '💠', 'Ⓜ️', '🌀',
    '💤', '🏧', '🚾', '♿', '🅿️', '🈳', '🈂️', '🛂', '🛃', '🛄',
    '🛅', '🚹', '🚺', '🚼', '🚻', '🚮', '🎦', '📶', '🈁', '🔣',
    '🔤', '🔡', '🔠', '🆖', '🆗', '🆙', '🆒', '🆕', '🆓', '0️⃣',
    '1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'
  ]

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
                ref={textareaRef}
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

              {/* Poll Summary */}
              {draftPoll && (
                <PollSummary 
                  draftPoll={draftPoll} 
                  onEdit={handlePollEdit} 
                  onRemove={handlePollRemove} 
                />
              )}

              {/* Twitter-style toolbar */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
                <div className="flex items-center gap-4 text-sky-400">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className={`p-2 rounded-full hover:bg-sky-500/10 hover:text-purple-400 transition ${images.length >= 4 ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={images.length >= 4}
                    aria-label="Add images"
                  >
                    <ImageIcon className="h-5 w-5" />
                  </button>
                  <button 
                    type="button" 
                    onClick={handlePollClick}
                    className="p-2 rounded-full hover:bg-sky-500/10 hover:text-purple-400 transition" 
                    aria-label="Poll"
                  >
                    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current"><rect x="3" y="4" width="4" height="16" rx="1"></rect><rect x="10" y="9" width="4" height="11" rx="1"></rect><rect x="17" y="13" width="4" height="7" rx="1"></rect></svg>
                  </button>
                  <div className="relative" ref={emojiPickerRef}>
                    <button 
                      type="button" 
                      onClick={handleEmojiClick}
                      className="p-2 rounded-full hover:bg-sky-500/10 hover:text-purple-400 transition" 
                      aria-label="Emoji"
                    >
                      <Smile className="h-5 w-5" />
                    </button>
                    
                    {/* Emoji Picker */}
                    {showEmojiPicker && (
                      <div className="absolute bottom-full left-0 mb-2 bg-gray-800 border border-gray-700 rounded-lg shadow-lg p-4 z-50 w-80 sm:w-96 max-w-[calc(100vw-2rem)]">
                        <div className="grid grid-cols-8 gap-1 max-h-48 overflow-y-auto">
                          {commonEmojis.map((emoji, index) => (
                            <button
                              key={index}
                              type="button"
                              onClick={() => insertEmoji(emoji)}
                              className="p-2 hover:bg-gray-700 rounded transition text-lg"
                              aria-label={`Insert ${emoji} emoji`}
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
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
                  {/* Post Limit Indicator */}
                  {!limitLoading && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            {canPost ? (
                              <div className="flex items-center gap-1">
                                <span>{remaining}/{limit}</span>
                                <Progress 
                                  value={getProgressPercentage()} 
                                  className="w-12 h-1"
                                />
                              </div>
                            ) : (
                              <div className="flex items-center gap-1 text-red-400">
                                <AlertCircle className="h-3 w-3" />
                                <span>Limit reached</span>
                              </div>
                            )}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{getStatusMessage()}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                  
                  <span className="text-sm text-muted-foreground">
                    {content.length}/2000
                  </span>
                  
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          type="submit"
                          disabled={!content.trim() || isSubmitting || !canPost}
                          className="rounded-full bg-slate-600 hover:bg-slate-500 text-white px-5 disabled:opacity-50"
                        >
                          {isSubmitting ? 'Posting...' : canPost ? 'Post' : 'Limit Reached'}
                        </Button>
                      </TooltipTrigger>
                      {!canPost && (
                        <TooltipContent>
                          <p>Daily post limit reached. Try again tomorrow!</p>
                        </TooltipContent>
                      )}
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>

              {/* Bottom controls replaced by toolbar above */}
            </div>
          </div>
        </form>
      </CardContent>
      
      {/* Poll Modal */}
      <PollModal 
        isOpen={showPollModal} 
        onClose={() => setShowPollModal(false)} 
        onSave={handleDraftPollSave}
        initialData={draftPoll || undefined}
      />
    </Card>
  )
}
