import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const updateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  username: z.string().min(1).max(50).optional(),
  email: z.string().email().optional(),
  // image can be a data URL (base64) or a URL string; we'll accept string and detect
  image: z.string().optional(),
})

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const parsed = updateSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
    }

    const data = parsed.data as { name?: string; username?: string; email?: string; image?: string }

    // If changing email, ensure uniqueness
    if (data.email) {
      const existing = await prisma.user.findUnique({ where: { email: data.email } })
      if (existing && existing.id !== session.user.id) {
        return NextResponse.json({ error: 'Email already in use' }, { status: 409 })
      }
    }

    const updateData: any = {}
    if (data.name !== undefined) updateData.name = data.name
    if (data.username !== undefined) updateData.username = data.username
    if (data.email !== undefined) updateData.email = data.email

    // If image is a data URL, store to /public/uploads/users
    if (data.image) {
      if (data.image.startsWith('data:image')) {
        const match = data.image.match(/^data:(image\/\w+);base64,(.*)$/)
        if (match) {
          const ext = match[1].split('/')[1]
          const buffer = Buffer.from(match[2], 'base64')
          const fs = await import('fs')
          const path = await import('path')
          const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'users')
          if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true })
          const filename = `${session.user.id}.${ext}`
          const filepath = path.join(uploadsDir, filename)
          fs.writeFileSync(filepath, buffer)
          updateData.image = `/uploads/users/${filename}`
        }
      } else if (data.image.startsWith('/uploads/') || data.image.startsWith('http')) {
        updateData.image = data.image
      }
    }

    const updated = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
      select: { id: true, name: true, username: true, email: true, image: true, notificationsEnabled: true, marketingOptIn: true }
    })

    return NextResponse.json({ ok: true, user: updated })
  } catch (e) {
    console.error('User update error:', e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}


