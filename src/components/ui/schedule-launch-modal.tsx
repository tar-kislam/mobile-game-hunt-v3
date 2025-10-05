"use client"

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Calendar } from 'lucide-react'

interface ScheduleLaunchModalProps {
  onSchedule: (launchDate: string) => Promise<void>
  isLoading?: boolean
}

export function ScheduleLaunchModal({ onSchedule, isLoading = false }: ScheduleLaunchModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [launchDate, setLaunchDate] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!launchDate) return
    
    setIsSubmitting(true)
    try {
      await onSchedule(launchDate)
      setIsOpen(false)
      setLaunchDate('')
    } catch (error) {
      console.error('Error scheduling launch:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const minDate = new Date().toISOString().split('T')[0] // Today

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          Schedule Launch
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Schedule Launch</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="launchDate" className="text-sm font-medium">
              Launch Date
            </Label>
            <Input
              id="launchDate"
              type="date"
              value={launchDate}
              onChange={(e) => setLaunchDate(e.target.value)}
              min={minDate}
              className="mt-1"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Select when you want your game to launch
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isSubmitting || isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!launchDate || isSubmitting || isLoading}
              className="flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Scheduling...
                </>
              ) : (
                <>
                  <Calendar className="w-4 h-4" />
                  Schedule Launch
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
