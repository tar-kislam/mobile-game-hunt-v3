"use client"

import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from "react"
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
  onCancel?: () => void
}

export type CommentComposerHandle = {
  focus: () => void
  setContent: (value: string) => void
  getContent: () => string
}

export const CommentComposer = forwardRef<CommentComposerHandle, CommentComposerProps>(function CommentComposer(
  { 
    postId, 
    parentId = null, 
    onSuccess, 
    placeholder = "What's on your mind?",
    replyToName,
    autoFocus = false,
    onCancel
  },
  ref
) {
  const { data: session } = useSession()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
    getValues
  } = useForm<CommentFormData>({
    resolver: zodResolver(commentSchema),
    defaultValues: { content: '' }
  })

  const content = watch('content')
  const characterCount = content?.length || 0

  const focusTextarea = () => {
    if (textareaRef.current) {
      textareaRef.current.focus()
      textareaRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }

  useImperativeHandle(ref, () => ({
    focus: () => focusTextarea(),
    setContent: (value: string) => {
      setValue('content', value, { shouldDirty: true, shouldValidate: true })
    },
    getContent: () => getValues('content') || ''
  }))

  useEffect(() => {
    if (autoFocus) {
      focusTextarea()
    }
  }, [autoFocus])

  const onSubmit = async (data: CommentFormData) => {
    if (!session?.user?.id) {
      toast.error('Please sign in to comment')
      return
    }

    setIsSubmitting(true)
    try {
      const payload: Record<string, unknown> = {
        content: data.content.trim()
      }

      if (parentId) {
        payload.parentId = parentId
      }

      const response = await fetch(`/api/community/posts/${postId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
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

  const {
    ref: registerRef,
    ...contentField
  } = register('content')

  const handleCancel = () => {
    reset()
    onCancel?.()
  }

  return (
    <div className="space-y-3">
      {replyToName && (
        <div className="flex items-center justify-between text-sm text-muted-foreground px-4">
          <span>
            Replying to <span className="text-blue-500">@{replyToName}</span>
          </span>
          <button
            type="button"
            onClick={handleCancel}
            className="text-xs text-gray-400 hover:text-gray-200 transition-colors"
          >
            Cancel reply
          </button>
        </div>
      )}
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        <div className="flex flex-col gap-3 px-4 sm:flex-row sm:space-x-3 sm:gap-0">
          <div className="flex-shrink-0">
            <UserAvatarTooltip
              userId={session.user.id}
              userName={session.user.name || 'User'}
              userImage={session.user.image || null}
              size="sm"
            />
          </div>
          
          <div className="flex-1 space-y-3">
            <div className="rounded-2xl border border-cyan-500/20 bg-gradient-to-br from-[#050714]/90 via-[#0b1120]/80 to-[#050714]/90 px-4 py-3 shadow-[0_0_18px_rgba(14,165,233,0.12)] transition-all duration-300 focus-within:border-cyan-400/70 focus-within:shadow-[0_0_28px_rgba(14,165,233,0.35)]">
              <Textarea
                {...contentField}
                ref={(node) => {
                  registerRef(node)
                  textareaRef.current = node
                }}
                placeholder={placeholder}
                className="bg-transparent border-0 text-foreground placeholder-muted-foreground resize-none min-h-[60px] focus:ring-0 focus:border-0 text-[15px] leading-relaxed"
                rows={2}
                maxLength={500}
                onKeyDown={handleKeyDown}
                disabled={isSubmitting}
              />
            </div>
            
            {errors.content && (
              <p className="text-sm text-red-500">{errors.content.message}</p>
            )}
            
            <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                <div className="text-sm text-muted-foreground">
                  {characterCount}/500
                </div>
              </div>
              
              <div className="flex flex-wrap items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleCancel}
                  disabled={isSubmitting}
                  className="text-muted-foreground hover:text-foreground"
                >
                  Cancel
                </Button>
                
                <Button
                  type="submit"
                  size="sm"
                  disabled={isSubmitting || !content?.trim()}
                  className="bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white px-6 rounded-full font-semibold shadow-[0_0_20px_rgba(56,189,248,0.35)]"
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
})
