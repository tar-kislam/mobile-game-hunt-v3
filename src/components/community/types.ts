export interface CommunityCommentUser {
  id: string
  name: string
  username?: string | null
  image?: string | null
}

export interface CommunityCommentNode {
  id: string
  content: string
  createdAt: string
  updatedAt?: string
  isDeleted?: boolean
  parentId?: string | null
  user: CommunityCommentUser
  replies?: CommunityCommentNode[]
}

