import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import crypto from 'crypto'
import sharp from 'sharp'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

function filenameFrom(url: string) {
  const base = (new URL(url).pathname.split('/').pop() || 'image').replace(/[^a-zA-Z0-9-_]/g, '') || 'image'
  const hash = crypto.randomUUID().split('-')[0]
  const ts = Date.now()
  return `${ts}-${hash}-${base}.webp`
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null) as { url?: string } | null
    const imageUrl = body?.url?.trim()
    if (!imageUrl) return NextResponse.json({ ok: false, error: 'Missing url' }, { status: 400 })

    let parsed: URL
    try { parsed = new URL(imageUrl) } catch {
      return NextResponse.json({ ok: false, error: 'Invalid URL' }, { status: 400 })
    }
    if (!/^https?:$/.test(parsed.protocol)) {
      return NextResponse.json({ ok: false, error: 'Only http/https allowed' }, { status: 400 })
    }

    const res = await fetch(parsed.toString(), { cache: 'no-store' })
    if (!res.ok) return NextResponse.json({ ok: false, error: 'Failed to fetch remote image' }, { status: 400 })

    const contentType = res.headers.get('content-type') || ''
    if (!/image\/(jpeg|png|webp)/.test(contentType)) {
      return NextResponse.json({ ok: false, error: 'Only JPEG, PNG, or WEBP images are allowed' }, { status: 400 })
    }

    const buffer = Buffer.from(await res.arrayBuffer())
    if (buffer.length > 10 * 1024 * 1024) {
      return NextResponse.json({ ok: false, error: 'File size must be less than 10MB' }, { status: 400 })
    }

    const webp = await sharp(buffer).webp({ quality: 85 }).toBuffer()
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
    await fs.mkdir(uploadsDir, { recursive: true })
    const filename = filenameFrom(parsed.toString())
    await fs.writeFile(path.join(uploadsDir, filename), webp)
    const fileUrl = `/uploads/${filename}`

    return NextResponse.json({ ok: true, url: fileUrl }, { status: 201 })
  } catch (e) {
    return NextResponse.json({ ok: false, error: 'Upload from URL failed' }, { status: 500 })
  }
}


