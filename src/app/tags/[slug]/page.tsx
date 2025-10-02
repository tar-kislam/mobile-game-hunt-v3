export const dynamic = "force-dynamic";
export const revalidate = 0;
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowLeftIcon, Star, MessageCircle, Eye } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { PlatformIcons } from '@/components/ui/platform-icons'

interface TagPageProps {
  params: Promise<{ slug: string }>
}

export default async function TagPage({ params }: TagPageProps) {
  const { slug } = await params
  
  // Fetch tag and products with this tag
  const tag = await prisma.tag.findUnique({
    where: { slug },
    include: {
      products: {
        include: {
          product: {
            select: {
              id: true,
              title: true,
              slug: true,
              tagline: true,
              description: true,
              thumbnail: true,
              image: true,
              platforms: true,
              createdAt: true,
              clicks: true,
              user: {
                select: {
                  id: true,
                  name: true,
                  image: true,
                  role: true,
                },
              },
              _count: {
                select: {
                  votes: true,
                  comments: true,
                },
              },
            }
          }
        }
      }
    }
  })

  if (!tag) {
    notFound()
  }

  const products = tag.products.map(pt => pt.product)

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        {/* Back Navigation */}
        <div className="mb-6">
          <Link 
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Back to games
          </Link>
        </div>

        {/* Tag Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Badge variant="secondary" className="text-lg px-4 py-2">
              {tag.name}
            </Badge>
            <span className="text-muted-foreground">
              {products.length} {products.length === 1 ? 'game' : 'games'}
            </span>
          </div>
          <h1 className="text-3xl font-bold">Games tagged with "{tag.name}"</h1>
          <p className="text-muted-foreground mt-2">
            Discover all games that have been tagged with "{tag.name}"
          </p>
        </div>

        {/* Products Grid */}
        {products.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <Link key={product.id} href={`/product/${product.slug}`}>
                <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 border border-white/10 shadow-lg rounded-xl hover:scale-[1.02] group">
                  {/* Product Image */}
                  <div className="relative aspect-square bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                    {product.thumbnail || product.image ? (
                      <Image
                        src={product.thumbnail || product.image || ''}
                        alt={product.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-400">
                        <span className="text-4xl">🎮</span>
                      </div>
                    )}
                  </div>

                  <CardContent className="p-4">
                    <div className="space-y-3">
                      {/* Title and Tagline */}
                      <div>
                        <h3 className="font-semibold text-lg line-clamp-1">{product.title}</h3>
                        {product.tagline && (
                          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                            {product.tagline}
                          </p>
                        )}
                      </div>

                      {/* Platforms */}
                      {product.platforms && product.platforms.length > 0 && (
                        <div className="flex items-center gap-2">
                          <PlatformIcons platforms={product.platforms} size="sm" />
                        </div>
                      )}

                      {/* Stats */}
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4" />
                          <span>{product._count.votes}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageCircle className="w-4 h-4" />
                          <span>{product._count.comments}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          <span>{product.clicks}</span>
                        </div>
                      </div>

                      {/* Author */}
                      {product.user && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>by {product.user.role === 'ADMIN' ? 'MobileGameHunt' : (product.user.name || 'Anonymous')}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card className="p-8 text-center">
            <div className="space-y-4">
              <div className="text-6xl">🏷️</div>
              <h3 className="text-xl font-semibold">No games found</h3>
              <p className="text-muted-foreground">
                No games have been tagged with "{tag.name}" yet.
              </p>
              <Link href="/submit">
                <Button>Submit a Game</Button>
              </Link>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}

export async function generateMetadata({ params }: TagPageProps): Promise<Metadata> {
  const { slug } = await params
  const tag = await prisma.tag.findUnique({
    where: { slug },
    select: {
      name: true,
      _count: {
        select: {
          products: true
        }
      }
    }
  })

  if (!tag) return { title: 'Tag not found' }

  const title = `${tag.name} Games – Mobile Game Hunt`
  const description = `Discover ${tag._count.products} games tagged with "${tag.name}" on Mobile Game Hunt. Find the best mobile games in this category.`
  const url = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${url}/tags/${slug}`,
      type: 'website',
      siteName: 'Mobile Game Hunt'
    },
    twitter: {
      card: 'summary',
      title,
      description
    },
    alternates: { 
      canonical: `${url}/tags/${slug}` 
    }
  }
}
