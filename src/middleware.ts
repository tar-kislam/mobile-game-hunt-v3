import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  async function middleware(req) {
    const { pathname, origin } = req.nextUrl
    
    // Product ID redirect: /product/:id -> /product/:slug (backward compatibility)
    const productMatch = pathname.match(/^\/product\/([a-z0-9]{20,})$/)
    if (productMatch) {
      const productId = productMatch[1]
      try {
        const resp = await fetch(`${origin}/api/products/${productId}`, { headers: { accept: 'application/json' } })
        if (resp.ok) {
          const data = await resp.json()
          const slug = data?.slug
          if (slug) {
            return NextResponse.redirect(new URL(`/product/${slug}`, req.url), 301)
          }
        }
      } catch (error) {
        // ignore and continue to next
      }
    }

    // DB-backed redirect: /profile/:id/public -> /@username (compat)
    const match = pathname.match(/^\/profile\/([^/]+)\/public$/)
    if (match) {
      const id = match[1]
      try {
        const resp = await fetch(`${origin}/api/user/${id}/public`, { headers: { accept: 'application/json' } })
        if (resp.ok) {
          const data = await resp.json()
          const username = data?.user?.username
          if (username) {
            return NextResponse.redirect(new URL(`/@${username}`, req.url), 301)
          }
        }
      } catch (error) {
        // ignore and continue to next
      }
    }

    // Allow pretty handle: /@username -> serve /[username]
    const atMatch = pathname.match(/^\/@(.+)$/)
    if (atMatch) {
      const username = atMatch[1]
      // rewrite to the internal route without changing the URL
      return NextResponse.rewrite(new URL(`/${username}`, req.url))
    }

    // Legacy: single-segment cuid-like IDs -> redirect to /@username
    // Only attempt when path is a single segment without slashes and not prefixed with known routes
    const singleSeg = pathname.match(/^\/([a-z0-9]{20,})$/)
    if (singleSeg) {
      const candidateId = singleSeg[1]
      try {
        const resp = await fetch(`${origin}/api/user/${candidateId}/public`, { headers: { accept: 'application/json' } })
        if (resp.ok) {
          const data = await resp.json()
          const username = data?.user?.username
          if (username) {
            return NextResponse.redirect(new URL(`/@${username}`, req.url), 301)
          }
        }
      } catch (error) {
        // ignore
      }
    }

    // Add any additional middleware logic here
    // Token logging removed to reduce log spam
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl
        
        // Allow access to public routes
        if (
          pathname.startsWith('/auth') ||
          pathname.startsWith('/api/auth') ||
          pathname.startsWith('/api/health') ||
          pathname.startsWith('/api/categories') ||
          pathname.startsWith('/api/products') ||
          pathname.startsWith('/api/calendar') ||   // Allow calendar API
          pathname.startsWith('/api/sidebar') ||   // Allow sidebar API
          pathname.startsWith('/api/newsletter') || // Allow newsletter API
          pathname.startsWith('/api/blog') ||      // Allow blog API
          pathname.startsWith('/api/metrics') ||   // Allow metrics API for tracking
          pathname.startsWith('/api/featured-games') || // Allow featured games API
          pathname.startsWith('/api/games') ||     // Allow games search API
          pathname.startsWith('/api/user') ||
          pathname.startsWith('/product') ||       // Added product detail pages
          pathname.startsWith('/blog') ||         // Allow blog pages
          pathname.startsWith('/user/') ||        // Allow username-based profile pages
          pathname.match(/^\/[^\/]+\/public$/) || // Allow /[username]/public routes (legacy)
          pathname.match(/^\/[^\/]+$/) ||          // Allow single-segment usernames
          pathname.startsWith('/profile/') ||     // Allow old profile routes for backward compatibility
          pathname.startsWith('/uploads') ||       // Allow public uploads
          pathname.startsWith('/logo') ||          // Allow logo assets
          pathname.startsWith('/images') ||        // Allow image assets
          pathname.startsWith('/assets') ||        // Allow asset files
          pathname === '/' ||
          pathname.startsWith('/public') ||
          pathname.startsWith('/_next') ||
          pathname.startsWith('/favicon')
        ) {
          return true
        }
        
        // Require authentication for protected routes
        return !!token
      },
    },
  }
)

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (auth API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - uploads folder
     * - logo folder
     * - images folder
     * - assets folder
     * - Note: Static file extensions handled by path-based exclusions
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico|public|uploads|logo|images|assets).*)',
  ],
}
