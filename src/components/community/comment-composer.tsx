'use client'

import { useState, useRef, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { UserAvatarTooltip } from '@/components/ui/user-avatar-tooltip'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'

const commentSchema = z.object({
  content: z.string().min(1, 'Comment cannot be empty').max(500, 'Comment too long (max 500 characters)')
})

type CommentFormData = z.infer<typeof commentSchema>

interface CommentComposerProps {
  postId: string
  parentId?: string | null
  onSuccess?: () => void
  placeholder?: string
  replyToName?: string
  autoFocus?: boolean
}

export function CommentComposer({ 
  postId, 
  parentId = null, 
  onSuccess, 
  placeholder = "What's on your mind?",
  replyToName,
  autoFocus = false
}: CommentComposerProps) {
  const { data: session } = useSession()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch
  } = useForm<CommentFormData>({
    resolver: zodResolver(commentSchema),
    defaultValues: { content: '' }
  })

  const content = watch('content')
  const characterCount = content?.length || 0

  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [autoFocus])

  const onSubmit = async (data: CommentFormData) => {
    if (!session?.user?.id) {
      toast.error('Please sign in to comment')
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: data.content.trim(),
          parentId: parentId
        }),
      })

      if (response.ok) {
        toast.success(parentId ? 'Reply posted!' : 'Comment posted!')
        reset()
        onSuccess?.()
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || 'Failed to post comment')
      }
    } catch (error) {
      console.error('Error posting comment:', error)
      toast.error('Failed to post comment')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault()
      if (!isSubmitting && content?.trim()) {
        handleSubmit(onSubmit)()
      }
    }
  }

  if (!session?.user?.id) {
    return (
      <div className="p-4 text-center">
        <p className="text-muted-foreground">Please sign in to comment</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {replyToName && (
        <div className="text-sm text-muted-foreground px-4">
          Replying to <span className="text-blue-500">@{replyToName}</span>
        </div>
      )}
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        <div className="flex space-x-3 px-4">
          <div className="flex-shrink-0">
            <UserAvatarTooltip
              userId={session.user.id}
              userName={session.user.name || 'User'}
              userImage={session.user.image || null}
              size="sm"
            />
          </div>
          
          <div className="flex-1 space-y-3">
            <Textarea
              {...register('content')}
              ref={textareaRef}
              placeholder={placeholder}
              className="bg-transparent border-0 text-foreground placeholder-muted-foreground resize-none min-h-[60px] focus:ring-0 focus:border-0 text-[15px] leading-relaxed p-0"
              rows={2}
              maxLength={500}
              onKeyDown={handleKeyDown}
              disabled={isSubmitting}
            />
            
            {errors.content && (
              <p className="text-sm text-red-500">{errors.content.message}</p>
            )}
            
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center space-x-4">
                <div className="text-sm text-muted-foreground">
                  {characterCount}/500
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => reset()}
                  disabled={isSubmitting}
                  className="text-muted-foreground hover:text-foreground"
                >
                  Cancel
                </Button>
                
                <Button
                  type="submit"
                  size="sm"
                  disabled={isSubmitting || !content?.trim()}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 rounded-full font-semibold"
                >
                  {isSubmitting ? 'Posting...' : (parentId ? 'Reply' : 'Reply')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
