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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Plus, Loader2, Info } from "lucide-react"

// Form validation schema
const submitGameSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title must be less than 100 characters"),
  tagline: z.string().optional(),
  description: z.string().min(10, "Description must be at least 10 characters").max(1000, "Description must be less than 1000 characters"),
  image: z.string().url("Please enter a valid image URL").optional().or(z.literal("")),
  categoryId: z.string().min(1, "Please select a category"),
})

type SubmitGameForm = z.infer<typeof submitGameSchema>

interface Category {
  id: string
  name: string
  slug: string
}

interface SubmitGameModalProps {
  children?: React.ReactNode
  onGameSubmitted?: () => void
}

export function SubmitGameModal({ children, onGameSubmitted }: SubmitGameModalProps) {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [loadingCategories, setLoadingCategories] = useState(false)
  const { data: session, status } = useSession()
  const router = useRouter()

  const form = useForm<SubmitGameForm>({
    resolver: zodResolver(submitGameSchema),
    defaultValues: {
      title: "",
      tagline: "",
      description: "",
      image: "",
      categoryId: "",
    },
  })

  // Fetch categories when modal opens
  useEffect(() => {
    if (open) {
      fetchCategories()
    }
  }, [open])

  const fetchCategories = async () => {
    try {
      setLoadingCategories(true)
      const response = await fetch('/api/categories')
      if (response.ok) {
        const data = await response.json()
        setCategories(Array.isArray(data) ? data : [])
      } else {
        console.error('Failed to fetch categories:', response.status)
        setCategories([])
        toast.error('Failed to load categories. Please try again.')
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
      setCategories([])
      toast.error('Failed to load categories. Please try again.')
    } finally {
      setLoadingCategories(false)
    }
  }

  const onSubmit = async (data: SubmitGameForm) => {
    if (status !== "authenticated") {
      router.push('/auth/signin')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          image: data.image || undefined, // Convert empty string to undefined
        }),
      })

      if (response.ok) {
        const newGame = await response.json()
        toast.success('Game submitted successfully! 🎉')
        form.reset()
        setOpen(false)
        onGameSubmitted?.()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to submit game')
      }
    } catch (error) {
      console.error('Error submitting game:', error)
      toast.error('An error occurred while submitting the game')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen && status !== "authenticated") {
      router.push('/auth/signin')
      return
    }
    setOpen(newOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {children || (
          <Button size="lg" className="bg-[rgb(60,41,100)] hover:bg-[rgb(50,31,90)] text-white shadow-soft">
            <Plus className="w-5 h-5 mr-2" />
            Submit Game
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center mb-2">
            <div className="flex items-center gap-2">
              <img src="/logo/logo-gamepad.webp" alt="Game" className="w-6 h-6" />
              Submit Your Game
            </div>
          </DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Title Field */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Game Title *</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter your game title" 
                      className="rounded-2xl"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Tagline Field */}
            <FormField
              control={form.control}
              name="tagline"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tagline</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="A short catchy tagline for your game" 
                      className="rounded-2xl"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description Field */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => {
                const descLen = field.value?.length || 0
                return (
                  <FormItem>
                    <FormLabel>Description *</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe your game, its features, and what makes it unique..."
                        className="rounded-2xl min-h-[160px] resize-none overflow-y-auto"
                        {...field} 
                      />
                    </FormControl>
                    <div className="flex justify-between items-center">
                      <p className="text-xs text-muted-foreground">Minimum 260 characters required</p>
                      <span 
                        className={`text-xs transition-colors ${
                          descLen < 2000 
                            ? 'text-muted-foreground' 
                            : descLen < 2500 
                              ? 'text-yellow-500' 
                              : 'text-red-500'
                        }`}
                        aria-live="polite"
                        aria-label={`Character count: ${descLen}`}
                      >
                        {descLen} / 3000
                      </span>
                    </div>
                    {descLen >= 3000 && (
                      <p className="text-xs text-amber-500 mt-1 flex items-center gap-1">
                        <Info className="w-3 h-3" />
                        That's a lot of detail! Consider keeping it concise for best readability.
                      </p>
                    )}
                    <FormMessage />
                  </FormItem>
                )
              }}
            />

            {/* Category Field */}
            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="rounded-2xl">
                        <SelectValue placeholder={loadingCategories ? "Loading categories..." : "Select a category"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {loadingCategories ? (
                        <SelectItem value="__loading" disabled>
                          Loading categories...
                        </SelectItem>
                      ) : categories.length === 0 ? (
                        <SelectItem value="__empty" disabled>
                          No categories available
                        </SelectItem>
                      ) : (
                        categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Image Field */}
            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Game Image URL</FormLabel>
                  <FormControl>
                    <Input 
                      type="url"
                      placeholder="https://your-game-image.com/image.jpg" 
                      className="rounded-2xl"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-4 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setOpen(false)}
                className="rounded-2xl"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="bg-[rgb(60,41,100)] hover:bg-[rgb(50,31,90)] text-white rounded-2xl min-w-[120px]"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Game"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
