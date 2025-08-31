"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function ExampleModal() {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="rounded-2xl shadow-soft">
          Open Game Details
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] rounded-2xl shadow-large">
        <DialogHeader className="p-2">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src="/placeholder-game.jpg" />
              <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                CG
              </AvatarFallback>
            </Avatar>
            <div>
              <DialogTitle className="text-xl">Clash of Clans</DialogTitle>
              <DialogDescription>
                Strategy game • 4.5 ⭐ • 152 votes
              </DialogDescription>
              <div className="flex gap-2 mt-2">
                <Badge className="rounded-2xl">Strategy</Badge>
                <Badge variant="secondary" className="rounded-2xl">Multiplayer</Badge>
              </div>
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3 rounded-2xl">
            <TabsTrigger value="overview" className="rounded-2xl">Overview</TabsTrigger>
            <TabsTrigger value="reviews" className="rounded-2xl">Reviews</TabsTrigger>
            <TabsTrigger value="details" className="rounded-2xl">Details</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4 p-2">
            <div>
              <h4 className="font-semibold mb-2">Description</h4>
              <p className="text-sm text-muted-foreground">
                A popular strategy mobile game where you build and defend your village. 
                Create your army, fight epic Clan Wars, and rise to the top of the leaderboards.
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="comment">Add a comment</Label>
              <Textarea
                id="comment"
                placeholder="Share your thoughts about this game..."
                className="rounded-2xl border-border focus:ring-2 focus:ring-ring"
              />
            </div>
          </TabsContent>
          
          <TabsContent value="reviews" className="space-y-4 p-2">
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-3 p-4 rounded-2xl bg-muted/50">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>U{i}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">User {i}</span>
                      <span className="text-xs text-muted-foreground">2 hours ago</span>
                    </div>
                    <p className="text-sm mt-1">Great game! Really enjoying the strategy elements.</p>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="details" className="space-y-4 p-2">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Developer:</span>
                <span className="ml-2 text-muted-foreground">Supercell</span>
              </div>
              <div>
                <span className="font-medium">Release Date:</span>
                <span className="ml-2 text-muted-foreground">August 2012</span>
              </div>
              <div>
                <span className="font-medium">Platform:</span>
                <span className="ml-2 text-muted-foreground">iOS, Android</span>
              </div>
              <div>
                <span className="font-medium">Genre:</span>
                <span className="ml-2 text-muted-foreground">Strategy, MMO</span>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="p-2">
          <Button variant="outline" onClick={() => setOpen(false)} className="rounded-2xl">
            Close
          </Button>
          <Button className="rounded-2xl shadow-soft">
            Vote for Game
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
