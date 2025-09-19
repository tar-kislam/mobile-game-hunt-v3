import { Metadata } from 'next'

export interface SEOConfig {
  title: string
  description: string
  canonical?: string
  noindex?: boolean
  ogImage?: string
  ogType?: 'website' | 'article' | 'product'
  jsonLd?: any
}

export function generateMetadata(config: SEOConfig): Metadata {
  const {
    title,
    description,
    canonical,
    noindex,
    ogImage,
    ogType = 'website',
    jsonLd
  } = config

  const metadata: Metadata = {
    title: `${title} | Mobile Game Hunt`,
    description: description.slice(0, 160), // Ensure 150-160 chars
    robots: noindex ? 'noindex,nofollow' : 'index,follow',
    openGraph: {
      title: `${title} | Mobile Game Hunt`,
      description: description.slice(0, 160),
      type: ogType,
      images: ogImage ? [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title
        }
      ] : undefined,
      siteName: 'Mobile Game Hunt'
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | Mobile Game Hunt`,
      description: description.slice(0, 160),
      images: ogImage ? [ogImage] : undefined
    },
    alternates: canonical ? {
      canonical: canonical
    } : undefined
  }

  return metadata
}

export function generateProductJsonLd(product: any) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.title,
    "description": product.description,
    "image": product.thumbnail || product.gallery?.[0],
    "url": `${process.env.NEXT_PUBLIC_BASE_URL}/product/${product.slug}`,
    "brand": {
      "@type": "Brand",
      "name": product.studio || "Mobile Game Hunt"
    },
    "category": product.categories?.join(', '),
    "operatingSystem": product.platforms?.join(', '),
    "datePublished": product.createdAt,
    "author": {
      "@type": "Person",
      "name": product.user?.name || product.user?.username
    }
  }
}

export function generateOrganizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Mobile Game Hunt",
    "url": process.env.NEXT_PUBLIC_BASE_URL,
    "logo": `${process.env.NEXT_PUBLIC_BASE_URL}/logo/mgh.png`,
    "description": "Discover and share the best mobile games and apps. Connect with developers and gamers worldwide.",
    "sameAs": [
      "https://twitter.com/mobilegamehunt",
      "https://instagram.com/mobilegamehunt"
    ]
  }
}

export function generateBreadcrumbJsonLd(items: Array<{name: string, url: string}>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url
    }))
  }
}
