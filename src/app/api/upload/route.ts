import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import crypto from 'crypto'
import sharp from 'sharp'

export const runtime = 'nodejs'
export const maxDuration = 60 // 60 seconds timeout for large files

// Increase body size limit to 10MB  
export const dynamic = 'force-dynamic'

// Generate unique filename using timestamp + short hash
function generateWebpFilename(originalName: string): string {
  const base = path.parse(originalName).name.replace(/[^a-zA-Z0-9-_]/g, '') || 'image'
  const hash = crypto.randomUUID().split('-')[0]
  const ts = Date.now()
  return `${ts}-${hash}-${base}.webp`
}

export async function POST(request: NextRequest) {
  try {
    console.log('📤 Upload API called - POST request')
    console.log('📍 Request URL:', request.url)
    console.log('📍 Request method:', request.method)
    
    // Add request signal check
    if (request.signal.aborted) {
      console.log('⚠️ Request already aborted')
      return NextResponse.json({ 
        ok: false, 
        success: false,
        error: 'Request aborted' 
      }, { status: 400 })
    }
    
    let formData
    try {
      formData = await request.formData()
    } catch (error) {
      console.error('❌ Failed to parse form data:', error)
      return NextResponse.json({ 
        ok: false, 
        success: false,
        error: 'Failed to parse upload data' 
      }, { status: 400 })
    }
    
    const file = formData.get('file') as File | null
    
    if (!file) {
      console.log('❌ No file provided')
      return NextResponse.json({ 
        ok: false, 
        success: false,
        error: 'No file provided' 
      }, { status: 400 })
    }

    console.log('📁 File received:', file.name, file.size, 'bytes', file.type)

    // Validate file type (strict)
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      console.log('❌ Invalid file type:', file.type)
      return NextResponse.json({ 
        ok: false, 
        success: false,
        error: 'Only JPEG, PNG, or WEBP images are allowed' 
      }, { status: 400 })
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      console.log('❌ File too large:', file.size, 'bytes')
      return NextResponse.json({ 
        ok: false, 
        success: false,
        error: 'File size must be less than 10MB' 
      }, { status: 400 })
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
    await fs.mkdir(uploadsDir, { recursive: true })

    // Convert to webp using sharp
    const start = Date.now()
    let webpBuffer: Buffer
    try {
      webpBuffer = await sharp(buffer).webp({ quality: 85 }).toBuffer()
    } catch (err) {
      console.error('❌ Image conversion failed:', err)
      return NextResponse.json({ ok: false, success: false, error: 'Image conversion failed' }, { status: 500 })
    }

    const filename = generateWebpFilename(file.name)
    const filePath = path.join(uploadsDir, filename)

    await fs.writeFile(filePath, webpBuffer)

    const url = `/uploads/${filename}`
    console.log('✅ File converted to webp and saved:', url, 'bytes:', webpBuffer.byteLength, 'time:', (Date.now()-start)+'ms')
    
    // Return standardized response (backward compatibility kept)
    return NextResponse.json({ 
      ok: true, 
      success: true,
      url,
      fileUrl: url,
      imageUrl: url
    }, { 
      status: 201,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=604800'
      }
    })
  } catch (error) {
    // Handle aborted requests
    if (error instanceof Error && error.name === 'AbortError') {
      console.log('⚠️ Upload aborted by client')
      return NextResponse.json({ 
        ok: false, 
        success: false,
        error: 'Upload aborted' 
      }, { status: 499 }) // Client Closed Request
    }
    
    console.error('❌ POST /api/upload error:', error)
    return NextResponse.json({ 
      ok: false, 
      success: false, // For backward compatibility
      error: 'Upload failed' 
    }, { status: 500 })
  }
}

// Handle other HTTP methods
export async function GET() {
  return NextResponse.json({ 
    ok: false, 
    success: false,
    error: 'Method not allowed. Use POST to upload files.' 
  }, { status: 405 })
}

export async function PUT() {
  return NextResponse.json({ 
    ok: false, 
    success: false,
    error: 'Method not allowed. Use POST to upload files.' 
  }, { status: 405 })
}

export async function DELETE() {
  return NextResponse.json({ 
    ok: false, 
    success: false,
    error: 'Method not allowed. Use POST to upload files.' 
  }, { status: 405 })
}

export async function PATCH() {
  return NextResponse.json({ 
    ok: false, 
    success: false,
    error: 'Method not allowed. Use POST to upload files.' 
  }, { status: 405 })
}
