"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Pen, Trash2 } from "lucide-react"
import Link from "next/link"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { GameCard } from "./game-card"
import { EnhancedSubmitGameModal } from "./enhanced-submit-game-modal"
import { toast } from "sonner"
import { Loader2, Plus } from "lucide-react"

interface Game {
  id: string
  title: string
  description: string
  image?: string | null
  thumbnail?: string | null
  images?: string[]
  gallery?: string[]
  url: string
  platforms?: string[]
  createdAt: string
  releaseAt?: string | null
  status?: string
  monetization?: string | null
  engine?: string | null
  pricing?: string | null
  categories?: Array<{
    category: {
      id: string
      name: string
    }
  }>
  tags?: string[]
  _count: {
    votes: number
    comments: number
  }
  user: {
    name: string | null
    image?: string | null
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
        <CardTitle className="text-xl font-bold flex items-center gap-2">
          <img src="/logo/logo-gamepad.webp" alt="Game" className="w-6 h-6" />
          My Games
        </CardTitle>
        <EnhancedSubmitGameModal onGameSubmitted={handleGameSubmitted}>
          <Button size="sm" className="bg-[rgb(60,41,100)] hover:bg-[rgb(50,31,90)] text-white rounded-2xl">
            <Plus className="w-4 h-4 mr-2" />
            Add Game
          </Button>
        </EnhancedSubmitGameModal>
      </CardHeader>
      
      <CardContent className="pt-0">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400 dark:text-gray-500" />
            <span className="ml-2 text-gray-500 dark:text-gray-400">Loading your games...</span>
          </div>
        ) : myGames.length === 0 ? (
          <div className="text-center py-12">
            <div className="mb-4">
              <img src="/logo/logo-gamepad.webp" alt="Game" className="w-16 h-16" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">No games submitted yet</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-md mx-auto">
              Share your amazing mobile games with the community! Submit your first game to get started.
            </p>
            <EnhancedSubmitGameModal onGameSubmitted={handleGameSubmitted}>
              <Button className="bg-[rgb(60,41,100)] hover:bg-[rgb(50,31,90)] text-white rounded-2xl">
                <Plus className="w-4 h-4 mr-2" />
                Submit Your First Game
              </Button>
            </EnhancedSubmitGameModal>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              You have submitted {myGames.length} game{myGames.length !== 1 ? 's' : ''}
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              {myGames.map((game) => (
                <GameCard 
                  key={game.id} 
                  game={game} 
                  onVote={handleVote}
                  showAuthor={false} // Don't show author since it's the user's own games
                  footer={
                    <div className="flex gap-2 mt-3">
                      <Link href={`/submit/edit/${game.id}`}>
                        <Button variant="outline" className="rounded-2xl">
                          <Pen className="w-4 h-4 mr-2" /> Edit
                        </Button>
                      </Link>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" className="rounded-2xl">
                            <Trash2 className="w-4 h-4 mr-2" /> Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete this game?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. The game and its related data will be permanently removed.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={async()=>{
                              try{
                                const res = await fetch(`/api/products/${game.id}`, { method: 'DELETE' })
                                if(!res.ok){ throw new Error('Failed') }
                                setMyGames(prev=> prev.filter(g=> g.id!==game.id))
                                toast.success('🗑️ Game successfully removed')
                              }catch(err){
                                console.error(err)
                                toast.error('Failed to remove the game')
                              }
                            }}>Delete</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  }
                />
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
