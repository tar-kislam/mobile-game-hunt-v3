import { Metadata } from 'next';

// SEO utility functions
export function generateMetadata({
  title,
  description,
  image,
  url,
  type = 'website',
  keywords = [],
  noindex = false,
  canonical
}: {
  title: string;
  description: string;
  image?: string;
  url: string;
  type?: 'website' | 'article' | 'product';
  keywords?: string[];
  noindex?: boolean;
  canonical?: string;
}): Metadata {
  const fullTitle = title.includes('Mobile Game Hunt') ? title : `${title} | Mobile Game Hunt`;
  const fullDescription = description.length > 160 ? description.substring(0, 157) + '...' : description;
  const fullUrl = url.startsWith('http') ? url : `https://mobilegamehunt.com${url}`;
  const fullImage = image ? (image.startsWith('http') ? image : `https://mobilegamehunt.com${image}`) : 'https://mobilegamehunt.com/logo/mgh.png';

  return {
    title: fullTitle,
    description: fullDescription,
    keywords: keywords.length > 0 ? keywords.join(', ') : undefined,
    robots: noindex ? 'noindex, nofollow' : 'index, follow',
    openGraph: {
      title: fullTitle,
      description: fullDescription,
      url: fullUrl,
      siteName: 'Mobile Game Hunt',
      images: [
        {
          url: fullImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: 'en_US',
      type: type,
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description: fullDescription,
      images: [fullImage],
      creator: '@mobilegamehunt',
      site: '@mobilegamehunt',
    },
    alternates: {
      canonical: canonical || fullUrl,
    },
    other: {
      'og:image:width': '1200',
      'og:image:height': '630',
      'og:image:type': 'image/png',
    },
  };
}

// Product-specific metadata
export function generateProductMetadata(product: {
  title: string;
  description: string;
  thumbnail?: string | null;
  gallery?: string[];
  slug: string;
  platforms?: string[];
  categories?: string[];
  tags?: string[];
}) {
  const image = product.gallery?.[0] || product.thumbnail || '/logo/mgh.png';
  const keywords = [
    'mobile game',
    product.title,
    ...(product.platforms || []),
    ...(product.categories || []),
    ...(product.tags || []),
  ].filter(Boolean);

  return generateMetadata({
    title: product.title,
    description: product.description || `Discover ${product.title} - A mobile game featured on Mobile Game Hunt`,
    image,
    url: `/product/${product.slug}`,
    type: 'product',
    keywords,
  });
}

// User profile metadata
export function generateUserMetadata(user: {
  name: string;
  username: string;
  bio?: string | null;
  avatar?: string | null;
}) {
  const description = user.bio || `View ${user.name}'s profile and submitted games on Mobile Game Hunt`;
  
  return generateMetadata({
    title: `${user.name} (@${user.username})`,
    description,
    image: user.avatar || '/logo/mgh.png',
    url: `/${user.username}`,
    type: 'profile',
    keywords: [user.name, user.username, 'mobile game developer', 'game creator'],
  });
}

// Page-specific metadata
export const pageMetadata = {
  home: generateMetadata({
    title: 'Mobile Game Hunt',
    description: 'Discover and showcase the best mobile games. Find trending games, submit your own creations, and connect with the mobile gaming community.',
    url: '/',
    keywords: ['mobile games', 'game discovery', 'indie games', 'mobile gaming', 'game showcase'],
  }),
  
  products: generateMetadata({
    title: 'All Mobile Games',
    description: 'Browse our complete collection of mobile games. Filter by platform, category, and discover your next favorite game.',
    url: '/products',
    keywords: ['mobile games', 'game collection', 'browse games', 'game discovery'],
  }),
  
  leaderboard: generateMetadata({
    title: 'Leaderboard',
    description: 'See the top-rated mobile games ranked by community votes, comments, and engagement. Discover the most popular games.',
    url: '/leaderboard',
    keywords: ['top games', 'leaderboard', 'popular games', 'game rankings', 'trending games'],
  }),
  
  submit: generateMetadata({
    title: 'Submit Your Game',
    description: 'Submit your mobile game to Mobile Game Hunt. Get featured, gain visibility, and connect with the gaming community.',
    url: '/submit',
    keywords: ['submit game', 'game submission', 'indie developer', 'game promotion'],
  }),
  
  advertise: generateMetadata({
    title: 'Advertise',
    description: 'Promote your mobile game with targeted advertising on Mobile Game Hunt. Reach engaged gamers and increase downloads.',
    url: '/advertise',
    keywords: ['game advertising', 'mobile game promotion', 'game marketing', 'advertising'],
  }),
  
  notifications: generateMetadata({
    title: 'Notifications',
    description: 'Your notification center',
    url: '/notifications',
    noindex: true,
  }),
  
  dashboard: generateMetadata({
    title: 'Dashboard',
    description: 'Your personal dashboard',
    url: '/dashboard',
    noindex: true,
  }),
};
