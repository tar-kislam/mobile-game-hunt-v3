import { NextRequest, NextResponse } from "next/server"
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// GET /api/studios - Get user's saved studios
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const studios = await prisma.studio.findMany({
      where: { userId: user.id },
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        createdAt: true
      }
    })

    return NextResponse.json(studios)
  } catch (error) {
    console.error('Error fetching studios:', error)
    return NextResponse.json(
      { error: 'Failed to fetch studios' },
      { status: 500 }
    )
  }
}

// POST /api/studios - Save a new studio
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { name } = await request.json()

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: 'Studio name is required' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Check if studio already exists for this user
    const existingStudio = await prisma.studio.findFirst({
      where: {
        name: name.trim(),
        userId: user.id
      }
    })

    if (existingStudio) {
      return NextResponse.json(
        { error: 'Studio already exists' },
        { status: 400 }
      )
    }

    const studio = await prisma.studio.create({
      data: {
        name: name.trim(),
        userId: user.id
      },
      select: {
        id: true,
        name: true,
        createdAt: true
      }
    })

    return NextResponse.json({
      success: true,
      studio
    })
  } catch (error) {
    console.error('Error saving studio:', error)
    return NextResponse.json(
      { error: 'Failed to save studio' },
      { status: 500 }
    )
  }
}
