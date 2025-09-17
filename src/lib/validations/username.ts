// Reserved usernames that cannot be used
const RESERVED_USERNAMES = [
  'admin',
  'support',
  'help',
  'api',
  'www',
  'mail',
  'ftp',
  'root',
  'guest',
  'user',
  'test',
  'demo',
  'system',
  'service',
  'app',
  'mobile',
  'game',
  'hunt',
  'mobilegamehunt',
  'mgh'
]

export interface UsernameValidationResult {
  isValid: boolean
  error?: string
}

export function validateUsername(username: string): UsernameValidationResult {
  // Check length
  if (!username || username.length < 3) {
    return {
      isValid: false,
      error: 'Username must be at least 3 characters long'
    }
  }

  if (username.length > 20) {
    return {
      isValid: false,
      error: 'Username must be no more than 20 characters long'
    }
  }

  // Check for reserved words (case insensitive)
  if (RESERVED_USERNAMES.includes(username.toLowerCase())) {
    return {
      isValid: false,
      error: 'This username is reserved and cannot be used'
    }
  }

  // Check for valid characters (letters, numbers, underscores, dots)
  const validUsernameRegex = /^[a-zA-Z0-9_.]+$/
  if (!validUsernameRegex.test(username)) {
    return {
      isValid: false,
      error: 'Username can only contain letters, numbers, underscores, and dots'
    }
  }

  // Check that it starts with a letter or number (not underscore or dot)
  if (!/^[a-zA-Z0-9]/.test(username)) {
    return {
      isValid: false,
      error: 'Username must start with a letter or number'
    }
  }

  // Check that it doesn't end with a dot or underscore
  if (/[._]$/.test(username)) {
    return {
      isValid: false,
      error: 'Username cannot end with a dot or underscore'
    }
  }

  // Check for consecutive dots or underscores
  if (/\.{2,}|_{2,}/.test(username)) {
    return {
      isValid: false,
      error: 'Username cannot contain consecutive dots or underscores'
    }
  }

  return {
    isValid: true
  }
}

export function getReservedUsernames(): string[] {
  return [...RESERVED_USERNAMES]
}

