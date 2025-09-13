import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getUserNotifications, getUnreadCount, markAllAsRead } from '@/lib/notificationService'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const limit = parseInt(searchParams.get('limit') || '10')
    const includeUnreadCount = searchParams.get('includeUnreadCount') === 'true'

    // Get notifications
    const notifications = await getUserNotifications(session.user.id, limit)
    
    // Get unread count if requested
    let unreadCount = 0
    if (includeUnreadCount) {
      unreadCount = await getUnreadCount(session.user.id)
    }

    return NextResponse.json({
      notifications,
      unreadCount,
      total: notifications.length
    })
  } catch (error) {
    console.error('[NOTIFICATIONS API] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { action } = body

    if (action === 'markAllAsRead') {
      const count = await markAllAsRead(session.user.id)
      return NextResponse.json({ 
        success: true, 
        markedAsRead: count 
      })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('[NOTIFICATIONS API] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}