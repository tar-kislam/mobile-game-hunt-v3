"use client"

import { useState, useEffect, Suspense } from "react"
import { signIn, getSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { ArrowLeftIcon, GithubIcon, MailIcon } from "lucide-react"
import DarkVeil from "@/components/DarkVeil"
import { toast } from "sonner"

function SignInForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [error, setError] = useState("")

  // Handle OAuth errors from URL params
  useEffect(() => {
    const error = searchParams.get('error')
    if (error) {
      let errorMessage = "Authentication failed. Please try again."
      
      switch (error) {
        case 'OAuthSignin':
          errorMessage = "Error constructing OAuth signin URL. Please try again."
          break
        case 'OAuthCallback':
          errorMessage = "Error handling OAuth callback. Please try again."
          break
        case 'OAuthCreateAccount':
          errorMessage = "Could not create account. Please try again or use a different method."
          break
        case 'EmailCreateAccount':
          errorMessage = "Could not create account with this email. Please try again."
          break
        case 'Callback':
          errorMessage = "Authentication callback error. Please try again."
          break
        case 'OAuthAccountNotLinked':
          errorMessage = "This email is already registered with a different sign-in method. Please use your original sign-in method."
          break
        case 'EmailSignin':
          errorMessage = "Error sending verification email. Please try again."
          break
        case 'CredentialsSignin':
          errorMessage = "Invalid email or password."
          break
        case 'SessionRequired':
          errorMessage = "Please sign in to access this page."
          break
        default:
          errorMessage = `Authentication error: ${error}`
      }
      
      toast.error(errorMessage)
      
      // Clean up URL without refreshing the page
      const url = new URL(window.location.href)
      url.searchParams.delete('error')
      window.history.replaceState({}, '', url.toString())
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      })

      if (result?.error) {
        setError("Invalid email or password")
      } else {
        // Check if the sign in was successful
        const session = await getSession()
        if (session) {
          router.push("/")
          router.refresh()
        }
      }
    } catch (error) {
      setError("An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleOAuthSignIn = async (provider: string) => {
    setIsLoading(true)
    try {
      await signIn(provider, { callbackUrl: "/" })
    } catch (error) {
      setError("An error occurred. Please try again.")
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full relative">
      <DarkVeil />
      {/* Back Button - top-left, outside the card */}
      <div className="absolute top-4 left-4 z-50">
        <Button variant="outline" size="sm" asChild className="rounded-2xl">
          <Link href="/">
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
        </Button>
      </div>

      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">

        {/* Sign In Card */}
        <Card className="rounded-2xl shadow-soft">
          <CardHeader className="p-4 text-center">
            <div className="flex justify-center mb-4">
              <Image
                src="/logo/mgh.png"
                alt="Mobile Game Hunt"
                width={64}
                height={64}
                className="h-16 w-16 rounded-2xl object-contain"
                priority
              />
            </div>
            <CardTitle className="text-2xl">Welcome back</CardTitle>
            <CardDescription>
              Sign in to your Mobile Game Hunt account
            </CardDescription>
          </CardHeader>
          
          <CardContent className="p-4 pt-0 space-y-4">
            {/* OAuth Buttons */}
            <div className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full rounded-2xl" 
                onClick={() => handleOAuthSignIn("google")}
                disabled={isLoading}
              >
                <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </Button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with email
                </span>
              </div>
            </div>

            {/* Email Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="rounded-2xl border-border focus:ring-2 focus:ring-ring"
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  className="rounded-2xl border-border focus:ring-2 focus:ring-ring"
                  required
                  disabled={isLoading}
                />
              </div>

              {error && (
                <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 p-3 rounded-2xl">
                  {error}
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full rounded-2xl shadow-soft"
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            <div className="text-center text-sm">
              <Link 
                href="/auth/forgot-password" 
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Forgot your password?
              </Link>
            </div>

            <Separator />

            <div className="text-center text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link 
                href="/auth/signup" 
                className="text-foreground font-medium hover:underline"
              >
                Sign up
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
      </div>
    </div>
  )
}

export default function SignInPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen w-full relative">
        <DarkVeil />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-white">Loading...</div>
        </div>
      </div>
    }>
      <SignInForm />
    </Suspense>
  )
}
