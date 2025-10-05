import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import crypto from 'crypto'

export const runtime = 'nodejs'
export const maxDuration = 60 // 60 seconds timeout for large files

// Increase body size limit to 10MB  
export const dynamic = 'force-dynamic'

// Generate unique filename using UUID
function generateUniqueFilename(originalName: string): string {
  const ext = path.extname(originalName) || '.png'
  const base = path.basename(originalName, ext).replace(/[^a-zA-Z0-9-_]/g, '') || 'image'
  const uuid = crypto.randomUUID().split('-')[0] // Use first segment of UUID
  const timestamp = Date.now()
  return `${timestamp}-${uuid}-${base}${ext}`
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

    // Validate file type
    if (!file.type.startsWith('image/')) {
      console.log('❌ Invalid file type:', file.type)
      return NextResponse.json({ 
        ok: false, 
        success: false,
        error: 'Only image files are allowed' 
      }, { status: 400 })
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      console.log('❌ File too large:', file.size, 'bytes')
      return NextResponse.json({ 
        ok: false, 
        success: false,
        error: 'File size must be less than 5MB' 
      }, { status: 400 })
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
    await fs.mkdir(uploadsDir, { recursive: true })

    // Use UUID-based unique filename for better collision avoidance in parallel uploads
    const filename = generateUniqueFilename(file.name)
    const filePath = path.join(uploadsDir, filename)

    await fs.writeFile(filePath, buffer)

    const url = `/uploads/${filename}`
    console.log('✅ File uploaded successfully:', url)
    
    // Return standardized response with multiple field names for compatibility
    return NextResponse.json({ 
      ok: true, 
      success: true,
      url,
      fileUrl: url // Alternative field name
    }, { 
      status: 201,
      headers: {
        'Content-Type': 'application/json',
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
