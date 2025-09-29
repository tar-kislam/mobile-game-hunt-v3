import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')

    if (!query || query.trim().length === 0) {
      return NextResponse.json({
        posts: []
      })
    }

    const searchTerm = query.trim()

    // Search posts by content (case-insensitive)
    const contentPosts = await prisma.post.findMany({
      where: {
        content: {
          contains: searchTerm,
          mode: 'insensitive'
        }
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
          }
        },
        likes: true,
        comments: {
          select: {
            id: true,
          }
        },
        poll: {
          include: {
            options: {
              include: {
                _count: {
                  select: { votes: true }
                }
              }
            }
          }
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 20
    })

    // Search posts by user name (case-insensitive)
    const userPosts = await prisma.post.findMany({
      where: {
        user: {
          OR: [
            {
              name: {
                contains: searchTerm,
                mode: 'insensitive'
              }
            },
            {
              username: {
                contains: searchTerm,
                mode: 'insensitive'
              }
            }
          ]
        }
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
          }
        },
        likes: true,
        comments: {
          select: {
            id: true,
          }
        },
        poll: {
          include: {
            options: {
              include: {
                _count: {
                  select: { votes: true }
                }
              }
            }
          }
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 20
    })

    // Also search posts by hashtags (manual filtering since Prisma doesn't support JSON array search)
    const hashtagPosts = await prisma.post.findMany({
      where: {
        hashtags: {
          not: Prisma.JsonNull
        }
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
          }
        },
        likes: true,
        comments: {
          select: {
            id: true,
          }
        },
        poll: {
          include: {
            options: {
              include: {
                _count: {
                  select: { votes: true }
                }
              }
            }
          }
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 20
    })

    // Filter posts by hashtags manually
    const hashtagFilteredPosts = hashtagPosts.filter(post => {
      if (!post.hashtags || !Array.isArray(post.hashtags)) return false
      return post.hashtags.some((hashtag) => 
        typeof hashtag === 'string' && (
          hashtag.toLowerCase().includes(searchTerm.toLowerCase()) || 
          hashtag.toLowerCase().includes(`#${searchTerm.toLowerCase()}`)
        )
      )
    })

    // Combine and deduplicate posts
    const allPosts = [...contentPosts, ...userPosts, ...hashtagFilteredPosts]
    const uniquePosts = allPosts.filter((post, index, self) => 
      index === self.findIndex(p => p.id === post.id)
    )

    return NextResponse.json({
      posts: uniquePosts
    })

  } catch (error) {
    console.error('Community search error:', error)
    return NextResponse.json(
      { error: 'Failed to search posts' },
      { status: 500 }
    )
  }
}