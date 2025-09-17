import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

const updatePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string()
    .min(8, 'New password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  confirmPassword: z.string().min(1, 'Please confirm your new password')
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
})

export async function PATCH(request: NextRequest) {
  try {
    // Authenticate the user
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const validatedData = updatePasswordSchema.parse(body)
    const { currentPassword, newPassword } = validatedData

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, passwordHash: true, email: true }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Check if user has a password (OAuth users might not have one)
    if (!user.passwordHash) {
      return NextResponse.json(
        { error: 'This account does not support password updates. Please use the original sign-in method.' },
        { status: 400 }
      )
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash)
    
    if (!isCurrentPasswordValid) {
      return NextResponse.json(
        { success: false, message: 'Incorrect current password' },
        { status: 400 }
      )
    }

    // Hash new password with salt of 10
    const hashedNewPassword = await bcrypt.hash(newPassword, 10)

    // Update password in database
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: hashedNewPassword }
    })

    return NextResponse.json(
      { success: true, message: 'Password updated successfully' },
      { status: 200 }
    )

  } catch (error) {
    console.error('Password update error:', error)
    
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