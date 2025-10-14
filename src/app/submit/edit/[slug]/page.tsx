'use client'

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import NewSubmitPage from '@/app/submit/new/page'
import { Header } from '@/components/layout/header'
import { toast } from 'sonner'

export default function EditSubmitPageBySlug({ params }: { params: Promise<{ slug: string }> }) {
  const router = useRouter()
  const { slug } = use(params)
  const [loading, setLoading] = useState(true)
  const [productId, setProductId] = useState<string | null>(null)

  useEffect(() => {
    const loadProductBySlug = async () => {
      try {
        // Try slug-based API first
        const res = await fetch(`/api/products/by-slug/${slug}`, { 
          cache: 'no-store',
          credentials: 'include'
        })
        if (res.ok) {
          const productData = await res.json()
          setProductId(productData.id)
          setLoading(false)
          return
        }
        
        // If slug-based API fails, try to find by slug in dashboard API
        const dashboardRes = await fetch('/api/dashboard/games', { 
          cache: 'no-store',
          credentials: 'include'
        })
        if (dashboardRes.ok) {
          const data = await dashboardRes.json()
          const product = data.games?.find((p: any) => p.slug === slug)
          if (product) {
            setProductId(product.id)
            setLoading(false)
            return
          }
        }
        
        // If still not found, treat slug as ID (fallback for old URLs)
        setProductId(slug)
        setLoading(false)
      } catch (e) {
        console.error('Error loading product:', e)
        toast.error('Failed to load game')
        router.push('/dashboard')
      }
    }
    loadProductBySlug()
  }, [slug, router])

  if (loading) return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-white">Loading...</div>
      </div>
    </div>
  )
  
  if (!productId) return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-white">Product not found</div>
      </div>
    </div>
  )
  
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <NewSubmitPage productId={productId} />
      </main>
    </div>
  )
}
