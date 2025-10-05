import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { validateUsername } from '@/lib/validations/username'

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { username } = await request.json()

    if (!username) {
      return NextResponse.json({ error: 'Username is required' }, { status: 400 })
    }

    // Validate username format
    const validation = validateUsername(username)
    if (!validation.isValid) {
      return NextResponse.json({ 
        error: validation.error 
      }, { status: 400 })
    }

    // Check if username is already taken by someone else
    const existingUser = await prisma.user.findUnique({
      where: { username },
      select: { id: true }
    })

    if (existingUser && existingUser.id !== session.user.id) {
      return NextResponse.json({
        error: 'Username is already taken'
      }, { status: 400 })
    }

    // Update the user's username
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: { username },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        image: true
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Username updated successfully',
      user: updatedUser
    })

  } catch (error) {
    console.error('Error updating username:', error)
    
    // Handle unique constraint violation
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json({
        error: 'Username is already taken'
      }, { status: 400 })
    }
    
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

