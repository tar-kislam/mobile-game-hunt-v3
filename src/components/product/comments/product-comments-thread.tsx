'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ProductCommentComposer } from './product-comment-composer'
import { ProductCommentItem } from './product-comment-item'
import {
  insertTopLevelComment,
  insertReply,
  updateCommentNode,
  markCommentDeleted,
  type ProductCommentNode
} from '@/lib/comments/product-comment-utils'

interface ProductCommentsThreadProps {
  productId: string
  productSlug?: string | null
  initialCount: number
  onCountChange?: (count: number) => void
}

interface CommentsResponse {
  comments: ProductCommentNode[]
  nextCursor: string | null
  totalCount: number
}

export function ProductCommentsThread({
  productId,
  productSlug,
  initialCount,
  onCountChange
}: ProductCommentsThreadProps) {
  const [comments, setComments] = useState<ProductCommentNode[]>([])
  const [loading, setLoading] = useState(true)
  const [cursor, setCursor] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(false)
  const [commentCount, setCommentCount] = useState(initialCount)
  const [error, setError] = useState<string | null>(null)
  const composerContainerRef = useRef<HTMLDivElement>(null)
  const hasLoadedSuccessfullyRef = useRef(false)

  const applyCount = useCallback(
    (value: number | ((prev: number) => number)) => {
      setCommentCount((prev) => {
        const next = typeof value === 'function' ? (value as (prev: number) => number)(prev) : value
        return next
      })
    },
    []
  )

  useEffect(() => {
    onCountChange?.(commentCount)
  }, [commentCount, onCountChange])

  const fetchComments = useCallback(
    async (append = false, existingCursor?: string | null) => {
      if (!productId) {
        setError('Missing product id')
        return
      }

      try {
        setLoading(true)
        setError(null)
        const params = new URLSearchParams()
        params.set('limit', '10')
        if (existingCursor) {
          params.set('cursor', existingCursor)
        }

        const response = await fetch(`/api/products/${productId}/comments?${params.toString()}`)
        if (!response.ok) {
          throw new Error('Failed to fetch comments')
        }

        const data: CommentsResponse = await response.json()
        setComments((prev) => (append ? [...prev, ...data.comments] : data.comments))
        setCursor(data.nextCursor)
        setHasMore(Boolean(data.nextCursor))
        applyCount(data.totalCount)
        hasLoadedSuccessfullyRef.current = true
      } catch (err) {
        console.error('[PRODUCT COMMENTS][FETCH] error', err)
        const suppressError = !hasLoadedSuccessfullyRef.current && initialCount === 0
        if (suppressError) {
          setError(null)
        } else {
          setError('Failed to load comments')
          toast.error('Failed to load comments')
        }
      } finally {
        setLoading(false)
      }
    },
    [productId, applyCount, initialCount]
  )

  useEffect(() => {
    fetchComments(false)
  }, [fetchComments])

  const handleTopLevelSuccess = (comment: ProductCommentNode) => {
    setComments((prev) => insertTopLevelComment(prev, comment))
    applyCount((prev) => prev + 1)
  }

  const handleReplyAdded = (parentId: string, reply: ProductCommentNode) => {
    setComments((prev) => insertReply(prev, parentId, reply))
  }

  const handleCommentUpdated = (updated: ProductCommentNode) => {
    setComments((prev) => updateCommentNode(prev, updated))
  }

  const handleCommentDeleted = (commentId: string) => {
    setComments((prev) => markCommentDeleted(prev, commentId))
    applyCount((prev) => Math.max(0, prev - 1))
  }

  const scrollToComposer = () => {
    if (!composerContainerRef.current) return
    composerContainerRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
    const textarea = composerContainerRef.current.querySelector('textarea')
    if (textarea instanceof HTMLTextAreaElement) {
      textarea.focus()
    }
  }

  const renderSkeleton = () => (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="rounded-2xl border border-white/5 bg-white/5 p-4">
          <div className="flex space-x-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-3">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-20 w-full" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )

  return (
    <div className="space-y-6">
      <div ref={composerContainerRef}>
        <ProductCommentComposer productId={productId} onSuccess={handleTopLevelSuccess} />
      </div>

      {loading && comments.length === 0 && renderSkeleton()}

      {error && comments.length === 0 && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-center text-sm text-red-300">
          {error}
        </div>
      )}

      {!loading && comments.length === 0 && !error && (
        <div className="rounded-2xl border border-cyan-500/20 bg-gradient-to-br from-[#040b16]/90 via-[#050d1c]/85 to-[#040b16]/90 p-8 text-center text-sm text-cyan-100 shadow-[0_0_30px_rgba(59,130,246,0.15)] space-y-3">
          <p className="text-lg font-semibold text-white">Share your first thought</p>
          <p className="text-cyan-200">
            Kick off the discussion by sharing what stands out about this product.
          </p>
          <Button
            onClick={scrollToComposer}
            className="mt-2 rounded-full px-6 py-3 bg-[#ff7720] text-[#050608] font-semibold border border-[#ffaf66]/80 shadow-[0_0_18px_rgba(255,119,32,0.4)] transition-all duration-300 hover:bg-[#ff8c3a] hover:border-[#ffd2a6] hover:shadow-[0_0_28px_rgba(20,220,255,0.35)] focus-visible:ring-2 focus-visible:ring-[#19dfff] focus-visible:ring-offset-0"
          >
            Start the conversation
          </Button>
        </div>
      )}

      {comments.length > 0 && (
        <div className="space-y-6">
          {comments.map((comment) => (
            <ProductCommentItem
              key={comment.id}
              comment={comment}
              productId={productId}
              productSlug={productSlug}
              onReplyAdded={handleReplyAdded}
              onCommentUpdated={handleCommentUpdated}
              onCommentDeleted={handleCommentDeleted}
            />
          ))}
        </div>
      )}

      {hasMore && (
        <div className="text-center">
          <Button
            variant="outline"
            onClick={() => fetchComments(true, cursor)}
            disabled={loading}
            className="text-sm"
          >
            {loading ? 'Loading...' : 'Load more comments'}
          </Button>
        </div>
      )}
    </div>
  )
}

