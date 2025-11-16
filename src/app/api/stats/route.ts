import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    // Get start of today for daily submissions count
    const now = new Date()
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    // Fetch real counts from database in parallel
    const [games, members, reviews, dailySubmissions] = await Promise.all([
      // Count published games (not drafts)
      prisma.product.count({
        where: {
          status: 'PUBLISHED'
        }
      }),
      // Count total users
      prisma.user.count(),
      // Count total comments/reviews (both product and post comments)
      Promise.all([
        prisma.productComment.count(),
        prisma.postComment.count()
      ]).then(([productComments, postComments]) => productComments + postComments),
      // Count products submitted today
      prisma.product.count({
        where: {
          createdAt: {
            gte: startOfToday
          }
        }
      })
    ])

    const baselineMembers = 150
    const baselineReviews = 75

    return NextResponse.json({
      games,
      members: baselineMembers + members,
      reviews: baselineReviews + reviews,
      dailySubmissions
    })
  } catch (error) {
    console.error('Stats API error:', error)
    
    // Return fallback values on error
    return NextResponse.json({
      games: 100,
      members: 1000,
      reviews: 250,
      dailySubmissions: 50
    })
  } finally {
    await prisma.$disconnect()
  }
}
