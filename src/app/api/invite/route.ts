import { NextRequest, NextResponse } from "next/server"
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// POST /api/invite - Send invite to collaborator
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { email, productId, role = 'MAKER' } = await request.json()

    if (!email || !productId) {
      return NextResponse.json(
        { error: 'Email and productId are required' },
        { status: 400 }
      )
    }

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId }
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    // Check if invite already exists
    const existingInvite = await prisma.productMaker.findFirst({
      where: {
        productId,
        email: email.toLowerCase()
      }
    })

    if (existingInvite) {
      return NextResponse.json(
        { error: 'Invite already sent to this email' },
        { status: 400 }
      )
    }

    // Create invite record
    const invite = await prisma.productMaker.create({
      data: {
        productId,
        email: email.toLowerCase(),
        role: role as any,
        isCreator: false
      }
    })

    // TODO: Send actual email invite
    // For now, just return success
    console.log(`Invite sent to ${email} for product ${productId} with role ${role}`)

    return NextResponse.json({
      success: true,
      message: 'Invite sent successfully'
    })
  } catch (error) {
    console.error('Error sending invite:', error)
    return NextResponse.json(
      { error: 'Failed to send invite' },
      { status: 500 }
    )
  }
}
