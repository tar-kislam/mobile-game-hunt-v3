import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')

    if (!query || query.trim().length === 0) {
      return NextResponse.json({
        posts: [],
        keywords: [],
        products: []
      })
    }

    const searchTerm = query.trim()

    // Search posts by content (case-insensitive)
    const posts = await prisma.post.findMany({
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
      take: 10
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
      return post.hashtags.some((hashtag: string) => 
        hashtag.toLowerCase().includes(searchTerm.toLowerCase()) || 
        hashtag.toLowerCase().includes(`#${searchTerm.toLowerCase()}`)
      )
    })

    // Combine and deduplicate posts
    const allPosts = [...posts, ...hashtagFilteredPosts]
    const uniquePosts = allPosts.filter((post, index, self) => 
      index === self.findIndex(p => p.id === post.id)
    )

    // Search for distinct hashtags that contain the search term
    const allPostsForHashtags = await prisma.post.findMany({
      select: {
        hashtags: true,
      },
      where: {
        hashtags: {
          not: null
        }
      }
    })

    const hashtagCounts: Record<string, number> = {}
    allPostsForHashtags.forEach(post => {
      if (post.hashtags && Array.isArray(post.hashtags)) {
        post.hashtags.forEach((hashtag: string) => {
          if (typeof hashtag === 'string' && hashtag.trim()) {
            const cleanHashtag = hashtag.trim().toLowerCase()
            if (cleanHashtag.includes(searchTerm.toLowerCase()) || cleanHashtag.includes(`#${searchTerm.toLowerCase()}`)) {
              hashtagCounts[cleanHashtag] = (hashtagCounts[cleanHashtag] || 0) + 1
            }
          }
        })
      }
    })

    const keywords = Object.entries(hashtagCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([tag]) => `#${tag}`)

    // Search products by title (case-insensitive)
    const products = await prisma.product.findMany({
      where: {
        title: {
          contains: searchTerm,
          mode: 'insensitive'
        }
      },
      select: {
        id: true,
        title: true,
        tagline: true,
        thumbnail: true,
        image: true,
        platforms: true,
        _count: {
          select: {
            votes: true,
            comments: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 5
    })

    return NextResponse.json({
      posts: uniquePosts,
      keywords,
      products
    })

  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json(
      { error: 'Failed to search' },
      { status: 500 }
    )
  }
}
