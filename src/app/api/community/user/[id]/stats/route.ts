import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: userId } = await params

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Get user's posts with counts
    const userPosts = await prisma.post.findMany({
      where: { userId },
      include: {
        _count: {
          select: {
            likes: true,
            comments: true,
          }
        }
      }
    })

    // Calculate stats
    const totalPosts = userPosts.length
    const totalLikes = userPosts.reduce((sum, post) => sum + post._count.likes, 0)
    const totalComments = userPosts.reduce((sum, post) => sum + post._count.comments, 0)
    
    // For now, we'll use a placeholder for views since we don't track them yet
    // In a real implementation, you'd track views in a separate table
    const totalViews = totalPosts * 10 // Placeholder: assume 10 views per post on average
    
    // Calculate engagement rate
    const engagementRate = totalViews > 0 ? (totalLikes + totalComments) / totalViews : 0

    return NextResponse.json({
      totalPosts,
      totalLikes,
      totalComments,
      totalViews,
      engagementRate: Math.round(engagementRate * 100) / 100 // Round to 2 decimal places
    })
  } catch (error) {
    console.error('Error fetching user stats:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
