"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeftIcon, MailIcon } from "lucide-react"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      // Here you would typically make an API call to send reset email
      console.log("Sending password reset email to:", email)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      setIsSubmitted(true)
    } catch (error) {
      setError("An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
          <Button variant="outline" size="sm" asChild className="rounded-2xl">
            <Link href="/auth/signin">
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back to Sign In
            </Link>
          </Button>

          <Card className="rounded-2xl shadow-soft">
            <CardHeader className="p-4 text-center">
              <div className="flex justify-center mb-4">
                <div className="h-12 w-12 bg-green-500 rounded-2xl flex items-center justify-center">
                  <MailIcon className="h-6 w-6 text-white" />
                </div>
              </div>
              <CardTitle className="text-2xl">Check your email</CardTitle>
              <CardDescription>
                We've sent a password reset link to your email address
              </CardDescription>
            </CardHeader>
            
            <CardContent className="p-4 pt-0 space-y-4">
              <div className="text-center text-sm text-muted-foreground">
                <p className="mb-4">
                  We sent a password reset link to <strong>{email}</strong>
                </p>
                <p>
                  Didn't receive the email? Check your spam folder or{" "}
                  <button 
                    onClick={() => setIsSubmitted(false)}
                    className="text-foreground font-medium hover:underline"
                  >
                    try again
                  </button>
                </p>
              </div>

              <Button asChild className="w-full rounded-2xl">
                <Link href="/auth/signin">Back to Sign In</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <Button variant="outline" size="sm" asChild className="rounded-2xl">
          <Link href="/auth/signin">
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to Sign In
          </Link>
        </Button>

        <Card className="rounded-2xl shadow-soft">
          <CardHeader className="p-4 text-center">
            <div className="flex justify-center mb-4">
              <div className="h-12 w-12 bg-primary rounded-2xl flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">MG</span>
              </div>
            </div>
            <CardTitle className="text-2xl">Reset your password</CardTitle>
            <CardDescription>
              Enter your email address and we'll send you a link to reset your password
            </CardDescription>
          </CardHeader>
          
          <CardContent className="p-4 pt-0 space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                disabled={isLoading || !email}
              >
                {isLoading ? "Sending..." : "Send Reset Link"}
              </Button>
            </form>

            <div className="text-center text-sm text-muted-foreground">
              Remember your password?{" "}
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
  )
}
