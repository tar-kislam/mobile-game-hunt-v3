import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const posts = await prisma.post.findMany({
      where: { userId: session.user.id },
      include: {
        user: {
          select: { id: true, name: true, image: true }
        },
        _count: {
          select: { likes: true, comments: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    if (process.env.NODE_ENV !== 'production') {
      console.log(`[COMMUNITY][MY_POSTS] user=${session.user.id} count=${posts.length}`)
    }

    return NextResponse.json({ posts })
  } catch (error) {
    console.error('Error fetching my posts:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


