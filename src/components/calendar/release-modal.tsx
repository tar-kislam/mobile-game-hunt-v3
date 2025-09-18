'use client'

import { useState, useEffect } from 'react'
import { X, Calendar, Globe, Smartphone, ExternalLink, Heart, MessageCircle, Users, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { useReleasesCache } from '@/hooks/useReleasesCache'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'

interface GameRelease {
  id: string
  title: string
  tagline?: string
  description: string
  thumbnail?: string
  platforms: string[]
  countries: string[]
  releaseAt: string
  url?: string
  slug: string
  categories: Array<{
    id: string
    name: string
  }>
  developer: {
    name?: string
    username?: string
  }
  stats: {
    votes: number
    comments: number
    followers: number
  }
}

interface ReleaseModalProps {
  isOpen: boolean
  onClose: () => void
  selectedDate: string
}

export default function ReleaseModal({ isOpen, onClose, selectedDate }: ReleaseModalProps) {
  const [releases, setReleases] = useState<GameRelease[]>([])
  const { fetchReleases, loading, error } = useReleasesCache()

  useEffect(() => {
    if (isOpen && selectedDate) {
      loadReleases()
    }
  }, [isOpen, selectedDate])

  const loadReleases = async () => {
    const data = await fetchReleases(selectedDate)
    if (data) {
      setReleases(data.releases || [])
    }
  }

  const formatReleaseTime = (releaseAt: string) => {
    const releaseDate = new Date(releaseAt)
    const now = new Date()
    const diffTime = releaseDate.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays < 0) return 'Released'
    if (diffDays === 0) return 'Today!'
    if (diffDays === 1) return 'Tomorrow'
    if (diffDays < 7) return `${diffDays} days`
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks`
    return `${Math.ceil(diffDays / 30)} months`
  }

  const getStatusColor = (releaseAt: string) => {
    const releaseDate = new Date(releaseAt)
    const now = new Date()
    const diffTime = releaseDate.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays < 0) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    if (diffDays <= 7) return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    if (diffDays <= 30) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
    return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-black via-[#121225] to-[#050509] border border-white/10">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Game Releases - {formatDate(selectedDate)}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {loading ? (
            // Loading skeleton
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="bg-zinc-900/40 backdrop-blur-md border border-white/10">
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-4">
                      <Skeleton className="w-16 h-16 rounded-lg bg-gray-700" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-6 w-3/4 bg-gray-700" />
                        <Skeleton className="h-4 w-1/2 bg-gray-700" />
                        <Skeleton className="h-4 w-full bg-gray-700" />
                        <div className="flex gap-2">
                          <Skeleton className="h-6 w-16 bg-gray-700" />
                          <Skeleton className="h-6 w-16 bg-gray-700" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : error ? (
            // Error state
            <Card className="bg-red-900/20 border border-red-500/50">
              <CardContent className="p-6 text-center">
                <div className="text-red-400 mb-2">⚠️ Error</div>
                <p className="text-red-300">{error}</p>
                <Button 
                  onClick={loadReleases} 
                  variant="outline" 
                  className="mt-4 border-red-500 text-red-400 hover:bg-red-500/10"
                >
                  Try Again
                </Button>
              </CardContent>
            </Card>
          ) : releases.length === 0 ? (
            // No releases state
            <Card className="bg-zinc-900/40 backdrop-blur-md border border-white/10">
              <CardContent className="p-8 text-center">
                <div className="text-6xl mb-4">🎮</div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  No releases on this day
                </h3>
                <p className="text-gray-400">
                  Check back later or explore other dates for upcoming game releases.
                </p>
              </CardContent>
            </Card>
          ) : (
            // Releases list
            <div className="space-y-4">
              {releases.map((release) => (
                <Card key={release.id} className="bg-zinc-900/40 backdrop-blur-md border border-white/10 hover:border-purple-500/50 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-4">
                      {/* Game Thumbnail */}
                      <div className="flex-shrink-0">
                        <Link href={`/product/${release.slug}`}>
                          {release.thumbnail ? (
                            <img
                              src={release.thumbnail}
                              alt={release.title}
                              className="w-16 h-16 rounded-lg object-cover cursor-pointer hover:opacity-80 transition-opacity"
                            />
                          ) : (
                            <div className="w-16 h-16 bg-gray-700 rounded-lg flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity">
                              <span className="text-gray-400 text-xs">No Image</span>
                            </div>
                          )}
                        </Link>
                      </div>

                      {/* Game Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <Link href={`/product/${release.slug}`} className="flex-1 min-w-0">
                            <h3 className="text-lg font-semibold text-white truncate hover:text-purple-400 transition-colors">
                              {release.title}
                            </h3>
                          </Link>
                          <Badge className={`${getStatusColor(release.releaseAt)} text-xs`}>
                            {formatReleaseTime(release.releaseAt)}
                          </Badge>
                        </div>
                        
                        {release.tagline && (
                          <p className="text-gray-300 text-sm mb-2 line-clamp-2">
                            {release.tagline}
                          </p>
                        )}
                        
                        <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                          {release.description.length > 150 ? `${release.description.substring(0, 150)}...` : release.description}
                        </p>

                        {/* Release Time */}
                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                          <Clock className="w-3 h-3" />
                          <span className="font-medium">{formatDate(release.releaseAt)}</span>
                        </div>

                        {/* Platforms & Countries */}
                        <div className="flex flex-wrap gap-2 mb-3">
                          {release.platforms?.slice(0, 4).map((platform) => (
                            <Badge key={platform} variant="outline" className="text-xs px-2 py-1 border-purple-500/50 text-purple-300">
                              <Smartphone className="w-2 h-2 mr-1" />
                              {platform.toUpperCase()}
                            </Badge>
                          ))}
                          {release.platforms?.length > 4 && (
                            <Badge variant="outline" className="text-xs px-2 py-1 border-purple-500/50 text-purple-300">
                              +{release.platforms.length - 4}
                            </Badge>
                          )}
                          {release.countries?.slice(0, 2).map((country) => (
                            <Badge key={country} variant="outline" className="text-xs px-2 py-1 border-blue-500/50 text-blue-300">
                              <Globe className="w-2 h-2 mr-1" />
                              {country}
                            </Badge>
                          ))}
                        </div>

                        {/* Categories */}
                        {release.categories && release.categories.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-3">
                            {release.categories.slice(0, 3).map((category) => (
                              <Badge key={category.id} variant="outline" className="text-xs px-2 py-1 border-green-500/50 text-green-300">
                                {category.name}
                              </Badge>
                            ))}
                            {release.categories.length > 3 && (
                              <Badge variant="outline" className="text-xs px-2 py-1 border-green-500/50 text-green-300">
                                +{release.categories.length - 3}
                              </Badge>
                            )}
                          </div>
                        )}

                        {/* Stats */}
                        <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                          <div className="flex items-center gap-1">
                            <Heart className="w-3 h-3" />
                            <span>{release.stats.votes}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MessageCircle className="w-3 h-3" />
                            <span>{release.stats.comments}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            <span>{release.stats.followers}</span>
                          </div>
                        </div>

                        {/* Developer */}
                        <div className="text-xs text-gray-500">
                          by <span className="font-medium text-gray-300">
                            {release.developer.name || release.developer.username || 'Anonymous'}
                          </span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col gap-2 flex-shrink-0">
                        <Button asChild variant="outline" size="sm" className="border-purple-500/50 text-purple-300 hover:bg-purple-500/10">
                          <Link href={`/product/${release.slug}`}>
                            <ExternalLink className="w-3 h-3 mr-1" />
                            View Details
                          </Link>
                        </Button>
                        {release.url && (
                          <Button asChild variant="outline" size="sm" className="border-blue-500/50 text-blue-300 hover:bg-blue-500/10">
                            <a href={release.url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="w-3 h-3 mr-1" />
                              Play Game
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center pt-4 border-t border-white/10">
          <div className="text-sm text-gray-400">
            {releases.length > 0 && `${releases.length} release${releases.length === 1 ? '' : 's'} found`}
          </div>
          <Button 
            onClick={onClose} 
            variant="outline" 
            size="sm"
            className="border-gray-500/50 text-gray-300 hover:bg-gray-500/10"
          >
            <X className="w-4 h-4 mr-1" />
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
