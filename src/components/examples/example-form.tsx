"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function ExampleForm() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    url: "",
  })

  return (
    <Card className="w-full max-w-2xl mx-auto rounded-2xl shadow-soft">
      <CardHeader className="p-4">
        <div className="flex items-center gap-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src="/placeholder-avatar.jpg" />
            <AvatarFallback className="bg-primary text-primary-foreground">
              MG
            </AvatarFallback>
          </Avatar>
          <div>
            <CardTitle>Submit New Game</CardTitle>
            <CardDescription>
              Share your mobile game with the community
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Game Title</Label>
          <Input
            id="title"
            placeholder="Enter game title..."
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="rounded-2xl border-border focus:ring-2 focus:ring-ring"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            placeholder="Describe your game..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="rounded-2xl border-border focus:ring-2 focus:ring-ring min-h-[100px]"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="url">Game URL</Label>
          <Input
            id="url"
            type="url"
            placeholder="https://example.com/your-game"
            value={formData.url}
            onChange={(e) => setFormData({ ...formData, url: e.target.value })}
            className="rounded-2xl border-border focus:ring-2 focus:ring-ring"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary" className="rounded-2xl">Action</Badge>
          <Badge variant="secondary" className="rounded-2xl">Adventure</Badge>
          <Badge variant="secondary" className="rounded-2xl">Puzzle</Badge>
          <Badge variant="outline" className="rounded-2xl">+ Add Category</Badge>
        </div>

        <div className="flex gap-2 pt-2">
          <Button 
            variant="outline" 
            className="flex-1 rounded-2xl"
          >
            Save Draft
          </Button>
          <Button 
            className="flex-1 rounded-2xl shadow-soft"
          >
            Submit Game
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
