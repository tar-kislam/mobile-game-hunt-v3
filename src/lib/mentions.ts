import { prisma } from '@/lib/prisma'

/**
 * Parse @username mentions from text
 * Returns an array of unique usernames (without the @ symbol)
 */
export function parseMentions(text: string): string[] {
  // Match @username pattern (alphanumeric, underscore, hyphen, min 1 char, max 30 chars)
  const mentionRegex = /@([a-zA-Z0-9_-]{1,30})/g
  const matches = text.matchAll(mentionRegex)
  const usernames = Array.from(matches, (match) => match[1].toLowerCase())
  
  // Return unique usernames
  return [...new Set(usernames)]
}

/**
 * Resolve usernames to user IDs
 * Returns a map of username -> userId
 */
export async function resolveMentions(usernames: string[]): Promise<Map<string, string>> {
  if (usernames.length === 0) {
    return new Map()
  }

  const users = await prisma.user.findMany({
    where: {
      username: {
        in: usernames,
        mode: 'insensitive',
      },
    },
    select: {
      id: true,
      username: true,
    },
  })

  const mentionMap = new Map<string, string>()
  for (const user of users) {
    if (user.username) {
      mentionMap.set(user.username.toLowerCase(), user.id)
    }
  }

  return mentionMap
}

/**
 * Highlight mentions in text for display
 * Returns JSX-ready string with mention spans
 */
export function highlightMentions(text: string): string {
  const mentionRegex = /@([a-zA-Z0-9_-]{1,30})/g
  return text.replace(mentionRegex, '<span class="mention">@$1</span>')
}

/**
 * Extract and resolve all mentions from comment content
 * Returns array of user IDs that were mentioned
 */
export async function extractAndResolveMentions(content: string): Promise<string[]> {
  const usernames = parseMentions(content)
  if (usernames.length === 0) {
    return []
  }

  const mentionMap = await resolveMentions(usernames)
  return Array.from(mentionMap.values())
}











