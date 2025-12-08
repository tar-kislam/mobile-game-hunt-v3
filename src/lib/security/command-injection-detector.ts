/**
 * Command Injection Detection Utility
 * 
 * Detects potential command injection attempts in user input
 * before they can be used in any command execution context.
 */

import { logSecurityEvent } from '../security-monitor'

/**
 * Dangerous shell metacharacters that indicate command injection attempts
 */
const DANGEROUS_PATTERNS = [
  // Command chaining
  /[|;&]/,
  // Command substitution
  /[`$]/,
  // Redirection
  /[<>]/,
  // Pipes and background processes
  /\|\||&&/,
  // Newlines (can break command structure)
  /[\n\r]/,
  // Parentheses (command grouping)
  /[()]/,
  // Curly braces (command expansion)
  /[{}]/,
  // Square brackets (glob patterns)
  /[\[\]]/,
] as const

/**
 * Known malicious payloads from real-world attacks
 */
const KNOWN_PAYLOADS = [
  'reactOnMynuts',
  'nuts/x86',
  'nuts/bolts',
  'busybox wget',
  'busybox curl',
  'cd /dev',
  'chmod 777',
] as const

/**
 * Check if a string contains potential command injection patterns
 */
export function detectCommandInjection(input: string): {
  isMalicious: boolean
  reason?: string
  severity: 'low' | 'medium' | 'high' | 'critical'
} {
  if (typeof input !== 'string' || input.length === 0) {
    return { isMalicious: false, severity: 'low' }
  }

  // Check for known malicious payloads (CRITICAL)
  const lowerInput = input.toLowerCase()
  for (const payload of KNOWN_PAYLOADS) {
    if (lowerInput.includes(payload.toLowerCase())) {
      return {
        isMalicious: true,
        reason: `Known malicious payload detected: ${payload}`,
        severity: 'critical',
      }
    }
  }

  // Check for dangerous patterns
  for (const pattern of DANGEROUS_PATTERNS) {
    if (pattern.test(input)) {
      return {
        isMalicious: true,
        reason: `Dangerous shell metacharacter detected: ${pattern.source}`,
        severity: 'high',
      }
    }
  }

  // Check for suspicious command-like patterns
  const suspiciousPatterns = [
    /wget\s+/i,
    /curl\s+/i,
    /busybox\s+/i,
    /sh\s+-c/i,
    /bash\s+-c/i,
    /\/bin\/sh/i,
    /\/bin\/bash/i,
    /exec\s+/i,
    /eval\s+/i,
    /system\s*\(/i,
    /spawnSync/i,
    /execSync/i,
  ]

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(input)) {
      return {
        isMalicious: true,
        reason: `Suspicious command pattern detected: ${pattern.source}`,
        severity: 'medium',
      }
    }
  }

  return { isMalicious: false, severity: 'low' }
}

/**
 * Validate input and log security event if injection detected
 * 
 * @param input - User input to validate
 * @param context - Context where input will be used (for logging)
 * @returns Validated input (throws if malicious)
 * @throws Error if command injection detected
 */
export function validateAgainstCommandInjection(
  input: string,
  context: {
    path?: string
    userId?: string
    ip?: string
    userAgent?: string
  } = {}
): string {
  const detection = detectCommandInjection(input)

  if (detection.isMalicious) {
    // Log security event
    logSecurityEvent({
      type: 'COMMAND_INJECTION_ATTEMPT',
      severity: detection.severity,
      message: `Command injection attempt detected: ${detection.reason}`,
      details: {
        input: input.substring(0, 200), // Log first 200 chars only
        reason: detection.reason,
        context,
      },
      ip: context.ip,
      userId: context.userId,
      userAgent: context.userAgent,
      path: context.path,
    }).catch(err => {
      console.error('[SECURITY] Failed to log command injection attempt:', err)
    })

    throw new Error(`Invalid input: potential command injection detected`)
  }

  return input
}

/**
 * Sanitize input by removing dangerous characters
 * Use this for logging/display purposes only, NOT for command execution
 */
export function sanitizeForLogging(input: string): string {
  return input
    .replace(/[|;&$`<>(){}[\]\n\r\t]/g, '')
    .substring(0, 200) // Limit length
}

