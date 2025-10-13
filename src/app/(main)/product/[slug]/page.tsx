export const dynamic = "force-dynamic";
export const revalidate = 0;
// Removed unused Suspense import
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import dynamicImport from 'next/dynamic'
import { ChevronLeftIcon } from 'lucide-react'
import Link from 'next/link'
import { generateProductJsonLd, generateBreadcrumbJsonLd } from '@/lib/seo'

// Dynamic import for large component to improve initial load
const EnhancedProductDetail = dynamicImport(
  () => import('@/components/product/enhanced-product-detail').then(mod => ({ default: mod.EnhancedProductDetail })),
  { 
    loading: () => <div className="animate-pulse bg-gray-800 rounded-lg h-96 w-full" />,
    ssr: true
  }
)


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
      makers: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
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
    <>
      {/* Preload critical resources */}
      <link rel="preload" href="/fonts/inter.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
      <link rel="preload" href="/api/og?title=" as="image" />
      
      {/* Non-blocking structured data scripts */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateProductJsonLd(productData)),
        }}
        defer
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateBreadcrumbJsonLd([
            { name: 'Home', url: process.env.NEXT_PUBLIC_BASE_URL || 'https://mobilegamehunt.com' },
            { name: 'Games', url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://mobilegamehunt.com'}/products` },
            { name: productData.title, url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://mobilegamehunt.com'}/product/${productData.slug}` }
          ])),
        }}
        defer
      />
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
    </>
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
      categories: {
        include: {
          category: {
            select: { name: true }
          }
        }
      },
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
  
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mobilegamehunt.com'
  const productUrl = `${baseUrl}/product/${slug}`
  const ogImage = product.thumbnail || `${baseUrl}/api/og?title=${encodeURIComponent(product.title)}`
  
  // Extract tag names for SEO
  const tagNames = product.tags?.map(pt => pt.tag.name) || []
  const normalizedTags = tagNames.map(tag => 
    tag.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
  )
  
  // Build improved, keyword-rich Title (~50–60 chars)
  const rawTitle = `${product.title} – Launch Date, Features & Reviews | Mobile Game Hunt`
  // Keep within 60 chars without losing key tokens
  const title = rawTitle.length > 60 ? `${product.title} – Features & Reviews | Mobile Game Hunt`.slice(0, 60) : rawTitle
  
  // Build strict 155–160 char meta description including game title, "mobile game", and brand
  const categoryName = product.categories && product.categories.length > 0
    ? `${product.categories[0].category.name.toLowerCase()} `
    : ''

  // Derive a short summary from description
  const rawSummary = (product.description || '').replace(/\s+/g, ' ').replace(/[^\w\s,.-]/g, '').trim()
  const summaryBase = rawSummary ? rawSummary.slice(0, 90).replace(/[.,;:!\-\s]+$/, '') : 'engaging gameplay and regular updates'

  const makeDesc = (summary: string) => `Discover ${product.title}, a ${categoryName}mobile game featuring ${summary}. Explore details, reviews, and more on Mobile Game Hunt.`

  // Start with the fullest summary, then shrink until 160 max
  let description = makeDesc(summaryBase)
  if (description.length > 160) description = makeDesc(summaryBase.slice(0, 70))
  if (description.length > 160) description = makeDesc(summaryBase.slice(0, 55))
  if (description.length > 160) description = makeDesc(summaryBase.slice(0, 40))
  if (description.length > 160) description = `Discover ${product.title}, a ${categoryName}mobile game with engaging gameplay. Explore details, reviews, and more on Mobile Game Hunt.`

  // If shorter than 155, softly extend without repeating brand
  if (description.length < 155) {
    const filler = ' Compare features and release info.'
    const room = 160 - description.length
    description = description.replace('Mobile Game Hunt.', `Mobile Game Hunt.${filler.slice(0, Math.max(0, room))}`)
    if (description.length > 160) description = description.slice(0, 160)
  }
  
  // Create enhanced keywords meta tag
  const keywords = [
    product.title.toLowerCase(),
    ...tagNames.map(tag => tag.toLowerCase()),
    ...product.platforms.map(platform => platform.toLowerCase()),
    'mobile game',
    'game',
    'mobile',
    'launch date',
    'gameplay',
    'release date',
    'game details',
    'mobile gaming',
    'new game',
    'upcoming game',
    'game release'
  ].join(', ')
  
  // Create comprehensive structured data
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "VideoGame",
    "name": product.title,
    "description": product.description,
    "url": productUrl,
    "image": ogImage,
    "operatingSystem": product.platforms,
    "genre": normalizedTags,
    "applicationCategory": "Game",
    "publisher": {
      "@type": "Organization",
      "name": "Mobile Game Hunt"
    },
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD",
      "availability": "https://schema.org/InStock"
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
