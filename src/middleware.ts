import { withAuth } from "next-auth/middleware"

export default withAuth(
  function middleware(req) {
    // Add any additional middleware logic here
    console.log("Token:", req.nextauth.token)
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
          pathname.startsWith('/api/user') ||
          pathname.startsWith('/product') ||       // Added product detail pages
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
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico|public).*)',
  ],
}
