import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { notify } from '@/lib/notificationService'
import { awardXP } from '@/lib/xpService'

const signupSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be no more than 20 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    const validatedData = signupSchema.parse(body)
    const { name, username, email, password } = validatedData

    // Check if user already exists by email or username
    const [existingUserByEmail, existingUserByUsername] = await Promise.all([
      prisma.user.findUnique({ where: { email } }),
      prisma.user.findFirst({ where: { username } })
    ])

    if (existingUserByEmail) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      )
    }

    if (existingUserByUsername) {
      return NextResponse.json(
        { error: 'Username is already taken' },
        { status: 409 }
      )
    }

    // Hash password with salt of 10
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        username,
        email,
        passwordHash: hashedPassword,
        role: 'USER',
      },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        role: true,
        createdAt: true,
      }
    })

    // Send welcome notification
    try {
      await notify(user.id, `Welcome to Mobile Game Hunt, ${user.name || "Hunter"}! Your journey starts now 🚀`, "welcome")
    } catch (notificationError) {
      console.error('[SIGNUP] Error sending welcome notification:', notificationError)
      // Don't fail signup if notification fails
    }

    // Award initial XP for joining the platform
    try {
      await awardXP(user.id, 'signup', 10) // 10 XP for signing up
      console.log('[SIGNUP] Awarded initial XP to new user')
    } catch (xpError) {
      console.error('[SIGNUP] Error awarding initial XP:', xpError)
      // Don't fail signup if XP fails
    }

    return NextResponse.json({
      message: 'User created successfully',
      user
    }, { status: 201 })

  } catch (error) {
    console.error('Signup error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
