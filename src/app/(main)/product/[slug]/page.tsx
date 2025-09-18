import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { EnhancedProductDetail } from '@/components/product/enhanced-product-detail'
import { ChevronLeftIcon } from 'lucide-react'
import Link from 'next/link'

interface ProductPageProps {
  params: Promise<{ slug: string }>
}

export default async function ProductPage({ params }: ProductPageProps) {
  const resolvedParams = await params
  
  // Fetch product data by slug
  const productData = await prisma.product.findUnique({
    where: { slug: resolvedParams.slug },
    select: {
      id: true,
      title: true,
      slug: true,
      tagline: true,
      description: true,
      url: true,
      iosUrl: true,
      androidUrl: true,
      thumbnail: true,
      gallery: true,
      images: true,
      youtubeUrl: true,
      gameplayGifUrl: true,
      demoUrl: true,
      socialLinks: true,
      platforms: true,
      countries: true,
      languages: true,
      releaseAt: true,
      studioName: true,
      launchType: true,
      launchDate: true,
      monetization: true,
      engine: true,
      status: true,
      pricing: true,
      promoOffer: true,
      promoCode: true,
      promoExpiry: true,
      playtestQuota: true,
      playtestExpiry: true,
      sponsorRequest: true,
      sponsorNote: true,
      crowdfundingPledge: true,
      gamificationTags: true,
      createdAt: true,
      updatedAt: true,
      clicks: true,
      follows: true,
      user: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
      categories: {
        include: {
          category: {
            select: {
              id: true,
              name: true,
            }
          }
        }
      },
      tags: {
        include: {
          tag: {
            select: {
              id: true,
              name: true,
              slug: true
            }
          }
        }
      },
      _count: {
        select: {
          votes: true,
          comments: true,
        },
      },
    },
  })

  if (!productData) {
    notFound()
  }

  // Convert Date objects to strings for the component
  const product = {
    ...productData,
    url: productData.url || '',
    createdAt: productData.createdAt.toISOString(),
    updatedAt: productData.updatedAt.toISOString(),
    releaseAt: productData.releaseAt?.toISOString() || null,
    launchDate: productData.launchDate?.toISOString() || null,
    promoExpiry: productData.promoExpiry?.toISOString() || null,
    playtestExpiry: productData.playtestExpiry?.toISOString() || null,
    languages: productData.languages ? (typeof productData.languages === 'string' ? JSON.parse(productData.languages) : productData.languages) : null,
  }

  // Get session for vote status
  const session = await getServerSession(authOptions)
  
  let hasVoted = false
  if (session?.user?.id) {
    const vote = await prisma.vote.findFirst({
      where: {
        productId: product.id,
        userId: session.user.id,
      },
    })
    hasVoted = !!vote
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-[#121225] to-[#050509] bg-[radial-gradient(80%_80%_at_0%_0%,rgba(124,58,237,0.22),transparent_60%),radial-gradient(80%_80%_at_100%_100%,rgba(6,182,212,0.18),transparent_60%)]">
      <div className="container mx-auto px-4 py-6">
        {/* Back Navigation */}
        <div className="mb-6">
          <Link 
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeftIcon className="w-4 h-4" />
            Back to games
          </Link>
        </div>

        <EnhancedProductDetail 
          product={product}
          hasVoted={hasVoted}
          session={session}
        />
      </div>
    </div>
  )
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params
  const product = await prisma.product.findUnique({ 
    where: { slug },
    select: {
      title: true,
      tagline: true,
      description: true,
      thumbnail: true,
      platforms: true,
      tags: {
        include: {
          tag: {
            select: {
              name: true,
              slug: true
            }
          }
        }
      }
    }
  })
  
  if (!product) return { title: 'Game not found' }
  
  const url = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const productUrl = `${url}/product/${slug}`
  const ogImage = product.thumbnail || `${url}/api/og?title=${encodeURIComponent(product.title)}`
  
  // Extract tag names for SEO
  const tagNames = product.tags?.map(pt => pt.tag.name) || []
  const normalizedTags = tagNames.map(tag => 
    tag.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
  )
  
  // Create SEO-friendly title
  const title = `${product.title} – Mobile Game Hunt`
  
  // Create enhanced description with tags
  const baseDescription = product.tagline || product.description?.slice(0, 120) || 'Discover new mobile games'
  const tagsText = tagNames.length > 0 ? ` Tags: ${tagNames.join(', ')}.` : ''
  const description = `${baseDescription}${tagsText}`
  
  // Create keywords meta tag
  const keywords = [
    product.title.toLowerCase(),
    ...tagNames.map(tag => tag.toLowerCase()),
    ...product.platforms.map(platform => platform.toLowerCase()),
    'mobile game',
    'game',
    'mobile'
  ].join(', ')
  
  // Create structured data
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "VideoGame",
    "name": product.title,
    "description": product.description,
    "url": productUrl,
    "image": ogImage,
    "operatingSystem": product.platforms,
    "genre": normalizedTags,
    "publisher": {
      "@type": "Organization",
      "name": "Mobile Game Hunt"
    }
  }
  
  return {
    title,
    description,
    keywords,
    openGraph: {
      title,
      description,
      url: productUrl,
      images: [{ url: ogImage }],
      type: 'website',
      siteName: 'Mobile Game Hunt',
      ...(tagNames.length > 0 && {
        article: {
          tags: tagNames
        }
      })
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage]
    },
    alternates: { 
      canonical: productUrl 
    },
    other: {
      'article:tag': tagNames.join(','),
      'application/ld+json': JSON.stringify(structuredData)
    }
  }
}
