"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { GameCard } from "./game-card"
import { SubmitGameModal } from "./submit-game-modal"
import { toast } from "sonner"
import { Loader2, Plus } from "lucide-react"

interface Game {
  id: string
  title: string
  tagline?: string | null
  description: string
  url: string
  image?: string | null
  createdAt: string
  user: {
    id: string
    name: string | null
    image?: string | null
  }
  category: {
    id: string
    name: string
    slug: string
  }
  _count: {
    votes: number
    comments: number
  }
}

export function MyGamesSection() {
  const [myGames, setMyGames] = useState<Game[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { data: session } = useSession()

  useEffect(() => {
    if (session?.user) {
      fetchMyGames()
    }
  }, [session?.user])

  const fetchMyGames = async () => {
    if (!session?.user?.email) return

    try {
      setIsLoading(true)
      // First get user ID from email
      const userResponse = await fetch(`/api/user?email=${encodeURIComponent(session.user.email)}`)
      if (!userResponse.ok) {
        throw new Error('Failed to get user')
      }
      const userData = await userResponse.json()

      // Then fetch user's games
      const response = await fetch(`/api/products?userId=${userData.id}`)
      if (response.ok) {
        const data = await response.json()
        setMyGames(data)
      } else {
        toast.error('Failed to load your games')
      }
    } catch (error) {
      console.error('Error fetching my games:', error)
      toast.error('Failed to load your games')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGameSubmitted = () => {
    fetchMyGames() // Refresh the games list
  }

  const handleVote = async (gameId: string) => {
    toast.info('Voting feature coming soon!')
  }

  if (!session?.user) {
    return null
  }

  return (
    <Card className="rounded-2xl shadow-soft">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
        <CardTitle className="text-xl font-bold">🎮 My Games</CardTitle>
        <SubmitGameModal onGameSubmitted={handleGameSubmitted}>
          <Button size="sm" className="bg-orange-500 hover:bg-orange-600 text-white rounded-2xl">
            <Plus className="w-4 h-4 mr-2" />
            Add Game
          </Button>
        </SubmitGameModal>
      </CardHeader>
      
      <CardContent className="pt-0">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            <span className="ml-2 text-gray-500">Loading your games...</span>
          </div>
        ) : myGames.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎮</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No games submitted yet</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Share your amazing mobile games with the community! Submit your first game to get started.
            </p>
            <SubmitGameModal onGameSubmitted={handleGameSubmitted}>
              <Button className="bg-orange-500 hover:bg-orange-600 text-white rounded-2xl">
                <Plus className="w-4 h-4 mr-2" />
                Submit Your First Game
              </Button>
            </SubmitGameModal>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="text-sm text-gray-600 mb-4">
              You have submitted {myGames.length} game{myGames.length !== 1 ? 's' : ''}
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              {myGames.map((game) => (
                <GameCard 
                  key={game.id} 
                  game={game} 
                  onVote={handleVote}
                  showAuthor={false} // Don't show author since it's the user's own games
                />
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
