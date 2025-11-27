"use client"

import { useEffect, useRef, useState } from "react"
import { useSession } from "next-auth/react"
import { usePathname, useSearchParams } from "next/navigation"

const STORAGE_KEY = "mgh-user-activity-session"

const getPageType = (path: string) => {
  if (path.startsWith("/submit")) return "submit"
  if (path.startsWith("/product")) return "product"
  if (path.startsWith("/community")) return "community"
  if (path.startsWith("/dashboard")) return "dashboard"
  if (path.startsWith("/editorial-dashboard")) return "editorial"
  if (path.startsWith("/notifications")) return "notifications"
  if (path.startsWith("/leaderboard")) return "leaderboard"
  return "other"
}

export function UserActivityTracker() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { data: session } = useSession()
  const [sessionId, setSessionId] = useState<string | null>(null)
  const lastVisitRef = useRef<{ path: string; startedAt: number; pageType: string; referrer: string | null } | null>(null)

  const shouldTrack = Boolean(
    typeof window !== "undefined" &&
      session?.user?.id &&
      session?.user?.role &&
      session.user.role === "USER"
  )

  useEffect(() => {
    if (typeof window === "undefined") return
    let stored = window.localStorage.getItem(STORAGE_KEY)
    if (!stored) {
      stored = crypto.randomUUID()
      window.localStorage.setItem(STORAGE_KEY, stored)
    }
    setSessionId(stored)
  }, [])

  useEffect(() => {
    if (!shouldTrack || !sessionId) {
      lastVisitRef.current = null
      return
    }

    const currentVisit = {
      path: composePath(pathname, searchParams?.toString()),
      startedAt: Date.now(),
      pageType: getPageType(pathname || "/"),
      referrer: typeof document !== "undefined" ? document.referrer || null : null
    }
    lastVisitRef.current = currentVisit

    let flushed = false

    const flushVisit = () => {
      if (flushed) return
      const visit = lastVisitRef.current
      if (!visit?.path) return
      const durationMs = Date.now() - visit.startedAt
      if (durationMs < 250) return
      flushed = true
      sendActivityEvent({
        sessionId,
        path: visit.path,
        pageType: visit.pageType,
        referrer: visit.referrer,
        durationSeconds: Math.max(0.5, durationMs / 1000)
      })
    }

    const handleVisibility = () => {
      if (document.visibilityState === "hidden") {
        flushVisit()
      }
    }

    const handleBeforeUnload = () => {
      flushVisit()
    }

    document.addEventListener("visibilitychange", handleVisibility)
    window.addEventListener("beforeunload", handleBeforeUnload)

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility)
      window.removeEventListener("beforeunload", handleBeforeUnload)
      flushVisit()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, searchParams?.toString(), sessionId, shouldTrack])

  return null
}

const composePath = (pathname?: string | null, search?: string | null) => {
  const path = pathname || "/"
  if (!search) return path
  if (!search.length) return path
  return `${path}?${search}`
}

const sendActivityEvent = (payload: {
  sessionId: string
  path: string
  pageType: string
  referrer: string | null
  durationSeconds: number
}) => {
  const body = JSON.stringify({
    ...payload,
    userAgent: typeof navigator !== "undefined" ? navigator.userAgent : undefined
  })

  if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
    const blob = new Blob([body], { type: "application/json" })
    navigator.sendBeacon("/api/analytics/track", blob)
    return
  }

  fetch("/api/analytics/track", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body,
    keepalive: true
  }).catch(() => {
    // swallow errors for analytics
  })
}

