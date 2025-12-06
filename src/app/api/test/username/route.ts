import { NextRequest, NextResponse } from 'next/server'
import { generateUniqueUsername, isUsernameAvailable, sanitizeUsername } from '@/lib/usernameUtils'

// SECURITY: Disable test endpoint in production
export async function POST(request: NextRequest) {
  // SECURITY: Only allow in development
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'This endpoint is not available in production' },
      { status: 403 }
    )
  }

  try {
    const { name, action = 'generate' } = await request.json()

    if (!name || typeof name !== 'string') {
      return NextResponse.json(
        { error: 'Name is required and must be a string' },
        { status: 400 }
      )
    }

    switch (action) {
      case 'generate':
        try {
          const username = await generateUniqueUsername(name)
          return NextResponse.json({ 
            success: true, 
            originalName: name,
            generatedUsername: username 
          })
        } catch (error) {
          return NextResponse.json(
            { error: 'Failed to generate username', details: (error as Error).message },
            { status: 500 }
          )
        }

      case 'check':
        try {
          const sanitized = sanitizeUsername(name)
          const available = await isUsernameAvailable(sanitized)
          return NextResponse.json({ 
            success: true, 
            username: sanitized,
            available 
          })
        } catch (error) {
          return NextResponse.json(
            { error: 'Failed to check username availability', details: (error as Error).message },
            { status: 500 }
          )
        }

      case 'sanitize':
        try {
          const sanitized = sanitizeUsername(name)
          return NextResponse.json({ 
            success: true, 
            originalName: name,
            sanitizedUsername: sanitized 
          })
        } catch (error) {
          return NextResponse.json(
            { error: 'Failed to sanitize username', details: (error as Error).message },
            { status: 500 }
          )
        }

      default:
        return NextResponse.json(
          { error: 'Invalid action. Use "generate", "check", or "sanitize"' },
          { status: 400 }
        )
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    )
  }
}

export async function GET() {
  // SECURITY: Only allow in development
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'This endpoint is not available in production' },
      { status: 403 }
    )
  }

  return NextResponse.json({
    message: 'Username generation API',
    usage: {
      generate: 'POST with { "name": "John Doe", "action": "generate" }',
      check: 'POST with { "name": "john-doe", "action": "check" }',
      sanitize: 'POST with { "name": "John Doe", "action": "sanitize" }'
    }
  })
}
