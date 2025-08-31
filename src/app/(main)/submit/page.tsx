"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ImageIcon, LinkIcon, TagIcon, InfoIcon, ArrowLeftIcon } from "lucide-react"

const categories = [
  "Action", "Adventure", "Arcade", "Board", "Card", "Casino", "Casual", 
  "Educational", "Music", "Puzzle", "Racing", "Role Playing", "Simulation", 
  "Sports", "Strategy", "Trivia", "Word"
]

const platforms = ["iOS", "Android", "Both"]

export default function SubmitPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    url: "",
    imageUrl: "",
    category: "",
    platform: "",
    tags: [] as string[],
  })
  
  const [newTag, setNewTag] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Redirect if not authenticated
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md rounded-2xl shadow-soft">
          <CardHeader className="p-4 text-center">
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>
              You need to be signed in to submit a game
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-0 space-y-3">
            <Button asChild className="w-full rounded-2xl">
              <Link href="/auth/signin">Sign In</Link>
            </Button>
            <Button variant="outline" asChild className="w-full rounded-2xl">
              <Link href="/auth/signup">Create Account</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim()) && formData.tags.length < 5) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }))
      setNewTag("")
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Here you would submit to your API
      console.log("Submitting:", formData)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Redirect to success page or product page
      router.push("/")
    } catch (error) {
      console.error("Error submitting game:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Button variant="outline" size="sm" asChild className="rounded-2xl">
              <Link href="/">
                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                Back
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Submit Your Game</h1>
              <p className="text-muted-foreground">Share your mobile game with the community</p>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Form */}
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit}>
                <Card className="rounded-2xl shadow-soft">
                  <CardHeader className="p-4">
                    <CardTitle className="flex items-center gap-2">
                      <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
                        <span className="text-primary-foreground font-bold text-sm">MG</span>
                      </div>
                      Game Submission
                    </CardTitle>
                    <CardDescription>
                      Fill out the details below to submit your mobile game
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="p-4 pt-0 space-y-6">
                    {/* Basic Information */}
                    <div className="space-y-4">
                      <h3 className="font-semibold text-lg">Basic Information</h3>
                      
                      <div className="space-y-2">
                        <Label htmlFor="title">Game Title *</Label>
                        <Input
                          id="title"
                          placeholder="Enter your game title..."
                          value={formData.title}
                          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                          className="rounded-2xl border-border focus:ring-2 focus:ring-ring"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="description">Description *</Label>
                        <Textarea
                          id="description"
                          placeholder="Describe your game in detail..."
                          value={formData.description}
                          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                          className="rounded-2xl border-border focus:ring-2 focus:ring-ring min-h-[120px]"
                          required
                        />
                        <p className="text-xs text-muted-foreground">
                          Minimum 50 characters. Be descriptive and highlight what makes your game unique.
                        </p>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="category">Category *</Label>
                          <Select 
                            value={formData.category} 
                            onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                          >
                            <SelectTrigger className="rounded-2xl">
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl">
                              {categories.map((category) => (
                                <SelectItem key={category} value={category.toLowerCase()}>
                                  {category}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="platform">Platform *</Label>
                          <Select 
                            value={formData.platform} 
                            onValueChange={(value) => setFormData(prev => ({ ...prev, platform: value }))}
                          >
                            <SelectTrigger className="rounded-2xl">
                              <SelectValue placeholder="Select platform" />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl">
                              {platforms.map((platform) => (
                                <SelectItem key={platform} value={platform.toLowerCase()}>
                                  {platform}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    {/* Links and Media */}
                    <div className="space-y-4">
                      <h3 className="font-semibold text-lg">Links & Media</h3>
                      
                      <div className="space-y-2">
                        <Label htmlFor="url" className="flex items-center gap-2">
                          <LinkIcon className="h-4 w-4" />
                          Game URL *
                        </Label>
                        <Input
                          id="url"
                          type="url"
                          placeholder="https://example.com/your-game"
                          value={formData.url}
                          onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                          className="rounded-2xl border-border focus:ring-2 focus:ring-ring"
                          required
                        />
                        <p className="text-xs text-muted-foreground">
                          Link to App Store, Google Play, or your website
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="image" className="flex items-center gap-2">
                          <ImageIcon className="h-4 w-4" />
                          Game Image URL
                        </Label>
                        <Input
                          id="image"
                          type="url"
                          placeholder="https://example.com/game-image.jpg"
                          value={formData.imageUrl}
                          onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
                          className="rounded-2xl border-border focus:ring-2 focus:ring-ring"
                        />
                        <p className="text-xs text-muted-foreground">
                          Optional: Direct link to your game's main image or logo
                        </p>
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="space-y-4">
                      <h3 className="font-semibold text-lg flex items-center gap-2">
                        <TagIcon className="h-5 w-5" />
                        Tags
                      </h3>
                      
                      <div className="flex gap-2">
                        <Input
                          placeholder="Add a tag..."
                          value={newTag}
                          onChange={(e) => setNewTag(e.target.value)}
                          onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddTag())}
                          className="rounded-2xl border-border focus:ring-2 focus:ring-ring"
                          disabled={formData.tags.length >= 5}
                        />
                        <Button 
                          type="button" 
                          onClick={handleAddTag}
                          disabled={!newTag.trim() || formData.tags.length >= 5}
                          className="rounded-2xl"
                        >
                          Add
                        </Button>
                      </div>
                      
                      {formData.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {formData.tags.map((tag, index) => (
                            <Badge 
                              key={index} 
                              variant="secondary" 
                              className="rounded-2xl cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                              onClick={() => handleRemoveTag(tag)}
                            >
                              {tag} ×
                            </Badge>
                          ))}
                        </div>
                      )}
                      
                      <p className="text-xs text-muted-foreground">
                        Add up to 5 tags to help people discover your game. Click tags to remove them.
                      </p>
                    </div>

                    {/* Submit Button */}
                    <div className="pt-6 border-t">
                      <Button 
                        type="submit" 
                        className="w-full rounded-2xl shadow-soft"
                        disabled={isSubmitting || !formData.title || !formData.description || !formData.url || !formData.category || !formData.platform}
                      >
                        {isSubmitting ? "Submitting..." : "Submit Game"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </form>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* User Info */}
              <Card className="rounded-2xl shadow-soft">
                <CardHeader className="p-4">
                  <CardTitle>Submitting as</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={session?.user?.image || ""} />
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {session?.user?.name?.[0]?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{session?.user?.name}</div>
                      <div className="text-sm text-muted-foreground">{session?.user?.email}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Guidelines */}
              <Card className="rounded-2xl shadow-soft">
                <CardHeader className="p-4">
                  <CardTitle className="flex items-center gap-2">
                    <InfoIcon className="h-5 w-5" />
                    Submission Guidelines
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="space-y-3 text-sm text-muted-foreground">
                    <div className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>Make sure your game is publicly available</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>Write a clear, descriptive title</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>Provide a detailed description highlighting unique features</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>Use relevant tags to help with discoverability</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>Only submit games you own or have permission to promote</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Preview */}
              {formData.title && (
                <Card className="rounded-2xl shadow-soft">
                  <CardHeader className="p-4">
                    <CardTitle>Preview</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="space-y-3">
                      {formData.imageUrl && (
                        <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-muted">
                          <img 
                            src={formData.imageUrl} 
                            alt={formData.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div>
                        <h3 className="font-semibold">{formData.title}</h3>
                        {formData.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {formData.description}
                          </p>
                        )}
                        <div className="flex gap-2 mt-2">
                          {formData.category && (
                            <Badge variant="secondary" className="rounded-2xl text-xs">
                              {formData.category}
                            </Badge>
                          )}
                          {formData.platform && (
                            <Badge variant="outline" className="rounded-2xl text-xs">
                              {formData.platform}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
