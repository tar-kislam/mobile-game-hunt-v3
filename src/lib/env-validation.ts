/**
 * Environment Variables Validation
 * 
 * Validates required environment variables at startup to prevent
 * runtime errors and security issues from misconfiguration.
 */

interface EnvConfig {
  required: string[]
  optional: string[]
  productionOnly: string[]
}

const envConfig: EnvConfig = {
  required: [
    'DATABASE_URL',
    'NEXTAUTH_SECRET',
    'NEXTAUTH_URL',
  ],
  optional: [
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
    'GITHUB_CLIENT_ID',
    'GITHUB_CLIENT_SECRET',
    'REDIS_URL',
    'SMTP_HOST',
    'SMTP_PORT',
    'SMTP_USER',
    'SMTP_PASS',
    'SMTP_FROM',
    'SECURITY_ALERT_EMAIL',
    'DISCORD_WEBHOOK_URL',
    'PLAYTEST_API_KEY',
  ],
  productionOnly: [
    'NEXTAUTH_SECRET',
  ],
}

/**
 * Validate environment variables
 * Call this at application startup
 */
export function validateEnvironment(): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  const isProduction = process.env.NODE_ENV === 'production'

  // Check required variables
  for (const key of envConfig.required) {
    if (!process.env[key]) {
      errors.push(`Required environment variable ${key} is not set`)
    }
  }

  // Check production-only variables
  if (isProduction) {
    for (const key of envConfig.productionOnly) {
      if (!process.env[key]) {
        errors.push(`Production requires environment variable ${key} to be set`)
      }
    }
  }

  // Validate specific formats
  if (process.env.DATABASE_URL && !process.env.DATABASE_URL.startsWith('postgresql://')) {
    errors.push('DATABASE_URL must be a valid PostgreSQL connection string')
  }

  if (process.env.NEXTAUTH_URL && !process.env.NEXTAUTH_URL.startsWith('http')) {
    errors.push('NEXTAUTH_URL must be a valid URL starting with http:// or https://')
  }

  if (process.env.NEXTAUTH_SECRET && process.env.NEXTAUTH_SECRET.length < 32) {
    errors.push('NEXTAUTH_SECRET must be at least 32 characters long')
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * Get environment variable with validation
 */
export function getEnv(key: string, defaultValue?: string): string {
  const value = process.env[key] || defaultValue

  if (!value && envConfig.required.includes(key)) {
    throw new Error(`Required environment variable ${key} is not set`)
  }

  return value || ''
}

/**
 * Initialize and validate environment on module load (only in production)
 */
if (process.env.NODE_ENV === 'production') {
  const validation = validateEnvironment()
  if (!validation.valid) {
    console.error('[ENV] Environment validation failed:')
    validation.errors.forEach((error) => console.error(`[ENV] ${error}`))
    // Don't throw in production to avoid breaking the app, but log errors
    // In development, you might want to throw
  } else {
    console.log('[ENV] Environment variables validated successfully')
  }
}

