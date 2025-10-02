"use client"

import * as React from "react"
import { MoonIcon } from "lucide-react"

import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-8 w-8 cursor-default"
      aria-label="Dark mode only"
      disabled
    >
      <MoonIcon className="h-4 w-4" />
      <span className="sr-only">Dark mode</span>
    </Button>
  )
}
