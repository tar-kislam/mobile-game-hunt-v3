'use client'

import { CommentItem } from './comment-item'
import type { CommunityCommentNode } from './types'

interface CommentTreeProps {
  comments: CommunityCommentNode[]
  postId: string
  onReplyRequest?: (comment: CommunityCommentNode) => void
  variant?: 'inline' | 'detail'
  depth?: number
}

export function CommentTree({
  comments,
  postId,
  onReplyRequest,
  variant = 'detail',
  depth = 0
}: CommentTreeProps) {
  if (!comments || comments.length === 0) {
    return null
  }

  const connectorClass =
    depth > 0
      ? variant === 'inline'
        ? 'relative ml-3 pl-3 border-l border-cyan-500/25 md:ml-6 md:pl-4'
        : 'relative ml-3 pl-3 border-l border-border/40 md:ml-6 md:pl-4'
      : ''

  return (
    <div className="space-y-4">
      {comments.map((comment) => (
        <div key={comment.id} className={`space-y-3 ${connectorClass}`}>
          <CommentItem comment={comment} postId={postId} onReplyRequest={onReplyRequest} />

          {comment.replies && comment.replies.length > 0 && (
            <div className="space-y-3">
              <CommentTree
                comments={comment.replies}
                postId={postId}
                onReplyRequest={onReplyRequest}
                variant={variant}
                depth={depth + 1}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

