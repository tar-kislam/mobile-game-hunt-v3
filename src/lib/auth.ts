import { NextAuthOptions } from "next-auth"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import GoogleProvider from "next-auth/providers/google"
import GitHubProvider from "next-auth/providers/github"
import EmailProvider from "next-auth/providers/email"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { notify } from "@/lib/notificationService"
import { generateUniqueUsername } from "@/lib/usernameUtils"

// Build providers conditionally to avoid 500s when env vars are missing
const providers: any[] = []

if (
  process.env.EMAIL_SERVER_HOST &&
  process.env.EMAIL_SERVER_PORT &&
  process.env.EMAIL_SERVER_USER &&
  process.env.EMAIL_SERVER_PASSWORD &&
  process.env.EMAIL_FROM
) {
  providers.push(
    EmailProvider({
      server: {
        host: process.env.EMAIL_SERVER_HOST,
        port: Number(process.env.EMAIL_SERVER_PORT),
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
      },
      from: process.env.EMAIL_FROM,
    })
  )
}

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  )
}

if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  providers.push(
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    })
  )
}

providers.push(
  CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email
          }
        })

        if (!user || !user.passwordHash) {
          return null
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        )

        if (!isPasswordValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
        }
      }
    })
)

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers,
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      try {
        // Handle Google OAuth sign-in
        if (account?.provider === 'google' && profile) {
          // Check if user already exists
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email! }
          })

          // If user doesn't exist or doesn't have a username, generate one
          if (!existingUser || !existingUser.username) {
            const googleName = profile.name || user.name || user.email?.split('@')[0] || 'user'
            
            try {
              const username = await generateUniqueUsername(googleName)
              
              if (existingUser) {
                // Update existing user with username
                await prisma.user.update({
                  where: { id: existingUser.id },
                  data: { username }
                })
                console.log(`[NextAuth] Updated username for existing user ${existingUser.email}: ${username}`)
              } else {
                // For new users, the PrismaAdapter will handle user creation
                // We'll set the username in the user object so it gets saved
                ;(user as any).username = username
                console.log(`[NextAuth] Generated username for new Google user: ${username}`)
              }
            } catch (error) {
              console.error('[NextAuth] Error generating username:', error)
              // Fallback to a simple username if generation fails
              ;(user as any).username = `user-${Math.random().toString(36).substring(2, 8)}`
            }
          }
        }

        // Handle GitHub OAuth sign-in
        if (account?.provider === 'github' && profile) {
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email! }
          })

          if (!existingUser || !existingUser.username) {
            const githubProfile = profile as any // Cast to any to access GitHub-specific properties
            const githubName = githubProfile.name || githubProfile.login || user.name || user.email?.split('@')[0] || 'user'
            
            try {
              const username = await generateUniqueUsername(githubName)
              
              if (existingUser) {
                await prisma.user.update({
                  where: { id: existingUser.id },
                  data: { username }
                })
                console.log(`[NextAuth] Updated username for existing GitHub user ${existingUser.email}: ${username}`)
              } else {
                ;(user as any).username = username
                console.log(`[NextAuth] Generated username for new GitHub user: ${username}`)
              }
            } catch (error) {
              console.error('[NextAuth] Error generating username for GitHub user:', error)
              ;(user as any).username = `user-${Math.random().toString(36).substring(2, 8)}`
            }
          }
        }

        return true
      } catch (error) {
        console.error('[NextAuth] Error in signIn callback:', error)
        return true // Allow sign-in even if username generation fails
      }
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.role = (user as any).role
        token.id = user.id
        token.username = (user as any).username
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        (session.user as any).id = token.id as string || token.sub as string
        (session.user as any).role = token.role as string
        (session.user as any).username = token.username as string
        
        // Fetch fresh user data from database
        try {
          const user = await prisma.user.findUnique({
            where: { id: token.id as string || token.sub as string },
            select: { 
              id: true, 
              name: true, 
              email: true, 
              image: true, 
              username: true 
            }
          })
          
          if (user) {
            session.user.name = user.name
            session.user.email = user.email
            session.user.image = user.image
            ;(session.user as any).username = user.username
          }
        } catch (error) {
          console.error('Error fetching user data in session callback:', error)
        }
      }
      return session
    },
    async redirect({ url, baseUrl }) {
      // Always redirect to landing page after sign in/sign up
      // Handle relative URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`
      // Handle same origin URLs
      if (new URL(url).origin === baseUrl) return url
      // Always redirect to home page for OAuth callbacks
      return baseUrl
    },
  },
  events: {
    async createUser({ user }) {
      // This event is triggered when a new user is created
      // The username should already be set in the signIn callback
      console.log(`[NextAuth] New user created: ${user.email}`)
      
      // Skip badge checking during build, deployment, or any non-runtime environment
      const skipBadgeCheck = 
        process.env.NEXT_PHASE === 'phase-production-build' ||
        process.env.VERCEL_ENV === 'production' ||
        process.env.NODE_ENV === 'test' ||
        process.env.NODE_ENV === 'development' ||
        process.env.CI === 'true' ||
        process.env.VERCEL === '1'
      
      if (!skipBadgeCheck) {
        // Check for Pioneer badge eligibility when user is created
        try {
          const { checkAndAwardBadges } = await import('@/lib/badgeService')
          await checkAndAwardBadges(user.id)
        } catch (error) {
          console.error('Error checking badges on user creation:', error)
          // Don't fail user creation if badge checking fails
        }
      } else {
        console.log(`[NextAuth] Skipping badge check during ${process.env.NEXT_PHASE || process.env.VERCEL_ENV || process.env.NODE_ENV} phase for user: ${user.email}`)
      }
    },
    async signOut() {
      // Clear any additional session data if needed
      // Session is automatically cleared by NextAuth
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/signin", // Redirect to signin page on error (we'll handle it client-side with toast)
  },
}
