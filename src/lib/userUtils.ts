import { prisma } from '@/lib/prisma'

/**
 * Resolves a user ID from session data, handling OAuth and database ID mismatches
 * @param sessionUser - The user object from NextAuth session
 * @returns The actual database user ID or null if not found
 */
export async function resolveUserId(sessionUser: any): Promise<string | null> {
  if (!sessionUser?.id) return null

  try {
    // First try to find by session ID
    let user = await prisma.user.findUnique({
      where: { id: sessionUser.id },
      select: { id: true }
    })

    // If not found by ID, try by email (common for OAuth users)
    if (!user && sessionUser.email) {
      user = await prisma.user.findUnique({
        where: { email: sessionUser.email },
        select: { id: true }
      })
    }

    // If still not found, avoid using a global fallback user in production
    // Only allow a fallback in development to ease local testing
    if (!user) {
      if (process.env.NODE_ENV === 'development') {
        const fallbackUser = await prisma.user.findFirst({
          select: { id: true }
        })
        if (fallbackUser) {
          console.warn(`[DEV ONLY] User ID ${sessionUser.id} not found, using fallback user ${fallbackUser.id}`)
          return fallbackUser.id
        }
      }
      // In production (or if no fallback found), return null so callers can handle properly
      return null
    }

    return user?.id || null
  } catch (error) {
    console.error('Error resolving user ID:', error)
    return null
  }
}
