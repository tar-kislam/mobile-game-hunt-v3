"use client"

import React, { useState, useEffect } from 'react'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { SearchIcon, GamepadIcon, ExternalLinkIcon } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

interface Game {
  id: string
  title: string
  description: string
  image: string
  url: string
  platforms: string[]
  createdAt: string
}

interface StepGameProps {
  data: {
    gameId: string
  }
  updateData: (field: string, value: any) => void
}

export default function StepGame({ data, updateData }: StepGameProps) {
  const [games, setGames] = useState<Game[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchUserGames()
  }, [])

  const fetchUserGames = async () => {
    try {
      const response = await fetch('/api/user/games')
      if (response.ok) {
        const userGames = await response.json()
        setGames(userGames)
      } else {
        setError('Failed to load your games')
      }
    } catch (err) {
      setError('Error loading games')
    } finally {
      setLoading(false)
    }
  }

  const filteredGames = games.filter(game =>
    game.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    game.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const selectedGame = games.find(game => game.id === data.gameId)

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">
            🎮 Select Your Game
          </h2>
          <p className="text-gray-300">
            Choose which of your games to promote
          </p>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">
            🎮 Select Your Game
          </h2>
          <p className="text-gray-300">
            Choose which of your games to promote
          </p>
        </div>
        <div className="text-center py-12">
          <p className="text-red-400 mb-4">{error}</p>
          <Button onClick={fetchUserGames} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  if (games.length === 0) {
    return (
      <div className="space-y-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">
            🎮 Select Your Game
          </h2>
          <p className="text-gray-300">
            Choose which of your games to promote
          </p>
        </div>
        
        <div className="text-center py-12">
          <GamepadIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No Games Found</h3>
          <p className="text-gray-400 mb-6">
            You need to submit a game first before creating an advertising campaign.
          </p>
          <Button asChild className="bg-purple-600 hover:bg-purple-700">
            <Link href="/submit">
              Submit Your Game
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">
          🎮 Select Your Game
        </h2>
        <p className="text-gray-300">
          Choose which of your games to promote
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search your games..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-gray-800/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:border-purple-500 focus:ring-purple-500/20"
        />
      </div>

      {/* Selected Game */}
      {selectedGame && (
        <div className="p-4 rounded-xl bg-green-900/20 border border-green-500/30">
          <div className="flex items-center gap-2 text-green-400">
            <GamepadIcon className="h-5 w-5" />
            <span className="font-medium">Selected: {selectedGame.title}</span>
          </div>
        </div>
      )}

      {/* Games List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredGames.map((game) => (
          <Card
            key={game.id}
            className={`cursor-pointer transition-all duration-200 ${
              data.gameId === game.id
                ? 'border-purple-400 bg-purple-500/10'
                : 'border-gray-600 hover:border-purple-400 hover:bg-purple-500/5'
            }`}
            onClick={() => {
              updateData('gameId', game.id)
              updateData('gameName', game.title)
            }}
          >
            <CardContent className="p-4">
              <div className="flex gap-4">
                <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-700">
                  {game.image ? (
                    <Image
                      src={game.image}
                      alt={game.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <GamepadIcon className="h-8 w-8 text-gray-400" />
                    </div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-white mb-1 truncate">
                    {game.title}
                  </h3>
                  <p className="text-gray-400 text-sm mb-2 line-clamp-2">
                    {game.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex gap-1">
                      {game.platforms.slice(0, 2).map((platform) => (
                        <span
                          key={platform}
                          className="px-2 py-1 text-xs bg-gray-700 text-gray-300 rounded"
                        >
                          {platform}
                        </span>
                      ))}
                      {game.platforms.length > 2 && (
                        <span className="px-2 py-1 text-xs bg-gray-700 text-gray-300 rounded">
                          +{game.platforms.length - 2}
                        </span>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        window.open(game.url, '_blank')
                      }}
                      className="text-gray-400 hover:text-white"
                    >
                      <ExternalLinkIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredGames.length === 0 && searchTerm && (
        <div className="text-center py-8">
          <p className="text-gray-400">No games found matching "{searchTerm}"</p>
        </div>
      )}
    </div>
  )
}
