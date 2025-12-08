/**
 * SECURE SHELL EXECUTION UTILITY
 * 
 * This module provides a secure wrapper for executing system commands.
 * It enforces strict validation and prevents command injection attacks.
 * 
 * SECURITY RULES:
 * 1. NO shell strings - all commands use execFile/spawn with argument arrays
 * 2. NO user input in commands - all arguments must be validated
 * 3. Whitelist-only approach - only pre-approved commands allowed
 * 4. Strict input validation - regex patterns for all user-derived arguments
 */

import { execFile, ExecFileOptions } from 'child_process'
import { promisify } from 'util'

const execFileAsync = promisify(execFile)

/**
 * ALLOWED COMMANDS WHITELIST
 * Only commands listed here can be executed.
 * Add new commands ONLY after security review.
 */
const ALLOWED_COMMANDS = [
  // Image processing
  'sharp', // Actually a Node.js library, not a command
  // Add other safe commands here if needed
] as const

type AllowedCommand = typeof ALLOWED_COMMANDS[number]

/**
 * Validation patterns for user-derived arguments
 */
const VALIDATION_PATTERNS = {
  // Hostname validation (RFC 1123 compliant)
  hostname: /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,
  
  // Filename validation (no path separators, no special chars)
  filename: /^[a-zA-Z0-9._-]+$/,
  
  // File path validation (relative paths only, no traversal)
  filepath: /^[a-zA-Z0-9._/-]+$/,
  
  // UUID validation
  uuid: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
  
  // Alphanumeric with limited special chars
  alphanumeric: /^[a-zA-Z0-9_-]+$/,
} as const

/**
 * Validate hostname
 * @throws Error if hostname is invalid
 */
export function validateHost(host: string): string {
  if (typeof host !== 'string' || host.length === 0 || host.length > 253) {
    throw new Error('Invalid host: must be a non-empty string <= 253 characters')
  }
  
  if (!VALIDATION_PATTERNS.hostname.test(host)) {
    throw new Error(`Invalid host: "${host}" contains invalid characters`)
  }
  
  // Block localhost and private IPs
  const lower = host.toLowerCase()
  if (lower === 'localhost' || 
      lower === '127.0.0.1' || 
      lower === '::1' || 
      lower === '0.0.0.0' ||
      lower.startsWith('192.168.') ||
      lower.startsWith('10.') ||
      lower.startsWith('172.16.') ||
      lower.startsWith('172.17.') ||
      lower.startsWith('172.18.') ||
      lower.startsWith('172.19.') ||
      lower.startsWith('172.20.') ||
      lower.startsWith('172.21.') ||
      lower.startsWith('172.22.') ||
      lower.startsWith('172.23.') ||
      lower.startsWith('172.24.') ||
      lower.startsWith('172.25.') ||
      lower.startsWith('172.26.') ||
      lower.startsWith('172.27.') ||
      lower.startsWith('172.28.') ||
      lower.startsWith('172.29.') ||
      lower.startsWith('172.30.') ||
      lower.startsWith('172.31.') ||
      lower === '169.254.169.254') {
    throw new Error(`Invalid host: "${host}" is a private/internal address`)
  }
  
  return host
}

/**
 * Validate filename (no path separators)
 * @throws Error if filename is invalid
 */
export function validateFilename(filename: string): string {
  if (typeof filename !== 'string' || filename.length === 0 || filename.length > 255) {
    throw new Error('Invalid filename: must be a non-empty string <= 255 characters')
  }
  
  if (!VALIDATION_PATTERNS.filename.test(filename)) {
    throw new Error(`Invalid filename: "${filename}" contains invalid characters`)
  }
  
  // Block dangerous filenames
  const lower = filename.toLowerCase()
  if (['.', '..', 'con', 'prn', 'aux', 'nul'].includes(lower) ||
      lower.startsWith('com') || lower.startsWith('lpt')) {
    throw new Error(`Invalid filename: "${filename}" is a reserved name`)
  }
  
  return filename
}

/**
 * Validate file path (relative paths only, no traversal)
 * @throws Error if path is invalid
 */
export function validateFilePath(filepath: string): string {
  if (typeof filepath !== 'string' || filepath.length === 0) {
    throw new Error('Invalid filepath: must be a non-empty string')
  }
  
  // Block absolute paths
  if (filepath.startsWith('/') || filepath.startsWith('\\')) {
    throw new Error(`Invalid filepath: "${filepath}" is an absolute path`)
  }
  
  // Block path traversal
  if (filepath.includes('..') || filepath.includes('../') || filepath.includes('..\\')) {
    throw new Error(`Invalid filepath: "${filepath}" contains path traversal`)
  }
  
  // Validate characters
  if (!VALIDATION_PATTERNS.filepath.test(filepath)) {
    throw new Error(`Invalid filepath: "${filepath}" contains invalid characters`)
  }
  
  return filepath
}

/**
 * Assert that a command is in the allowed whitelist
 * @throws Error if command is not allowed
 */
export function assertAllowedCommand(cmd: string): asserts cmd is AllowedCommand {
  if (!ALLOWED_COMMANDS.includes(cmd as AllowedCommand)) {
    throw new Error(`Command not allowed: "${cmd}". Only whitelisted commands can be executed.`)
  }
}

/**
 * Secure wrapper around execFile
 * 
 * SECURITY GUARANTEES:
 * - NO shell interpretation (execFile, not exec)
 * - Arguments are passed as array (no string concatenation)
 * - Command must be in whitelist
 * - All arguments are pre-validated
 * 
 * @param cmd - Command to execute (must be in ALLOWED_COMMANDS)
 * @param args - Command arguments (must be pre-validated strings)
 * @param options - execFile options
 * @returns Promise with stdout and stderr
 * @throws Error if command is not allowed or execution fails
 */
export async function secureExecFile(
  cmd: string,
  args: string[],
  options: ExecFileOptions = {}
): Promise<{ stdout: string; stderr: string }> {
  // Validate command is in whitelist
  assertAllowedCommand(cmd)
  
  // Validate all arguments are strings
  for (const arg of args) {
    if (typeof arg !== 'string') {
      throw new Error(`Invalid argument: all arguments must be strings, got ${typeof arg}`)
    }
    
    // Block shell metacharacters in arguments
    if (/[|;&$`<>(){}[\]\n\r\t]/.test(arg)) {
      throw new Error(`Invalid argument: "${arg}" contains shell metacharacters`)
    }
  }
  
  // Set secure defaults
  const secureOptions: ExecFileOptions = {
    ...options,
    shell: false, // CRITICAL: No shell interpretation
    maxBuffer: options.maxBuffer || 1024 * 1024, // 1MB default
    timeout: options.timeout || 30000, // 30s default timeout
  }
  
  try {
    const result = await execFileAsync(cmd, args, secureOptions)
    return {
      stdout: result.stdout.toString(),
      stderr: result.stderr.toString(),
    }
  } catch (error) {
    // Log error but don't expose internal details
    console.error(`[SECURE_SHELL] Command execution failed: ${cmd}`, {
      args: args.map(() => '[REDACTED]'), // Don't log actual args in production
      error: error instanceof Error ? error.message : 'Unknown error',
    })
    throw new Error(`Command execution failed: ${cmd}`)
  }
}

/**
 * Check if a command would be allowed
 * Useful for validation before attempting execution
 */
export function isCommandAllowed(cmd: string): boolean {
  return ALLOWED_COMMANDS.includes(cmd as AllowedCommand)
}

/**
 * Get list of allowed commands (for debugging/admin purposes)
 */
export function getAllowedCommands(): readonly string[] {
  return [...ALLOWED_COMMANDS]
}

