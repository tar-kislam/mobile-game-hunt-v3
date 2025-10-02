"use client"

import { useState, useEffect } from "react"
import { signIn } from "next-auth/react"
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

export default function SignUpPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [error, setError] = useState("")

  // Handle OAuth errors from URL params
  useEffect(() => {
    const error = searchParams.get('error')
    if (error) {
      let errorMessage = "Authentication failed. Please try again."
      
      switch (error) {
        case 'OAuthSignin':
          errorMessage = "Error constructing OAuth signup URL. Please try again."
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
          errorMessage = "Invalid credentials."
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

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      setIsLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters")
      setIsLoading(false)
      return
    }

    if (formData.username.length < 3) {
      setError("Username must be at least 3 characters")
      setIsLoading(false)
      return
    }

    if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      setError("Username can only contain letters, numbers, and underscores")
      setIsLoading(false)
      return
    }

    try {
      // Create user via API
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          username: formData.username,
          email: formData.email,
          password: formData.password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to create account')
        return
      }

      // After successful registration, sign them in
      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      })

      if (result?.error) {
        setError("Account created but sign in failed. Please try signing in manually.")
      } else {
        router.push("/")
        router.refresh()
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

        {/* Sign Up Card */}
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
            <CardTitle className="text-2xl">Create your account</CardTitle>
            <CardDescription>
              Join the Mobile Game Hunt community
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
                  Or create account with email
                </span>
              </div>
            </div>

            {/* Registration Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="rounded-2xl border-border focus:ring-2 focus:ring-ring"
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Choose a username"
                  value={formData.username}
                  onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') }))}
                  className="rounded-2xl border-border focus:ring-2 focus:ring-ring"
                  required
                  disabled={isLoading}
                  minLength={3}
                  maxLength={20}
                />
                <p className="text-xs text-muted-foreground">
                  Only letters, numbers, and underscores allowed
                </p>
              </div>

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
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  className="rounded-2xl border-border focus:ring-2 focus:ring-ring"
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
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
                {isLoading ? "Creating account..." : "Create Account"}
              </Button>
            </form>

            <div className="text-xs text-muted-foreground text-center">
              By creating an account, you agree to our{" "}
              <Link href="/terms" className="underline hover:text-foreground">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="underline hover:text-foreground">
                Privacy Policy
              </Link>
            </div>

            <Separator />

            <div className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link 
                href="/auth/signin" 
                className="text-foreground font-medium hover:underline"
              >
                Sign in
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
      </div>
    </div>
  )
}
