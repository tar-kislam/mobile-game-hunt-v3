import { prisma } from "@/lib/prisma"

/**
 * Generates a unique username from a given name
 * @param name - The full name from Google profile
 * @returns A unique username
 */
export async function generateUniqueUsername(name: string): Promise<string> {
  if (!name || typeof name !== 'string') {
    throw new Error('Name is required and must be a string')
  }

  // Convert to lowercase and replace spaces with hyphens
  let baseUsername = name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/[^a-z0-9-]/g, '') // Remove special characters except hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-|-$/g, '') // Remove leading/trailing hyphens

  // Ensure username starts with a letter
  if (!baseUsername || !/^[a-z]/.test(baseUsername)) {
    baseUsername = 'user'
  }

  // Check if base username is available
  const existingUser = await prisma.user.findUnique({
    where: { username: baseUsername }
  })

  if (!existingUser) {
    return baseUsername
  }

  // If username exists, append random 4-digit number
  let counter = 1
  let username: string
  let isUnique = false

  while (!isUnique && counter < 10000) {
    // Generate 4-digit number
    const randomSuffix = Math.floor(Math.random() * 9000) + 1000
    username = `${baseUsername}-${randomSuffix}`

    const existingUserWithSuffix = await prisma.user.findUnique({
      where: { username }
    })

    if (!existingUserWithSuffix) {
      isUnique = true
      return username
    }

    counter++
  }

  // Fallback: use timestamp if we can't find a unique username
  const timestamp = Date.now().toString().slice(-4)
  return `${baseUsername}-${timestamp}`
}

/**
 * Validates if a username is available
 * @param username - The username to check
 * @returns Promise<boolean> - true if available, false if taken
 */
export async function isUsernameAvailable(username: string): Promise<boolean> {
  if (!username || typeof username !== 'string') {
    return false
  }

  const existingUser = await prisma.user.findUnique({
    where: { username }
  })

  return !existingUser
}

/**
 * Sanitizes a username to meet our requirements
 * @param username - The username to sanitize
 * @returns Sanitized username
 */
export function sanitizeUsername(username: string): string {
  if (!username || typeof username !== 'string') {
    return 'user'
  }

  return username
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/[^a-z0-9-]/g, '') // Remove special characters except hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
    .substring(0, 30) // Limit length to 30 characters
}
