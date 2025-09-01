"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { PlusIcon, XIcon, ImageIcon, VideoIcon } from "lucide-react"
import { PlatformPicker } from "@/components/ui/platform-picker"

const gameSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title must be less than 100 characters"),
  tagline: z.string().optional(),
  description: z.string().min(10, "Description must be at least 10 characters").max(1000, "Description must be less than 1000 characters"),
  url: z.string().url("Please enter a valid URL"),
  image: z.string().url("Please enter a valid main image URL"),
  images: z.array(z.string().url("Please enter valid image URLs")).optional(),
  video: z.string().url("Please enter a valid video URL").optional().or(z.literal("")),
  appStoreUrl: z.string().url("Please enter a valid App Store URL").optional().or(z.literal("")),
  playStoreUrl: z.string().url("Please enter a valid Play Store URL").optional().or(z.literal("")),
  twitterUrl: z.string().url("Please enter a valid Twitter URL").optional().or(z.literal("")),
  platforms: z.array(z.string()).min(1, "At least one platform is required"),
  releaseAt: z.string().optional(),
})

type GameFormData = z.infer<typeof gameSchema>



interface EnhancedSubmitGameModalProps {
  children: React.ReactNode
  onGameSubmitted?: () => void
}

export function EnhancedSubmitGameModal({ children, onGameSubmitted }: EnhancedSubmitGameModalProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([])
  const [additionalImages, setAdditionalImages] = useState<string[]>([])

  const form = useForm<GameFormData>({
    resolver: zodResolver(gameSchema),
    defaultValues: {
      title: "",
      tagline: "",
      description: "",
      url: "",
      image: "",
      images: [],
      video: "",
      appStoreUrl: "",
      playStoreUrl: "",
      twitterUrl: "",
      platforms: [],
      releaseAt: "",
    },
  })

  // Update form when platforms change
  useEffect(() => {
    form.setValue("platforms", selectedPlatforms)
  }, [selectedPlatforms, form])

  const togglePlatform = (platform: string) => {
    setSelectedPlatforms(prev => 
      prev.includes(platform) 
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    )
  }

  const addImageField = () => {
    setAdditionalImages([...additionalImages, ""])
  }

  const removeImageField = (index: number) => {
    const newImages = additionalImages.filter((_, i) => i !== index)
    setAdditionalImages(newImages)
    
    // Update form values
    const currentImages = form.getValues("images") || []
    const updatedImages = currentImages.filter((_, i) => i !== index)
    form.setValue("images", updatedImages)
  }

  const updateImageField = (index: number, value: string) => {
    const newImages = [...additionalImages]
    newImages[index] = value
    setAdditionalImages(newImages)
    
    // Update form values
    const currentImages = form.getValues("images") || []
    const updatedImages = [...currentImages]
    updatedImages[index] = value
    form.setValue("images", updatedImages)
  }

  const onSubmit = async (data: GameFormData) => {
    if (!session) {
      toast.error("Please sign in to submit a game")
      return
    }

    setIsSubmitting(true)

    try {
      // Filter out empty image URLs
      const validImages = (data.images || []).filter(img => img.trim() !== "")
      
      // Prepare social links
      const socialLinks = data.twitterUrl ? { twitter: data.twitterUrl } : undefined

      const submitData = {
        ...data,
        images: validImages,
        video: data.video || undefined,
        appStoreUrl: data.appStoreUrl || undefined,
        playStoreUrl: data.playStoreUrl || undefined,
        socialLinks,
      }

      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      })

      if (response.ok) {
        toast.success("Game submitted successfully!")
        form.reset()
        setSelectedPlatforms([])
        setAdditionalImages([])
        setIsOpen(false)
        onGameSubmitted?.()
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || "Failed to submit game")
      }
    } catch (error) {
      console.error('Error submitting game:', error)
      toast.error("Failed to submit game. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Submit Your Game</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Basic Information</h3>
              
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Game Title *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your game title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tagline"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tagline</FormLabel>
                    <FormControl>
                      <Input placeholder="A short, catchy description" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description *</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Tell us about your game..."
                        className="min-h-[100px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Platform Selection */}
              <PlatformPicker
                selectedPlatforms={selectedPlatforms}
                onPlatformsChange={setSelectedPlatforms}
                maxSelection={5}
              />
            </div>

            {/* Media */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <ImageIcon className="w-5 h-5" />
                Media
              </h3>
              
              <FormField
                control={form.control}
                name="image"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Main Image URL *</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com/image.jpg" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Additional Images */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <FormLabel>Additional Images</FormLabel>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addImageField}
                    disabled={additionalImages.length >= 5}
                  >
                    <PlusIcon className="w-4 h-4 mr-1" />
                    Add Image
                  </Button>
                </div>
                
                {additionalImages.map((_, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      placeholder={`Image ${index + 2} URL`}
                      value={additionalImages[index]}
                      onChange={(e) => updateImageField(index, e.target.value)}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeImageField(index)}
                    >
                      <XIcon className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                
                {additionalImages.length < 5 && (
                  <p className="text-xs text-muted-foreground">
                    You can add up to 5 additional images
                  </p>
                )}
              </div>

              <FormField
                control={form.control}
                name="video"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <VideoIcon className="w-4 h-4" />
                      Video URL (optional)
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com/video.mp4" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Links */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Links</h3>
              
              <FormField
                control={form.control}
                name="url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Website URL *</FormLabel>
                    <FormControl>
                      <Input placeholder="https://yourgame.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="appStoreUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>App Store URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://apps.apple.com/..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="playStoreUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Google Play URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://play.google.com/..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="releaseAt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Release Date (optional)</FormLabel>
                    <FormControl>
                      <Input 
                        type="datetime-local" 
                        placeholder="Select release date and time"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="twitterUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Twitter URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://twitter.com/yourgame" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit Game"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
