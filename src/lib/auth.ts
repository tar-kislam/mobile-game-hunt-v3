import { NextAuthOptions } from "next-auth"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import GoogleProvider from "next-auth/providers/google"
import GitHubProvider from "next-auth/providers/github"
import EmailProvider from "next-auth/providers/email"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { notify } from "@/lib/notificationService"

// Function to generate a pseudo-unique username without DB dependency
function generateUniqueUsername(baseUsername: string): string {
  let username = baseUsername.toLowerCase().replace(/[^a-z0-9]/g, '')
  if (!username || !/^[a-z]/.test(username)) {
    username = 'user'
  }
  // Append short random suffix to avoid collisions without querying DB
  const suffix = Math.random().toString(36).substring(2, 6)
  return `${username}-${suffix}`
}

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
      // Keep sign-in permissive; username handling is disabled due to minimal User model
      // For OAuth providers (Google, GitHub), auto-create account if new user
      return true
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.role = (user as any).role
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        (session.user as any).id = token.id as string || token.sub as string
        (session.user as any).role = token.role as string
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
      // Check for Pioneer badge eligibility when user is created
      try {
        const { checkAndAwardBadges } = await import('@/lib/badgeService')
        await checkAndAwardBadges(user.id)
      } catch (error) {
        console.error('Error checking badges on user creation:', error)
        // Don't fail user creation if badge checking fails
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
