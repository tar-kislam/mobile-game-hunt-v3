import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    console.log('📤 Upload API called')
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    
    if (!file) {
      console.log('❌ No file provided')
      return NextResponse.json({ ok: false, error: 'No file provided' }, { status: 400 })
    }

    console.log('📁 File received:', file.name, file.size, 'bytes', file.type)

    // Validate file type
    if (!file.type.startsWith('image/')) {
      console.log('❌ Invalid file type:', file.type)
      return NextResponse.json({ ok: false, error: 'Only image files are allowed' }, { status: 400 })
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      console.log('❌ File too large:', file.size, 'bytes')
      return NextResponse.json({ ok: false, error: 'File size must be less than 5MB' }, { status: 400 })
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
    await fs.mkdir(uploadsDir, { recursive: true })

    const ext = path.extname(file.name) || '.png'
    const base = path.basename(file.name, ext).replace(/[^a-zA-Z0-9-_]/g, '') || 'image'
    const filename = `${Date.now()}-${base}${ext}`
    const filePath = path.join(uploadsDir, filename)

    await fs.writeFile(filePath, buffer)

    const url = `/uploads/${filename}`
    console.log('✅ File uploaded successfully:', url)
    
    return NextResponse.json({ 
      ok: true, 
      success: true, // For backward compatibility
      url 
    }, { status: 201 })
  } catch (error) {
    console.error('❌ POST /api/upload error:', error)
    return NextResponse.json({ 
      ok: false, 
      success: false, // For backward compatibility
      error: 'Upload failed' 
    }, { status: 500 })
  }
}
