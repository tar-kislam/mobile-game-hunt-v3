import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { rateLimit } from '@/lib/rate-limit'
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
    const userId = session.user.id

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

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

    if (existingVote && (upvoted === undefined || upvoted === false)) {
      // Remove vote (toggle)
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
    } else if (!existingVote && (upvoted === undefined || upvoted === true)) {
      // Add vote
      await prisma.vote.create({
        data: {
          userId,
          productId,
        },
      })

      return NextResponse.json({ 
        message: 'Vote added',
        voted: true 
      })
    }
    return NextResponse.json({ message: 'No change' })
  } catch (error) {
    console.error('Error handling vote:', error)
    
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
