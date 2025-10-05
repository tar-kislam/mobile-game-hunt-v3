"use client"

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Plus, X, Download, FileText } from 'lucide-react'
import { toast } from 'sonner'

const pressKitSchema = z.object({
  headline: z.string().min(1, 'Headline is required').max(100, 'Headline must be 100 characters or less'),
  about: z.string().min(10, 'About must be at least 10 characters').max(500, 'About must be 500 characters or less'),
  features: z.array(z.string().min(1, 'Feature cannot be empty')).min(1, 'At least one feature is required').max(10, 'Maximum 10 features allowed'),
  media: z.array(z.string()).optional()
})

type PressKitFormData = z.infer<typeof pressKitSchema>

interface PressKitModalProps {
  onGenerate: (data: PressKitFormData) => Promise<void>
  gameId?: string
}

export function PressKitModal({ onGenerate, gameId }: PressKitModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [newFeature, setNewFeature] = useState('')

  const form = useForm<PressKitFormData>({
    resolver: zodResolver(pressKitSchema),
    defaultValues: {
      headline: '',
      about: '',
      features: [''],
      media: []
    }
  })

  const features = form.watch('features')

  const addFeature = () => {
    if (newFeature.trim() && features.length < 10) {
      form.setValue('features', [...features, newFeature.trim()])
      setNewFeature('')
    }
  }

  const removeFeature = (index: number) => {
    if (features.length > 1) {
      const newFeatures = features.filter((_, i) => i !== index)
      form.setValue('features', newFeatures)
    }
  }

  const onSubmit = async (data: PressKitFormData) => {
    setIsGenerating(true)
    try {
      await onGenerate(data)
      toast.success('Press kit generated successfully!')
      setIsOpen(false)
      form.reset()
    } catch (error) {
      toast.error('Failed to generate press kit')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <FileText className="w-4 h-4" />
          Generate Press Kit
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Generate Press Kit</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Headline */}
          <div>
            <Label htmlFor="headline" className="text-sm font-medium">Headline *</Label>
            <Input
              id="headline"
              placeholder="Enter a compelling headline for your game"
              {...form.register('headline')}
              className="mt-2"
            />
            <p className="text-xs text-muted-foreground mt-1">
              {(form.watch('headline') || '').length}/100 characters
            </p>
            {form.formState.errors.headline && (
              <p className="text-sm text-red-500 mt-1">{form.formState.errors.headline.message}</p>
            )}
          </div>

          {/* About */}
          <div>
            <Label htmlFor="about" className="text-sm font-medium">About *</Label>
            <Textarea
              id="about"
              placeholder="Describe your game in detail"
              rows={4}
              {...form.register('about')}
              className="mt-2"
            />
            <p className="text-xs text-muted-foreground mt-1">
              {(form.watch('about') || '').length}/500 characters
            </p>
            {form.formState.errors.about && (
              <p className="text-sm text-red-500 mt-1">{form.formState.errors.about.message}</p>
            )}
          </div>

          {/* Features */}
          <div>
            <Label className="text-sm font-medium">Features *</Label>
            <div className="space-y-3 mt-2">
              {features.map((feature, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    placeholder={`Feature ${index + 1}`}
                    value={feature}
                    onChange={(e) => {
                      const newFeatures = [...features]
                      newFeatures[index] = e.target.value
                      form.setValue('features', newFeatures)
                    }}
                    className="flex-1"
                  />
                  {features.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFeature(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
              
              {features.length < 10 && (
                <div className="flex gap-2">
                  <Input
                    placeholder="Add new feature"
                    value={newFeature}
                    onChange={(e) => setNewFeature(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addFeature}
                    disabled={!newFeature.trim()}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
            {form.formState.errors.features && (
              <p className="text-sm text-red-500 mt-1">{form.formState.errors.features.message}</p>
            )}
          </div>

          {/* Media Upload */}
          <div>
            <Label className="text-sm font-medium">Media Files (Optional)</Label>
            <div className="mt-2 p-4 border-2 border-dashed border-muted-foreground/25 rounded-lg text-center">
              <FileText className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">
                Drag and drop media files here or click to browse
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Supported: Images, Videos, Documents (max 10 files)
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isGenerating}
              className="flex items-center gap-2"
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Generate Press Kit
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
