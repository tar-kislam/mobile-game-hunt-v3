export function computeEngagementRate(params: {
  votes: number
  follows: number
  clicks: number
  comments: number
  wishlist: number
  shares: number
  views: number
}): number {
  const { votes, follows, clicks, comments, wishlist, shares, views } = params
  if (!views || views <= 0) return 0
  const totalEngagements = (votes || 0) + (follows || 0) + (clicks || 0) + (comments || 0) + (wishlist || 0) + (shares || 0)
  const rate = (totalEngagements / views) * 100
  return Math.round(rate * 10) / 10
}



