"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import ShinyText from '@/components/ui/shiny-text'
import { toast } from 'sonner'

interface NewsletterModalProps {
  isOpen: boolean
  onClose: () => void
}

export function NewsletterModal({ isOpen, onClose }: NewsletterModalProps) {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email.trim()) {
      toast.error('Please enter your email address')
      return
    }

    if (!validateEmail(email)) {
      toast.error('Please enter a valid email address')
      return
    }

    setIsSubmitting(true)
    
    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success("You've successfully subscribed to the newsletter!")
        setEmail('')
        // Close modal after 2 seconds
        setTimeout(() => {
          onClose()
        }, 2000)
      } else {
        toast.error(data.error || 'Something went wrong. Please try again.')
      }
    } catch (error) {
      console.error('Newsletter subscription error:', error)
      toast.error('Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] bg-black border-gray-700">
        <DialogHeader className="text-center space-y-8">
          <DialogTitle className="sr-only">Join Mobile Game Hunt Newsletter</DialogTitle>
          {/* Logo + Text Section */}
          <div className="flex flex-col sm:flex-row items-center gap-4">
            {/* Logo */}
            <div className="flex-shrink-0">
              <img
                src="/logo/mgh.png"
                alt="Mobile Game Hunt Logo"
                className="w-24 h-24 object-contain"
              />
            </div>
            
            {/* Text Content */}
            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-xl font-bold text-white mb-2">
                Join Mobile Game Hunt
              </h2>
              <p className="text-base text-gray-300">
                Be part of the beginning. Get exclusive access, shape new features, and discover the next big mobile games!
              </p>
            </div>
          </div>
        </DialogHeader>
        
        <div className="space-y-10">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="flex flex-col sm:flex-row gap-6">
              <div className="flex-1 relative">
                {/* Corner decorations */}
                <div className="absolute top-0 left-0 w-3 h-3 border-l-2 border-t-2 border-purple-400 animate-pulse"></div>
                <div className="absolute top-0 right-0 w-3 h-3 border-r-2 border-t-2 border-purple-400 animate-pulse"></div>
                <div className="absolute bottom-0 left-0 w-3 h-3 border-l-2 border-b-2 border-purple-400 animate-pulse"></div>
                <div className="absolute bottom-0 right-0 w-3 h-3 border-r-2 border-b-2 border-purple-400 animate-pulse"></div>
                
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full p-4 bg-transparent outline-none text-white placeholder:text-gray-300 rounded-md focus:shadow-[0_0_25px_rgba(177,158,239,0.8)] hover:shadow-[0_0_15px_rgba(177,158,239,0.4)] transition-all duration-500"
                  style={{
                    background: 'rgba(0, 0, 0, 0.5)',
                    border: 'none',
                    backdropFilter: 'blur(15px)',
                  }}
                  required
                />
              </div>
              
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-4 font-bold rounded-md transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(177,158,239,0.8)] focus:outline-none focus:ring-2 focus:ring-purple-400 active:scale-95 text-white"
                style={{
                  background: 'rgba(60, 41, 100, 1)',
                  border: '1px solid rgba(177, 158, 239, 0.5)',
                  boxShadow: '0 0 15px rgba(177, 158, 239, 0.4)',
                  backdropFilter: 'blur(10px)',
                }}
              >
                <ShinyText 
                  text={isSubmitting ? 'Joining...' : 'Join Now'} 
                  disabled={isSubmitting} 
                  speed={3} 
                  className="cta-button" 
                />
              </button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
