/**
 * Security Monitoring & Alerting System
 * 
 * This module provides centralized security event logging and alerting.
 * All security-related events should be logged through this module.
 */

import { sendSecurityAlertEmail } from './email'

export type SecurityEventType =
  | 'COMMAND_INJECTION_ATTEMPT'
  | 'RCE_ATTEMPT'
  | 'SHELL_INJECTION_ATTEMPT'
  | 'PATH_TRAVERSAL_ATTEMPT'
  | 'UNAUTHORIZED_ACCESS'
  | 'RATE_LIMIT_EXCEEDED'
  | 'SUSPICIOUS_FILE_UPLOAD'
  | 'INVALID_INPUT'
  | 'AUTHENTICATION_FAILURE'
  | 'PRIVILEGE_ESCALATION_ATTEMPT'
  | 'SQL_INJECTION_ATTEMPT'
  | 'XSS_ATTEMPT'
  | 'SSRF_ATTEMPT'

export interface SecurityEvent {
  type: SecurityEventType
  severity: 'low' | 'medium' | 'high' | 'critical'
  message: string
  details?: Record<string, any>
  ip?: string
  userId?: string
  userAgent?: string
  path?: string
  timestamp?: Date
}

// In-memory buffer for recent events (last 100 events)
// In production, consider using Redis or a database
const eventBuffer: SecurityEvent[] = []
const MAX_BUFFER_SIZE = 100

// Alert thresholds - send email alerts for these conditions
const ALERT_THRESHOLDS = {
  critical: 1, // Alert immediately for critical events
  high: 3, // Alert after 3 high-severity events in 5 minutes
  medium: 10, // Alert after 10 medium-severity events in 15 minutes
}

// Event counters (time-windowed)
const eventCounters: Map<string, { count: number; windowStart: number }> = new Map()

/**
 * Log a security event
 */
export async function logSecurityEvent(event: SecurityEvent): Promise<void> {
  const timestamp = new Date()
  const fullEvent: SecurityEvent = {
    ...event,
    timestamp,
  }

  // Add to buffer
  eventBuffer.push(fullEvent)
  if (eventBuffer.length > MAX_BUFFER_SIZE) {
    eventBuffer.shift() // Remove oldest event
  }

  // Log to console with structured format
  const logLevel = event.severity === 'critical' || event.severity === 'high' ? 'error' : 'warn'
  console[logLevel](
    `[SECURITY][${event.severity.toUpperCase()}] ${event.type}: ${event.message}`,
    {
      ...event.details,
      ip: event.ip,
      userId: event.userId,
      userAgent: event.userAgent,
      path: event.path,
      timestamp: timestamp.toISOString(),
    }
  )

  // Check if we should send an alert
  await checkAndSendAlert(fullEvent)
}

/**
 * Check if we should send an alert based on thresholds
 */
async function checkAndSendAlert(event: SecurityEvent): Promise<void> {
  const threshold = ALERT_THRESHOLDS[event.severity]
  if (!threshold) return

  // For critical events, alert immediately
  if (event.severity === 'critical') {
    await sendSecurityAlert(event)
    return
  }

  // For other severities, use time-windowed counting
  const windowKey = `${event.severity}:${event.type}`
  const windowDuration = event.severity === 'high' ? 5 * 60 * 1000 : 15 * 60 * 1000 // 5 or 15 minutes
  const now = Date.now()

  const counter = eventCounters.get(windowKey)
  if (!counter || now - counter.windowStart > windowDuration) {
    // Start new window
    eventCounters.set(windowKey, { count: 1, windowStart: now })
    return
  }

  // Increment counter
  counter.count++
  eventCounters.set(windowKey, counter)

  // Check if threshold reached
  if (counter.count >= threshold) {
    await sendSecurityAlert(event, counter.count)
    // Reset counter after alert
    eventCounters.set(windowKey, { count: 0, windowStart: now })
  }
}

/**
 * Send security alert email
 */
async function sendSecurityAlert(event: SecurityEvent, count?: number): Promise<void> {
  try {
    // Only send alerts if email is configured
    if (!process.env.SMTP_HOST) {
      console.warn('[SECURITY] Email alerts not configured. Set SMTP_HOST to enable alerts.')
      return
    }

    const alertEmail = process.env.SECURITY_ALERT_EMAIL || process.env.SMTP_FROM || 'admin@mobilegamehunt.com'
    
    await sendSecurityAlertEmail({
      eventType: event.type,
      severity: event.severity,
      message: event.message,
      details: event.details,
      ip: event.ip,
      userId: event.userId,
      path: event.path,
      timestamp: event.timestamp || new Date(),
      count,
    }, alertEmail)
  } catch (error) {
    console.error('[SECURITY] Failed to send alert email:', error)
  }
}

/**
 * Get recent security events
 */
export function getRecentSecurityEvents(limit: number = 50): SecurityEvent[] {
  return eventBuffer.slice(-limit).reverse() // Most recent first
}

/**
 * Get security events by type
 */
export function getSecurityEventsByType(type: SecurityEventType): SecurityEvent[] {
  return eventBuffer.filter((e) => e.type === type).reverse()
}

/**
 * Get security events by severity
 */
export function getSecurityEventsBySeverity(severity: SecurityEventType['severity']): SecurityEvent[] {
  return eventBuffer.filter((e) => e.severity === severity).reverse()
}

/**
 * Helper: Extract IP from request
 */
export function extractIp(request: Request | { headers: Headers }): string {
  const headers = 'headers' in request ? request.headers : new Headers()
  const forwarded = headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  const realIp = headers.get('x-real-ip')
  if (realIp) {
    return realIp.trim()
  }
  return 'unknown'
}

/**
 * Helper: Extract user agent from request
 */
export function extractUserAgent(request: Request | { headers: Headers }): string {
  const headers = 'headers' in request ? request.headers : new Headers()
  return headers.get('user-agent') || 'unknown'
}

