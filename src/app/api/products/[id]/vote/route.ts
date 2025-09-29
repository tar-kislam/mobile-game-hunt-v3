import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { rateLimit } from '@/lib/rate-limit'
import { notify, notifyVote } from '@/lib/notificationService'
import { awardXP } from '@/lib/xpService'
import { checkAndAwardBadges } from '@/lib/badgeService'
import { z } from 'zod'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const ip = request.headers.get('x-forwarded-for') || 'ip:unknown'
    const rl = await rateLimit(`vote:post:${ip}`, 20, 60)
    if (!rl.allowed) return NextResponse.json({ error: 'Rate limit' }, { status: 429 })
    // accept optional body for explicit upvoted toggle
    let upvoted: boolean | undefined
    try {
      const body = await request.json().catch(() => null)
      if (body) {
        const schema = z.object({ upvoted: z.boolean().optional() })
        const parsed = schema.safeParse(body)
        if (parsed.success) upvoted = parsed.data.upvoted
      }
    } catch {}
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const productId = id
    let userId = session.user.id

    // Check if user exists - try by ID first, then by email if needed
    let user = await prisma.user.findUnique({
      where: { id: userId },
    })

    // If user not found by ID, try by email (for OAuth users)
    if (!user && session.user.email) {
      user = await prisma.user.findUnique({
        where: { email: session.user.email },
      })
      
      if (user) {
        // Update the userId to the correct database ID
        userId = user.id
      }
    }

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    // Check if user already voted
    const existingVote = await prisma.vote.findUnique({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    })

    if (existingVote) {
      // User has already voted
      if (upvoted === false) {
        // Remove vote (explicit downvote)
        await prisma.vote.delete({
          where: {
            userId_productId: {
              userId,
              productId,
            },
          },
        })

        return NextResponse.json({ 
          message: 'Vote removed',
          voted: false 
        })
      } else {
        // User already voted, no change needed
        return NextResponse.json({ 
          message: 'Already voted',
          voted: true 
        })
      }
    } else {
      // User hasn't voted yet
      if (upvoted === undefined || upvoted === true) {
        // Add vote
        try {
          await prisma.vote.create({
            data: {
              userId,
              productId,
            },
          })

          // Award XP for voting
          try {
            const xpResult = await awardXP(userId, 'vote')
            console.log(`[XP] Awarded ${xpResult.xpAwarded} XP to user ${userId} for voting`)
            
            if (xpResult.levelUp) {
              console.log(`[XP] User ${userId} leveled up from ${xpResult.previousLevel} to ${xpResult.newLevel}!`)
            }
            
            // Check for new badges after XP award
            try {
              const newBadges = await checkAndAwardBadges(userId)
              if (newBadges.length > 0) {
                console.log(`[BADGES] User ${userId} earned new badges:`, newBadges)
              }
            } catch (badgeError) {
              console.error('[BADGES] Error checking badges:', badgeError)
              // Don't fail the request if badge checking fails
            }

            // Send milestone notification for first vote
            try {
              const existingVotes = await prisma.vote.count({
                where: { userId }
              })
              
              if (existingVotes === 1) {
                await notify(userId, "👍 You voted for a game! Keep supporting creators 🕹️", "milestone")
              }
            } catch (notificationError) {
              console.error('[NOTIFICATION] Error sending vote notification:', notificationError)
            }

            // Send vote notification to game owner (if not voting on own game)
            try {
              if (product.userId !== userId) {
                const voter = await prisma.user.findUnique({
                  where: { id: userId },
                  select: { username: true, name: true }
                })

                if (voter) {
                  const voterName = voter.name || voter.username || 'Someone'
                  await notifyVote(product.userId, userId, voterName, product.title, productId)
                  console.log(`[VOTE] Notification sent to game owner ${product.userId} about vote from ${voterName}`)
                }
              }
            } catch (voteNotificationError) {
              console.error('[VOTE NOTIFICATION] Error sending vote notification to game owner:', voteNotificationError)
            }
          } catch (xpError) {
            console.error('[XP] Error awarding XP for voting:', xpError)
            // Don't fail the request if XP awarding fails
          }

          return NextResponse.json({ 
            message: 'Vote added',
            voted: true 
          })
        } catch (createError) {
          // Handle unique constraint error (race condition)
          if (createError instanceof Error && createError.message.includes('Unique constraint')) {
            // Vote was created by another request, check current state
            const currentVote = await prisma.vote.findUnique({
              where: {
                userId_productId: {
                  userId,
                  productId,
                },
              },
            })
            
            if (currentVote) {
              return NextResponse.json({ 
                message: 'Vote added (race condition handled)',
                voted: true 
              })
            }
          }
          throw createError
        }
      } else {
        // User explicitly doesn't want to vote
        return NextResponse.json({ 
          message: 'No vote',
          voted: false 
        })
      }
    }
  } catch (error) {
    console.error('Error handling vote:', error)
    
    // Check if it's a unique constraint error
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json(
        { error: 'Vote already exists for this user and product' },
        { status: 409 }
      )
    }
    
    // Check if it's a foreign key constraint error
    if (error instanceof Error && error.message.includes('Foreign key constraint')) {
      return NextResponse.json(
        { error: 'Invalid user or product reference' },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
