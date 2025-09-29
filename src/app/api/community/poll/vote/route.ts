import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { rateLimit } from '@/lib/rate-limit'
import { awardXP } from '@/lib/xpService'
import { checkAndAwardBadges } from '@/lib/badgeService'
import { z } from 'zod'

const voteSchema = z.object({
  optionId: z.string().min(1, 'Option ID is required')
})

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'ip:unknown'
    const rl = await rateLimit(`poll:vote:${ip}`, 10, 60) // 10 votes per minute
    if (!rl.allowed) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
    }

    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const body = await request.json()
    const { optionId } = voteSchema.parse(body)
    const userId = session.user.id

    // Get the poll option and verify it exists
    const option = await prisma.pollOption.findUnique({
      where: { id: optionId },
      include: {
        poll: {
          include: {
            post: {
              select: { id: true }
            }
          }
        }
      }
    })

    if (!option) {
      return NextResponse.json({ error: 'Poll option not found' }, { status: 404 })
    }

    if (!option.poll) {
      return NextResponse.json({ error: 'Poll not found for this option' }, { status: 404 })
    }

    // Check if poll has expired
    if (option.poll.expiresAt < new Date()) {
      return NextResponse.json({ error: 'This poll has expired' }, { status: 400 })
    }

    // Check if user already voted on this specific option
    const existingVote = await prisma.pollVote.findFirst({
      where: {
        userId,
        optionId
      }
    })

    if (existingVote) {
      return NextResponse.json({ error: 'You have already voted on this option' }, { status: 400 })
    }

    // Also check if user voted on any option in this poll
    const existingPollVote = await prisma.pollVote.findFirst({
      where: {
        userId,
        option: {
          pollId: option.poll.id
        }
      }
    })

    if (existingPollVote) {
      return NextResponse.json({ error: 'You have already voted on this poll' }, { status: 400 })
    }

    // Create the vote
    console.log('[POLL][VOTE] Creating vote with data:', {
      userId,
      optionId,
      pollId: option.poll.id
    })
    
    const voteData: any = {
      userId,
      optionId
    }
    
    // Only include pollId if it exists
    if (option.poll.id) {
      voteData.pollId = option.poll.id
    }
    
    try {
      await prisma.pollVote.create({
        data: voteData
      })
      console.log('[POLL][VOTE] Vote created successfully')

      // Award XP for poll voting with first-time bonus
      try {
        const xpResult = await awardXP(userId, 'vote', 3)
        console.log(`[XP] Awarded ${xpResult.isFirstTime ? '8' : '3'} XP to user ${userId} for poll voting${xpResult.isFirstTime ? ' (first-time bonus!)' : ''}`)
        
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
      } catch (xpError) {
        console.error('[XP] Error awarding XP for poll voting:', xpError)
        // Don't fail the request if XP awarding fails
      }
    } catch (voteError) {
      console.error('[POLL][VOTE] Error creating vote:', voteError)
      throw voteError
    }

    // Get updated poll results
    const pollWithResults = await prisma.poll.findUnique({
      where: { id: option.poll.id },
      include: {
        options: {
          include: {
            votes: true,
            _count: {
              select: { votes: true }
            }
          }
        }
      }
    })

    if (!pollWithResults) {
      return NextResponse.json({ error: 'Poll not found' }, { status: 404 })
    }

    const totalVotes = pollWithResults.options.reduce((sum, opt) => sum + opt._count.votes, 0)

    return NextResponse.json({
      message: 'Vote recorded successfully',
      results: pollWithResults.options.map(opt => ({
        id: opt.id,
        text: opt.text,
        votesCount: opt._count.votes,
        percentage: totalVotes > 0 ? Math.round((opt._count.votes / totalVotes) * 100) : 0
      })),
      totalVotes
    })

  } catch (error) {
    console.error('Error voting on poll:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    // Log detailed error information
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      })
    }

    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const postId = searchParams.get('postId')

    if (!postId) {
      return NextResponse.json({ error: 'Post ID is required' }, { status: 400 })
    }

    const session = await getServerSession(authOptions)
    const userId = session?.user?.id

    // Get post with poll data
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        poll: {
          include: {
            options: {
              include: {
                votes: userId ? {
                  where: { userId }
                } : false,
                _count: {
                  select: { votes: true }
                }
              }
            }
          }
        }
      }
    })

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    if (!post.poll) {
      return NextResponse.json({ error: 'This post does not have a poll' }, { status: 400 })
    }

    const poll = post.poll
    const totalVotes = poll.options.reduce((sum, opt) => sum + opt._count.votes, 0)
    const userVote = userId ? poll.options.find(opt => opt.votes.length > 0) : null

    return NextResponse.json({
      poll: {
        id: poll.id,
        question: poll.question,
        expiresAt: poll.expiresAt,
        isExpired: poll.expiresAt < new Date()
      },
      options: poll.options.map(opt => ({
        id: opt.id,
        text: opt.text,
        votesCount: opt._count.votes,
        percentage: totalVotes > 0 ? Math.round((opt._count.votes / totalVotes) * 100) : 0
      })),
      userVote: userVote ? userVote.id : null,
      hasVoted: !!userVote,
      totalVotes
    })

  } catch (error) {
    console.error('Error fetching poll:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}