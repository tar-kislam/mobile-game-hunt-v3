import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { validateUsername } from '@/lib/validations/username'

export async function POST(request: NextRequest) {
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
        error: validation.error,
        available: false 
      }, { status: 400 })
    }

    // Check if username is already taken
    const existingUser = await prisma.user.findUnique({
      where: { username },
      select: { id: true }
    })

    // If username is taken by someone else, it's not available
    if (existingUser && existingUser.id !== session.user.id) {
      return NextResponse.json({
        available: false,
        error: 'Username is already taken'
      })
    }

    // If it's the current user's username or available
    return NextResponse.json({
      available: true,
      message: 'Username is available'
    })

  } catch (error) {
    console.error('Error checking username:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

