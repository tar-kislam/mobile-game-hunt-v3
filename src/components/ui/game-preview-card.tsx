"use client"

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PLATFORMS } from '@/components/ui/platform-icons'
import Image from 'next/image'
import { useState, useEffect } from 'react'

interface Category {
  id: string
  name: string
}

interface GamePreviewCardProps {
  title: string
  tagline: string
  description: string
  thumbnail: string
  platforms: string[]
  launchType: string
  categories: string[] | any[]
}

export function GamePreviewCard({
  title,
  tagline,
  description,
  thumbnail,
  platforms,
  launchType,
  categories
}: GamePreviewCardProps) {
  const [categoryNames, setCategoryNames] = useState<string[]>([])
  const platformDefs = platforms
    .map(platform => PLATFORMS.find(p => p.value === platform)?.icon)
    .filter(Boolean) as Array<React.ComponentType<{ className?: string }>>

  useEffect(() => {
    const fetchCategoryNames = async () => {
      if (categories.length === 0) return
      
      try {
        const response = await fetch('/api/categories')
        if (response.ok) {
          const allCategories: Category[] = await response.json()
          const names = categories.map(cat => {
            if (typeof cat === 'string') {
              return allCategories.find(c => c.id === cat)?.name || cat
            }
            return cat?.name || cat?.label || 'Category'
          })
          setCategoryNames(names)
        }
      } catch (error) {
        console.error('Failed to fetch category names:', error)
        // Fallback to using the original categories
        setCategoryNames(categories.map(cat => 
          typeof cat === 'string' ? cat : cat?.name || cat?.label || 'Category'
        ))
      }
    }

    fetchCategoryNames()
  }, [categories])

  return (
    <Card className="rounded-xl border-0 bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-sm shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-[1.02] group">
      <CardContent className="p-0">
        <div className="relative">
          {thumbnail ? (
            <div className="relative h-48 w-full overflow-hidden rounded-t-xl">
              <Image
                src={thumbnail}
                alt={title}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            </div>
          ) : (
            <div className="h-48 w-full bg-gradient-to-br from-gray-700 to-gray-800 rounded-t-xl flex items-center justify-center">
              <div className="text-gray-400 text-4xl">🎮</div>
            </div>
          )}
          
          <div className="absolute top-3 left-3">
            <Badge variant="secondary" className="bg-black/50 text-white border-0">
              {launchType === 'SOFT_LAUNCH' ? 'Soft Launch' : 'Global Launch'}
            </Badge>
          </div>
        </div>

        <div className="p-4 space-y-3">
          <div>
            <h3 className="text-lg font-bold text-white line-clamp-1">{title}</h3>
            <p className="text-sm text-gray-300 line-clamp-2">{tagline}</p>
          </div>

          <p className="text-sm text-gray-400 line-clamp-3">{description}</p>

          <div className="flex items-center gap-2 flex-wrap">
            {platformDefs.map((Icon, index) => (
              <span key={index} className="text-lg"><Icon className="w-4 h-4" /></span>
            ))}
            {categoryNames.slice(0, 2).map((categoryName, index) => (
              <Badge key={index} variant="outline" className="text-xs bg-gray-800/50 border-gray-600 text-gray-300">
                {categoryName}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
