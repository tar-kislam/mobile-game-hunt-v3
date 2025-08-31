"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SubmitGameModal } from "@/components/games/submit-game-modal"
import { ArrowLeftIcon, GamepadIcon, TrophyIcon, UsersIcon, InfoIcon } from "lucide-react"

export default function SubmitPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const handleGameSubmitted = () => {
    // Redirect to home page after successful submission
    router.push('/')
  }

  // Loading state
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // Unauthenticated state
  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md rounded-2xl shadow-soft">
          <CardHeader className="p-4 text-center">
            <CardTitle>Authentication Required</CardTitle>
            <p className="text-muted-foreground">
              You need to be signed in to submit a game
            </p>
          </CardHeader>
          <CardContent className="p-4 pt-0 space-y-3">
            <Button asChild className="w-full rounded-2xl">
              <Link href="/auth/signin">Sign In</Link>
            </Button>
            <Button variant="outline" asChild className="w-full rounded-2xl">
              <Link href="/auth/signup">Create Account</Link>
            </Button>
            <Button variant="ghost" asChild className="w-full rounded-2xl">
              <Link href="/">
                <ArrowLeftIcon className="w-4 h-4 mr-2" />
                Back to Home
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="outline" asChild className="rounded-2xl">
              <Link href="/">
                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                Back to Home
              </Link>
            </Button>
          </div>
          
          <div className="text-center space-y-4 mb-12">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              Submit Your Game
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Share your amazing mobile game with our gaming community and get discovered by thousands of players.
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Card className="rounded-2xl shadow-soft p-8">
              <div className="text-center space-y-6">
                <div className="flex justify-center">
                  <div className="h-20 w-20 bg-orange-100 rounded-2xl flex items-center justify-center">
                    <GamepadIcon className="h-10 w-10 text-orange-600" />
                  </div>
                </div>
                
                <div>
                  <h2 className="text-2xl font-bold mb-2">Ready to Submit Your Game?</h2>
                  <p className="text-gray-600 mb-6">
                    Click the button below to open our submission form and share your game with the community.
                  </p>
                </div>

                <SubmitGameModal onGameSubmitted={handleGameSubmitted}>
                  <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white rounded-2xl shadow-soft px-8 py-4 text-lg">
                    <GamepadIcon className="w-5 h-5 mr-2" />
                    Submit Your Game
                  </Button>
                </SubmitGameModal>

                <div className="pt-6 border-t">
                  <p className="text-sm text-gray-500">
                    By submitting your game, you agree to our community guidelines and terms of service.
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* User Info */}
            <Card className="rounded-2xl shadow-soft">
              <CardHeader className="p-4">
                <CardTitle className="flex items-center gap-2">
                  <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <UsersIcon className="h-4 w-4 text-blue-600" />
                  </div>
                  Submitting as
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 bg-gradient-to-br from-purple-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                    {session?.user?.name?.[0]?.toUpperCase() || "U"}
                  </div>
                  <div>
                    <p className="font-medium">{session?.user?.name}</p>
                    <p className="text-sm text-muted-foreground">{session?.user?.email}</p>
                    {session?.user?.role === "ADMIN" && (
                      <span className="inline-block bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full mt-1">
                        Admin
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Guidelines */}
            <Card className="rounded-2xl shadow-soft">
              <CardHeader className="p-4">
                <CardTitle className="flex items-center gap-2">
                  <div className="h-8 w-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <InfoIcon className="h-4 w-4 text-green-600" />
                  </div>
                  Submission Guidelines
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0 space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <div className="h-2 w-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p>Make sure your game is mobile-focused and available on iOS or Android</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-2 w-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p>Provide a clear and engaging description of your game</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-2 w-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p>Include high-quality screenshots or promotional images</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-2 w-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p>Choose the most appropriate category for better discoverability</p>
                </div>
              </CardContent>
            </Card>

            {/* Community Stats */}
            <Card className="rounded-2xl shadow-soft">
              <CardHeader className="p-4">
                <CardTitle className="flex items-center gap-2">
                  <div className="h-8 w-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <TrophyIcon className="h-4 w-4 text-purple-600" />
                  </div>
                  Community Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Games Submitted</span>
                  <span className="font-bold text-lg">1,247</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Active Users</span>
                  <span className="font-bold text-lg">3,892</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total Votes</span>
                  <span className="font-bold text-lg">15,634</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}