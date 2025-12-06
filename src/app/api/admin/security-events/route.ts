import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getRecentSecurityEvents, getSecurityEventsByType, getSecurityEventsBySeverity } from '@/lib/security-monitor'

/**
 * GET /api/admin/security-events
 * Get security events for the admin dashboard
 * Requires ADMIN or EDITOR role
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'ADMIN' && session.user.role !== 'EDITOR') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50', 10)
    const type = searchParams.get('type') as any
    const severity = searchParams.get('severity') as any

    let events

    if (type) {
      events = getSecurityEventsByType(type)
    } else if (severity) {
      events = getSecurityEventsBySeverity(severity)
    } else {
      events = getRecentSecurityEvents(limit)
    }

    // Convert to serializable format
    const serializedEvents = events.map(event => ({
      ...event,
      timestamp: event.timestamp?.toISOString() || new Date().toISOString(),
    }))

    return NextResponse.json({
      events: serializedEvents,
      total: serializedEvents.length,
    })
  } catch (error) {
    console.error('[ADMIN][SECURITY-EVENTS] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch security events' },
      { status: 500 }
    )
  }
}

