'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export function CreatePostRefresh({ trigger }: { trigger: number }) {
  const router = useRouter()
  useEffect(() => {
    if (trigger > 0) {
      router.refresh()
    }
  }, [trigger, router])
  return null
}


