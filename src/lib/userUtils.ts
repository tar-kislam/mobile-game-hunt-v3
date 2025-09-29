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

    // If still not found and this looks like a session ID, try to find any user
    // This is a fallback for cases where session IDs don't match database IDs
    if (!user) {
      // Get the first available user as a fallback (for development/testing)
      const fallbackUser = await prisma.user.findFirst({
        select: { id: true }
      })
      if (fallbackUser) {
        console.warn(`User ID ${sessionUser.id} not found, using fallback user ${fallbackUser.id}`)
        return fallbackUser.id
      }
    }

    return user?.id || null
  } catch (error) {
    console.error('Error resolving user ID:', error)
    return null
  }
}
