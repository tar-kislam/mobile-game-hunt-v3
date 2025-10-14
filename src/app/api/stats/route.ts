import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    // Fetch real counts from database in parallel
    const [games, members, reviews] = await Promise.all([
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
      ]).then(([productComments, postComments]) => productComments + postComments)
    ])

    return NextResponse.json({
      games,
      members,
      reviews
    })
  } catch (error) {
    console.error('Stats API error:', error)
    
    // Return fallback values on error
    return NextResponse.json({
      games: 100,
      members: 1000,
      reviews: 250
    })
  } finally {
    await prisma.$disconnect()
  }
}
