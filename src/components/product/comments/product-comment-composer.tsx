'use client'

import { useState, useRef, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { UserAvatarTooltip } from '@/components/ui/user-avatar-tooltip'
import type { ProductCommentNode } from '@/lib/comments/product-comment-utils'

interface ProductCommentComposerProps {
  productId: string
  parentId?: string | null
  onSuccess?: (comment: ProductCommentNode) => void
  placeholder?: string
  replyToName?: string
  autoFocus?: boolean
  initialValue?: string
  className?: string
}

export function ProductCommentComposer({
  productId,
  parentId = null,
  onSuccess,
  placeholder = "What's on your mind?",
  replyToName,
  autoFocus = false,
  initialValue = '',
  className
}: ProductCommentComposerProps) {
  const { data: session } = useSession()
  const [content, setContent] = useState(initialValue)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [autoFocus])

  const handleSubmit = async () => {
    if (!session?.user?.id) {
      toast.error('Please sign in to comment')
      return
    }

    if (!content.trim()) {
      toast.error('Comment cannot be empty')
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/products/${productId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: content.trim(),
          parentId: parentId ?? undefined
        })
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        throw new Error(error?.error || 'Failed to post comment')
      }

      const data: ProductCommentNode = await response.json()
      setContent('')
      onSuccess?.(data)
      toast.success(parentId ? 'Reply posted!' : 'Comment posted!')
    } catch (error) {
      console.error('[PRODUCT][COMMENT] submit error', error)
      toast.error(error instanceof Error ? error.message : 'Failed to post comment')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!session?.user?.id) {
    return (
      <div className="rounded-xl border border-dashed border-gray-600/40 p-4 text-center">
        <p className="text-muted-foreground text-sm mb-2">Join the conversation</p>
        <Button
          onClick={() => {
            window.location.href = `/auth/signin?callbackUrl=${encodeURIComponent(window.location.href)}`
          }}
          className="rounded-full px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
        >
          Sign in to comment
        </Button>
      </div>
    )
  }

  return (
    <div
      className={`space-y-3 rounded-2xl border border-cyan-500/30 bg-gradient-to-b from-[#051225]/70 to-[#010409]/90 p-4 shadow-[0_0_35px_rgba(14,165,233,0.25)] transition-shadow duration-300 hover:shadow-[0_0_45px_rgba(59,130,246,0.45)] relative overflow-hidden before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_top,_rgba(6,182,212,0.25),_transparent_55%)] before:opacity-60 before:pointer-events-none ${className ?? ''}`}
    >
      <div className="pointer-events-none absolute inset-0 opacity-40 blur-3xl bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent animate-[pulse_6s_ease-in-out_infinite]" />
      {replyToName && (
        <p className="text-sm text-muted-foreground">Replying to <span className="text-blue-400">@{replyToName}</span></p>
      )}
      <div className="flex space-x-3 relative z-10">
        <UserAvatarTooltip
          userId={session.user.id}
          userName={session.user.name || 'User'}
          userImage={session.user.image || null}
          size="sm"
        />
        <div className="flex-1 space-y-3">
          <Textarea
            ref={textareaRef}
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder={placeholder}
            className="min-h-[90px] text-sm bg-[#040b17]/80 border border-cyan-500/40 text-cyan-50 placeholder:text-cyan-400/40 rounded-2xl shadow-inner transition-all duration-300 focus-visible:ring-2 focus-visible:ring-cyan-400/70 focus-visible:border-cyan-200 focus-visible:bg-[#071426] disabled:opacity-70"
            maxLength={1000}
            disabled={isSubmitting}
          />
          <div className="flex items-center justify-between text-xs text-cyan-300/80">
            <span className="tracking-widest">{content.length}/1000</span>
            <div className="flex items-center space-x-2">
              {content && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setContent('')}
                  disabled={isSubmitting}
                  className="text-cyan-300 hover:text-cyan-100 hover:bg-cyan-500/10 transition-colors"
                >
                  Clear
                </Button>
              )}
              <Button
                size="sm"
                onClick={handleSubmit}
                disabled={isSubmitting || !content.trim()}
                className="rounded-full px-6 py-2 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 text-white shadow-[0_0_20px_rgba(59,130,246,0.45)] transition-all duration-300 hover:shadow-[0_0_30px_rgba(14,165,233,0.7)] hover:translate-y-[-1px] disabled:opacity-60 disabled:hover:translate-y-0"
              >
                {isSubmitting ? 'Posting...' : parentId ? 'Reply' : 'Post'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

