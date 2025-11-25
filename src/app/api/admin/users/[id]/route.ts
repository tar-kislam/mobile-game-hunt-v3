import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const id = params?.id
    if (!id) {
      return NextResponse.json({ error: 'Missing user id' }, { status: 400 })
    }

    await prisma.user.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }

      if (error.code === 'P2003') {
        return NextResponse.json(
          { error: 'Cannot delete user because of related data. Remove related records first.' },
          { status: 409 }
        )
      }
    }

    console.error('[ADMIN][USER][DELETE] Failed to delete user', error)
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 })
  }
}


