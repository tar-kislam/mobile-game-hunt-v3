import { NextAuthOptions } from "next-auth"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import GoogleProvider from "next-auth/providers/google"
import GitHubProvider from "next-auth/providers/github"
import EmailProvider from "next-auth/providers/email"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { notify } from "@/lib/notificationService"

// Function to generate a unique username
async function generateUniqueUsername(baseUsername: string): Promise<string> {
  let username = baseUsername.toLowerCase().replace(/[^a-z0-9]/g, '')
  
  // Ensure username is not empty and starts with a letter
  if (!username || !/^[a-z]/.test(username)) {
    username = 'user' + Math.random().toString(36).substring(2, 8)
  }
  
  let finalUsername = username
  let counter = 1
  
  // Check if username exists and generate unique one
  while (true) {
    const existingUser = await prisma.user.findUnique({
      where: { username: finalUsername }
    })
    
    if (!existingUser) {
      break
    }
    
    finalUsername = `${username}-${counter}`
    counter++
  }
  
  return finalUsername
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
      // Handle OAuth providers for existing users
      if ((account?.provider === "google" || account?.provider === "github") && user.email) {
        try {
          // Check if user exists
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email }
          })
          
          // If user exists and has no username, generate one
          if (existingUser && !existingUser.username) {
            const baseUsername = user.email.split('@')[0]
            const uniqueUsername = await generateUniqueUsername(baseUsername)
            
            // Update existing user with username only (don't touch passwordHash)
            await prisma.user.update({
              where: { id: existingUser.id },
              data: { username: uniqueUsername }
            })
            
            console.log(`Generated username for existing ${account.provider} user ${user.email}: ${uniqueUsername}`)
          }
        } catch (error) {
          console.error('Error generating username for existing user:', error)
          // Don't block sign-in if username generation fails
        }
      }
      
      return true
    },
    async jwt({ token, user }) {
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
        
        // Fetch username from database
        try {
          const user = await prisma.user.findUnique({
            where: { id: token.id as string || token.sub as string },
            select: { username: true }
          })
          
          if (user) {
            (session.user as any).username = user.username
          }
        } catch (error) {
          console.error('Error fetching username for session:', error)
          // Don't block session creation if username fetch fails
        }
      }
      return session
    },
  },
  events: {
    async createUser({ user, account, profile }: any) {
      try {
        // Handle different authentication methods
        if (account?.provider === "google" && user.email && profile?.email) {
          // Google OAuth: Generate username, skip passwordHash
          const baseUsername = profile.email.split('@')[0]
          const uniqueUsername = await generateUniqueUsername(baseUsername)
          
          await prisma.user.update({
            where: { id: user.id },
            data: { 
              username: uniqueUsername,
              // Don't set passwordHash for OAuth users
            }
          })
          
          console.log(`Generated username for new Google user ${user.email}: ${uniqueUsername}`)
        } else if (account?.provider === "github" && user.email) {
          // GitHub OAuth: Generate username, skip passwordHash
          const baseUsername = user.email.split('@')[0]
          const uniqueUsername = await generateUniqueUsername(baseUsername)
          
          await prisma.user.update({
            where: { id: user.id },
            data: { 
              username: uniqueUsername,
              // Don't set passwordHash for OAuth users
            }
          })
          
          console.log(`Generated username for new GitHub user ${user.email}: ${uniqueUsername}`)
        } else if (account?.provider === "email" && user.email) {
          // Email/Magic Link: Generate username, skip passwordHash
          const baseUsername = user.email.split('@')[0]
          const uniqueUsername = await generateUniqueUsername(baseUsername)
          
          await prisma.user.update({
            where: { id: user.id },
            data: { 
              username: uniqueUsername,
              // Don't set passwordHash for magic link users
            }
          })
          
          console.log(`Generated username for new Email user ${user.email}: ${uniqueUsername}`)
        }
        // Note: Credentials provider users are handled by the custom signup API route
        // which already handles password hashing with bcrypt salt of 12
      } catch (error) {
        console.error('Error in createUser event:', error)
        // Don't block user creation if username generation fails
      }
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
}
