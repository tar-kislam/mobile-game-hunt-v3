import { withAuth } from "next-auth/middleware"

export default withAuth(
  function middleware(req) {
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
          pathname.startsWith('/api/metrics') ||   // Allow metrics API for tracking
          pathname.startsWith('/api/featured-games') || // Allow featured games API
          pathname.startsWith('/api/user') ||
          pathname.startsWith('/product') ||       // Added product detail pages
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
