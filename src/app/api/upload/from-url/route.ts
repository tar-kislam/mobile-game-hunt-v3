import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import crypto from 'crypto'
import sharp from 'sharp'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

function filenameFrom(url: string) {
  const base = (new URL(url).pathname.split('/').pop() || 'image').replace(/[^a-zA-Z0-9-_]/g, '') || 'image'
  const hash = crypto.randomUUID().split('-')[0]
  const ts = Date.now()
  return `${ts}-${hash}-${base}.webp`
}

/**
 * Check if hostname is an internal/private IP address
 * SECURITY: Prevents SSRF attacks by blocking internal network access
 */
function isInternalIp(hostname: string): boolean {
  // Localhost variants
  if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1' || hostname === '0.0.0.0') {
    return true
  }

  // Private IP ranges (RFC 1918)
  const privateRanges = [
    /^10\./,                                    // 10.0.0.0/8
    /^172\.(1[6-9]|2[0-9]|3[0-1])\./,          // 172.16.0.0/12
    /^192\.168\./,                              // 192.168.0.0/16
    /^169\.254\./,                              // Link-local (169.254.0.0/16)
    /^fc00:/,                                   // IPv6 private range
    /^fe80:/,                                   // IPv6 link-local
  ]

  if (privateRanges.some(range => range.test(hostname))) {
    return true
  }

  // Cloud metadata endpoints (critical for SSRF prevention)
  const blockedHosts = [
    '169.254.169.254',                          // AWS, GCP, Azure metadata
    'metadata.google.internal',                 // GCP metadata
    'metadata.azure.com',                       // Azure metadata
    'metadata.azure.net',                       // Azure metadata (alternative)
    '169.254.169.250',                          // Alibaba Cloud metadata
    '100.100.100.200',                          // Alibaba Cloud metadata
  ]

  if (blockedHosts.includes(hostname.toLowerCase())) {
    return true
  }

  return false
}

/**
 * Validate URL is safe for fetching (SSRF protection)
 */
function isUrlSafe(url: URL): { safe: boolean; reason?: string } {
  const hostname = url.hostname.toLowerCase()

  // Check for internal IPs
  if (isInternalIp(hostname)) {
    return { safe: false, reason: 'Internal IP addresses are not allowed' }
  }

  // Only allow http and https protocols
  if (!['http:', 'https:'].includes(url.protocol)) {
    return { safe: false, reason: 'Only HTTP and HTTPS protocols are allowed' }
  }

  // Block localhost variants (case-insensitive)
  if (hostname.includes('localhost') || hostname.includes('127.0.0.1')) {
    return { safe: false, reason: 'Localhost access is not allowed' }
  }

  return { safe: true }
}

export async function POST(req: NextRequest) {
  try {
    // SECURITY: Require authentication
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      const { logSecurityEvent, extractIp, extractUserAgent } = await import('@/lib/security-monitor')
      await logSecurityEvent({
        type: 'UNAUTHORIZED_ACCESS',
        severity: 'medium',
        message: 'Unauthorized access attempt to upload/from-url endpoint',
        details: {},
        ip: extractIp(req),
        userAgent: extractUserAgent(req),
        path: '/api/upload/from-url',
      })
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json().catch(() => null) as { url?: string } | null
    const imageUrl = body?.url?.trim()
    if (!imageUrl) return NextResponse.json({ ok: false, error: 'Missing url' }, { status: 400 })

    let parsed: URL
    try { parsed = new URL(imageUrl) } catch {
      return NextResponse.json({ ok: false, error: 'Invalid URL' }, { status: 400 })
    }

    // SECURITY: SSRF protection - validate URL is safe
    const urlValidation = isUrlSafe(parsed)
    if (!urlValidation.safe) {
      const { logSecurityEvent, extractIp, extractUserAgent } = await import('@/lib/security-monitor')
      await logSecurityEvent({
        type: 'SSRF_ATTEMPT',
        severity: 'critical',
        message: `SSRF attempt detected: ${urlValidation.reason}`,
        details: {
          attemptedUrl: imageUrl,
          hostname: parsed.hostname,
          protocol: parsed.protocol,
          reason: urlValidation.reason,
        },
        ip: extractIp(req),
        userAgent: extractUserAgent(req),
        userId: session.user.id,
        path: '/api/upload/from-url',
      })
      return NextResponse.json({ ok: false, error: urlValidation.reason || 'URL not allowed' }, { status: 400 })
    }

    // SECURITY: Additional timeout and size limits for fetch
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

    let res: Response
    try {
      res = await fetch(parsed.toString(), {
        cache: 'no-store',
        signal: controller.signal,
        headers: {
          'User-Agent': 'MobileGameHunt-ImageFetcher/1.0',
        },
      })
      clearTimeout(timeoutId)
    } catch (fetchError) {
      clearTimeout(timeoutId)
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        return NextResponse.json({ ok: false, error: 'Request timeout' }, { status: 408 })
      }
      throw fetchError
    }
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
    const filePath = path.join(uploadsDir, filename)
    
    // SECURITY: Verify the resolved path is still within uploadsDir (prevent path traversal)
    const resolvedPath = path.resolve(filePath)
    const resolvedDir = path.resolve(uploadsDir)
    if (!resolvedPath.startsWith(resolvedDir)) {
      // Log security event
      const { logSecurityEvent, extractIp, extractUserAgent } = await import('@/lib/security-monitor')
      await logSecurityEvent({
        type: 'PATH_TRAVERSAL_ATTEMPT',
        severity: 'high',
        message: 'Path traversal attempt detected in URL upload',
        details: {
          attemptedPath: filePath,
          resolvedPath,
          baseDir: resolvedDir,
          sourceUrl: imageUrl,
        },
        ip: extractIp(req),
        userAgent: extractUserAgent(req),
        path: '/api/upload/from-url',
      })
      
      return NextResponse.json({ ok: false, error: 'Invalid file path' }, { status: 400 })
    }
    
    await fs.writeFile(filePath, webp)
    const fileUrl = `/uploads/${filename}`

    return NextResponse.json({ ok: true, url: fileUrl }, { status: 201 })
  } catch (e) {
    return NextResponse.json({ ok: false, error: 'Upload from URL failed' }, { status: 500 })
  }
}


