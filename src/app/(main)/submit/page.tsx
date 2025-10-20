"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeftIcon } from "lucide-react"
import NewSubmitPage from "@/app/submit/new/page"
import { useEffect, useState } from "react"
import { CardDescription } from "@/components/ui/card"

export default function SubmitPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [submissions, setSubmissions] = useState<Array<{id:string; title:string; status:string; createdAt:string; slug?:string}>>([])

  const handleGameSubmitted = () => {
    // Redirect to home page after successful submission
    router.push('/')
  }

  useEffect(() => {
    const load = async () => {
      try {
        if (!session?.user?.email) return
        const res = await fetch(`/api/user?email=${encodeURIComponent(session.user.email)}`, { cache: 'no-store' })
        if (!res.ok) return
        const me = await res.json()
        if (!me?.id) return
        const list = await fetch(`/api/products?userId=${me.id}`, { cache: 'no-store' })
        const data = await list.json()
        const items = Array.isArray(data?.items) ? data.items : Array.isArray(data) ? data : []
        setSubmissions(items.map((p:any)=>({ id: p.id, title: p.title, status: p.status, createdAt: p.createdAt, slug: p.slug })))
      } catch {}
    }
    load()
  }, [session?.user?.email ?? ''])

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
        <Card className="w-full max-w-md rounded-2xl shadow-lg border-white/10">
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
    <div className="min-h-screen bg-gradient-to-br from-black via-[#121225] to-[#050509] bg-[radial-gradient(80%_80%_at_0%_0%,rgba(124,58,237,0.22),transparent_60%),radial-gradient(80%_80%_at_100%_100%,rgba(6,182,212,0.18),transparent_60%)]">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button variant="outline" asChild className="rounded-2xl">
            <Link href="/">
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
          </Button>
        </div>
        <div className="mb-8">
        </div>

        {submissions.length > 0 && (
          <Card className="rounded-2xl shadow-soft mb-8">
            <CardHeader>
              <CardTitle className="text-lg">Your submissions</CardTitle>
              <CardDescription>Drafts and published games</CardDescription>
            </CardHeader>
            <CardContent className="divide-y">
              {submissions.map((p) => (
                <div key={p.id} className="flex items-center justify-between py-3">
                  <div>
                    <div className="font-medium">{p.title}</div>
                    <div className="text-xs text-muted-foreground">{p.status} • {new Date(p.createdAt).toLocaleDateString()}</div>
                  </div>
                  <Button asChild variant="outline" size="sm" className="rounded-2xl">
                    <Link href={`/product/${p.slug || p.id}`}>View</Link>
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        <NewSubmitPage />
      </div>
    </div>
  )
}