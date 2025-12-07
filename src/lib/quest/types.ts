/**
 * Unified Quest Game Result Types
 * Represents both internal and external game results
 */

export type QuestGameSource = 'internal' | 'external'

export type QuestGameStore = 'apple_app_store' | 'google_play_store' | null

export interface QuestGameResult {
  id: string | null // internal DB id if exists, otherwise null
  slug?: string | null // internal slug if exists
  source: QuestGameSource // 'internal' or 'external'
  verified: boolean // internal -> true, external -> false
  store: QuestGameStore // which external store (if any)
  title: string
  shortPitch: string
  thumbnailUrl: string
  categories: string[]
  matchRank: number // 1,2,3... order after sorting
  score: number // numeric score used for ranking
  metrics?: {
    likes?: number
    visits?: number
  }
  links: {
    internalProductUrl?: string // /product/[slug]
    externalStoreUrl?: string // store link (App Store / Play)
  }
  reasons?: string[] // why this game was recommended (for internal games)
}

