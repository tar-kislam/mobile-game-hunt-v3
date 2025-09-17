import { prisma } from './prisma'

export async function getUserByUsername(username: string) {
  if (!username) return null
  return prisma.user.findUnique({
    where: { username },
  })
}

export async function getPublicUserByUsername(username: string) {
  if (!username) return null
  return prisma.user.findUnique({
    where: { username },
    select: {
      id: true,
      name: true,
      username: true,
      image: true,
      createdAt: true,
    }
  })
}


