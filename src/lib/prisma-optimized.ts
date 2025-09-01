import { PrismaClient } from '@prisma/client'

// Optimized Prisma configuration for production
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  // Connection pool optimization
  datasourceUrl: process.env.DATABASE_URL,
})

// Optimize for production
if (process.env.NODE_ENV === 'production') {
  // Set connection pool limits
  prisma.$connect()
}

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Database query optimization helpers
export const optimizedQueries = {
  // Get products with minimal data for listing
  getProductsList: async (page = 1, limit = 10) => {
    const skip = (page - 1) * limit
    
    return prisma.product.findMany({
      skip,
      take: limit,
      select: {
        id: true,
        title: true,
        description: true,
        image: true,
        url: true,
        createdAt: true,

        user: {
          select: {
            name: true,
            image: true,
          }
        },
        _count: {
          select: {
            votes: true,
            comments: true,
          }
        }
      },
      orderBy: [
        { createdAt: 'desc' }
      ]
    })
  },

  // Get product details with related data
  getProductDetails: async (id: string) => {
    return prisma.product.findUnique({
      where: { id },
      include: {

        user: {
          select: {
            id: true,
            name: true,
            image: true,
            role: true,
          }
        },
        votes: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
              }
            }
          }
        },
        comments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              }
            },
            replies: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    image: true,
                  }
                }
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        },
        _count: {
          select: {
            votes: true,
            comments: true,
          }
        }
      }
    })
  },

  // Get user profile with stats
  getUserProfile: async (userId: string) => {
    const [user, stats] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          role: true,
          createdAt: true,
        }
      }),
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          _count: {
            select: {
              products: true,
              votes: true,
              comments: true,
            }
          }
        }
      })
    ])

    return {
      ...user,
      stats: stats?._count
    }
  },

  // Get trending products (cached query)
  getTrendingProducts: async (limit = 5) => {
    return prisma.product.findMany({
      take: limit,
      select: {
        id: true,
        title: true,
        image: true,

        _count: {
          select: {
            votes: true,
          }
        }
      },
      orderBy: {
        votes: {
          _count: 'desc'
        }
      }
    })
  }
}

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect()
})
