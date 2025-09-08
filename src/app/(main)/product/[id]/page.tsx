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
  params: Promise<{ id: string }>
}

export default async function ProductPage({ params }: ProductPageProps) {
  const resolvedParams = await params
  
  // Fetch product data
  const productData = await prisma.product.findUnique({
    where: { id: resolvedParams.id },
    select: {
      id: true,
      title: true,
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
    <div className="min-h-screen bg-background">
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
        />
      </div>
    </div>
  )
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { id } = await params
  const product = await prisma.product.findUnique({ 
    where: { id },
    select: {
      title: true,
      tagline: true,
      description: true,
      thumbnail: true,
    }
  })
  if (!product) return { title: 'Game not found' }
  const title = `${product.title} – Mobile Game Hunt`
  const description = product.tagline || product.description?.slice(0, 140) || 'Discover new mobile games'
  const url = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const ogImage = product.thumbnail || `${url}/api/og?title=${encodeURIComponent(product.title)}`
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${url}/product/${id}`,
      images: [{ url: ogImage }]
    },
    alternates: { canonical: `${url}/product/${id}` }
  }
}