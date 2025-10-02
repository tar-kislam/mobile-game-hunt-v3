import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Enable experimental features
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons', 'framer-motion', 'three', 'ogl'],
  },

  // Skip ESLint during Vercel builds to avoid blocking deploys
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Production optimizations
  output: 'standalone',
  compress: true,
  poweredByHeader: false,

  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'ui-avatars.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.shutterstock.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'shutterstock.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'static.shutterstock.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'image.shutterstock.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.fliki.ai',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'fliki.ai',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.itemhesap.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'ar-pay.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/**',
      },
    ],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
  },

  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, max-age=0',
          },
        ],
      },
      // Performance: Cache static assets aggressively
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/fonts/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },

  // Static redirects
  async redirects() {
    return [
      {
        source: '/:username/public',
        destination: '/:username',
        permanent: true,
      },
      {
        source: '/@:username',
        destination: '/:username',
        permanent: true,
      },
      // Remove blog feature: ensure any old /blog routes go home
      { source: '/blog', destination: '/', permanent: true },
      { source: '/blog/:slug*', destination: '/', permanent: true },
    ]
  },

  // Performance optimizations
  webpack: (config, { dev, isServer }) => {
    // Optimize bundle size in production
    if (!dev && !isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        '@/components/ui': require('path').resolve(__dirname, 'src/components/ui'),
      };
    }
    
    return config;
  },

  // Enable static optimization
  trailingSlash: false,
  generateEtags: false,

  // Logging - Reduce verbosity in development
  logging: {
    fetches: {
      fullUrl: false,
    },
  },

  // Silence workspace root inference in local nested workspaces/monorepos
  outputFileTracingRoot: path.join(__dirname),
};

export default nextConfig;
