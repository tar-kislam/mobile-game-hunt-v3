import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createCommentSchema } from '@/lib/validations/community'
import { addXPWithBonus } from '@/lib/xpService'
import { checkAndAwardBadges } from '@/lib/badgeService'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = createCommentSchema.parse(body)
    const { postId, content } = validatedData

    // Check if post exists
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        user: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    // Create the comment
    const comment = await prisma.postComment.create({
      data: {
        postId: postId,
        userId: session.user.id,
        content: content.trim(),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          }
        }
      }
    })

    // Create notification for post author (if not the same user)
    if (post.userId !== session.user.id) {
      await prisma.notification.create({
        data: {
          userId: post.userId,
          type: 'comment',
          postId: postId,
          message: `${session.user.name || 'Someone'} commented on your post`,
          isRead: false
        }
      })
    }

    // Award XP for commenting with first-time bonus
    try {
      const xpResult = await addXPWithBonus(session.user.id, 5, 10, 'comment')
      console.log(`[XP] Awarded ${xpResult.isFirstTime ? '15' : '5'} XP to user ${session.user.id} for commenting${xpResult.isFirstTime ? ' (first-time bonus!)' : ''}`)
      
      // Check for new badges after XP award
      try {
        const newBadges = await checkAndAwardBadges(session.user.id)
        if (newBadges.length > 0) {
          console.log(`[BADGES] User ${session.user.id} earned new badges:`, newBadges)
        }
      } catch (badgeError) {
        console.error('[BADGES] Error checking badges:', badgeError)
        // Don't fail the request if badge checking fails
      }
    } catch (xpError) {
      console.error('[XP] Error awarding XP for commenting:', xpError)
      // Don't fail the request if XP awarding fails
    }

    return NextResponse.json(comment, { status: 201 })
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Validation error', details: error.message }, { status: 400 })
    }
    console.error('Error creating comment:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
