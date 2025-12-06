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
    // SECURITY: Validate file extension to prevent path traversal and malicious file types
    if (data.image) {
      if (data.image.startsWith('data:image')) {
        const match = data.image.match(/^data:(image\/\w+);base64,(.*)$/)
        if (match) {
          const mimeType = match[1]
          const base64Data = match[2]
          
          // SECURITY: Whitelist allowed image types only
          const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp']
          if (!allowedMimeTypes.includes(mimeType)) {
            return NextResponse.json({ error: 'Invalid image type. Only JPEG, PNG, and WEBP are allowed.' }, { status: 400 })
          }
          
          // SECURITY: Map MIME type to safe file extension (no user input in extension)
          const extMap: Record<string, string> = {
            'image/jpeg': 'jpg',
            'image/png': 'png',
            'image/webp': 'webp'
          }
          const ext = extMap[mimeType] || 'jpg'
          
          // SECURITY: Validate base64 data size (max 5MB)
          const buffer = Buffer.from(base64Data, 'base64')
          if (buffer.length > 5 * 1024 * 1024) {
            return NextResponse.json({ error: 'Image too large. Maximum size is 5MB.' }, { status: 400 })
          }
          
          const fs = await import('fs')
          const path = await import('path')
          
          // SECURITY: Use path.join with fixed directory to prevent path traversal
          const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'users')
          if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true })
          
          // SECURITY: Filename uses only session.user.id (validated) and whitelisted extension
          const filename = `${session.user.id}.${ext}`
          const filepath = path.join(uploadsDir, filename)
          
          // SECURITY: Verify the resolved path is still within uploadsDir (prevent path traversal)
          const resolvedPath = path.resolve(filepath)
          const resolvedDir = path.resolve(uploadsDir)
          if (!resolvedPath.startsWith(resolvedDir)) {
            // Log security event
            const { logSecurityEvent, extractIp, extractUserAgent } = await import('@/lib/security-monitor')
            await logSecurityEvent({
              type: 'PATH_TRAVERSAL_ATTEMPT',
              severity: 'high',
              message: 'Path traversal attempt detected in user avatar upload',
              details: {
                attemptedPath: filepath,
                resolvedPath,
                baseDir: resolvedDir,
                userId: session.user.id,
              },
              ip: extractIp(req),
              userAgent: extractUserAgent(req),
              path: '/api/user/update',
              userId: session.user.id,
            })
            
            return NextResponse.json({ error: 'Invalid file path' }, { status: 400 })
          }
          
          fs.writeFileSync(filepath, buffer)
          updateData.image = `/uploads/users/${filename}`
        }
      } else if (data.image.startsWith('/uploads/') || data.image.startsWith('http')) {
        // SECURITY: Only allow paths starting with /uploads/ or http(s) URLs
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


