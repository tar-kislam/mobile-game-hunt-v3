'use client'

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import NewSubmitPage from '@/app/submit/new/page'
import { toast } from 'sonner'

export default function EditSubmitPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const { id } = use(params)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/products/${id}`, { cache: 'no-store' })
        if (!res.ok) throw new Error('Failed to load product')
        // We only need to ensure the product exists; NewSubmitPage handles prefilling via its own fetch
      } catch (e) {
        toast.error('Failed to load game')
        router.push('/dashboard')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id, router])

  if (loading) return null
  return <NewSubmitPage />
}


