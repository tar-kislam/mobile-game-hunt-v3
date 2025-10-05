'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X, Plus } from 'lucide-react'
import { toast } from 'sonner'

interface DraftPoll {
  options: string[]
  duration: { days: number; hours: number; minutes: number }
}

interface PollModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (draftPoll: DraftPoll) => void
  initialData?: DraftPoll
}

export function PollModal({ isOpen, onClose, onSave, initialData }: PollModalProps) {
  const [options, setOptions] = useState<string[]>(
    initialData?.options || ['', '']
  )
  const [duration, setDuration] = useState<{ days: number; hours: number; minutes: number }>(
    initialData?.duration || { days: 1, hours: 0, minutes: 0 }
  )

  const addOption = () => {
    if (options.length < 5) {
      setOptions([...options, ''])
    }
  }

  const removeOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index))
    }
  }

  const updateOption = (index: number, text: string) => {
    const newOptions = [...options]
    newOptions[index] = text.trim()
    setOptions(newOptions)
  }

  const updateDuration = (field: 'days' | 'hours' | 'minutes', value: number) => {
    setDuration(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSave = () => {
    // Validation - check for valid options
    const validOptions = options.filter(option => option.trim())
    
    if (validOptions.length < 2) {
      toast.error('Please provide at least 2 options')
      return
    }

    // Check for duplicates
    const uniqueOptions = [...new Set(validOptions)]
    if (uniqueOptions.length !== validOptions.length) {
      toast.error('Please remove duplicate options')
      return
    }

    // Check option length
    for (const option of validOptions) {
      if (option.length > 50) {
        toast.error('Each option must be 50 characters or less')
        return
      }
    }

    // Check duration is not zero
    if (duration.days === 0 && duration.hours === 0 && duration.minutes === 0) {
      toast.error('Please set a duration for the poll')
      return
    }

    const draftPoll: DraftPoll = {
      options: validOptions,
      duration
    }

    onSave(draftPoll)
    onClose()
  }

  const handleClose = () => {
    // Reset form when closing
    setOptions(['', ''])
    setDuration({ days: 1, hours: 0, minutes: 0 })
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-gray-900 border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
            Create Poll
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Options */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-gray-300">
              Options *
            </Label>
            {options.map((option, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  value={option}
                  onChange={(e) => updateOption(index, e.target.value)}
                  placeholder={`Option ${index + 1}`}
                  maxLength={50}
                  className="bg-neutral-900 border-gray-600 focus:border-purple-500 rounded-lg"
                />
                {options.length > 2 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeOption(index)}
                    className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            
            {options.length < 5 && (
              <Button
                type="button"
                variant="outline"
                onClick={addOption}
                className="w-full border-gray-600 text-gray-300 hover:bg-purple-500/10 hover:border-purple-500"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Option
              </Button>
            )}
          </div>

          {/* Duration Selector */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-gray-300">
              Duration
            </Label>
            <div className="grid grid-cols-3 gap-3">
              {/* Days */}
              <div className="space-y-1">
                <Label className="text-xs text-gray-400">Days</Label>
                <Select 
                  value={duration.days.toString()} 
                  onValueChange={(value) => updateDuration('days', parseInt(value))}
                >
                  <SelectTrigger className="bg-neutral-900 border-gray-600 focus:border-purple-500 rounded-lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    {Array.from({ length: 8 }, (_, i) => (
                      <SelectItem key={i} value={i.toString()} className="text-gray-300 hover:bg-gray-700">
                        {i}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Hours */}
              <div className="space-y-1">
                <Label className="text-xs text-gray-400">Hours</Label>
                <Select 
                  value={duration.hours.toString()} 
                  onValueChange={(value) => updateDuration('hours', parseInt(value))}
                >
                  <SelectTrigger className="bg-neutral-900 border-gray-600 focus:border-purple-500 rounded-lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    {Array.from({ length: 24 }, (_, i) => (
                      <SelectItem key={i} value={i.toString()} className="text-gray-300 hover:bg-gray-700">
                        {i}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Minutes */}
              <div className="space-y-1">
                <Label className="text-xs text-gray-400">Minutes</Label>
                <Select 
                  value={duration.minutes.toString()} 
                  onValueChange={(value) => updateDuration('minutes', parseInt(value))}
                >
                  <SelectTrigger className="bg-neutral-900 border-gray-600 focus:border-purple-500 rounded-lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    {Array.from({ length: 60 }, (_, i) => (
                      <SelectItem key={i} value={i.toString()} className="text-gray-300 hover:bg-gray-700">
                        {i}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
            >
              Save Poll
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
