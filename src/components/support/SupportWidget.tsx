'use client';

import React, { useState } from 'react';
// Note: Using a plain img tag for guaranteed local rendering of webp in this spot
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Send, CheckCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

interface SupportFormData {
  email: string;
  message: string;
}

export function SupportWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<SupportFormData>({
    email: '',
    message: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.message) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/support', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        // Success animation and close
        toast.success('Thanks! We\'ll get back to you soon 👾', {
          duration: 4000,
        });
        
        // Reset form and close
        setFormData({ email: '', message: '' });
        setIsOpen(false);
      } else {
        throw new Error('Failed to send message');
      }
    } catch (error) {
      toast.error('Failed to send message. Please try again.');
      console.error('Support form error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof SupportFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Floating Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex h-14 w-14 items-center justify-center rounded-full bg-[#6c63ff]/20 hover:bg-[#6c63ff]/40 backdrop-blur-md border border-[#6c63ff]/30 shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ 
          type: "spring", 
          stiffness: 260, 
          damping: 20,
          delay: 0.5 
        }}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X className="h-6 w-6 text-white" />
            </motion.div>
          ) : (
            <motion.div
              key="message"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <MessageCircle className="h-6 w-6 text-white" />
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Glow effect */}
        <div className="absolute inset-0 rounded-full bg-[#6c63ff]/20 blur-md -z-10" />
      </motion.button>

      {/* Support Form Card */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ 
              type: "spring", 
              stiffness: 300, 
              damping: 30,
              duration: 0.25 
            }}
            className="absolute bottom-16 right-0 w-80 rounded-2xl border border-[#6c63ff]/20 bg-[#0e0e12] backdrop-blur-md shadow-2xl p-6"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="h-[52px] w-[52px] rounded-lg bg-transparent flex items-center justify-center overflow-hidden">
                  <img
                    src="/emojis/contact-logo.webp"
                    alt="Support"
                    width={52}
                    height={52}
                    className="object-contain select-none pointer-events-none"
                    draggable={false}
                  />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-lg">Support</h3>
                  <p className="text-gray-400 text-sm">We're here to help!</p>
                </div>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="support-email" className="block text-sm font-medium text-gray-300 mb-2">
                  Email
                </label>
                <Input
                  id="support-email"
                  type="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="bg-[#1a1a1f]/50 border-[#6c63ff]/30 text-white placeholder:text-gray-500 focus:border-[#6c63ff]/60 focus:ring-[#6c63ff]/20"
                  required
                />
              </div>

              <div>
                <label htmlFor="support-message" className="block text-sm font-medium text-gray-300 mb-2">
                  Message
                </label>
                <Textarea
                  id="support-message"
                  placeholder="How can we help you?"
                  value={formData.message}
                  onChange={(e) => handleInputChange('message', e.target.value)}
                  className="bg-[#1a1a1f]/50 border-[#6c63ff]/30 text-white placeholder:text-gray-500 focus:border-[#6c63ff]/60 focus:ring-[#6c63ff]/20 min-h-[100px] resize-none"
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-[#6c63ff] to-[#8b5cf6] hover:from-[#5a52ff] hover:to-[#7c3aed] text-white font-medium py-2.5 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <motion.div
                    className="flex items-center gap-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Sending...
                  </motion.div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Send className="h-4 w-4" />
                    Send Message
                  </div>
                )}
              </Button>
            </form>

            {/* Footer */}
            <div className="mt-4 pt-4 border-t border-[#6c63ff]/10">
              <p className="text-xs text-gray-500 text-center">
                Usually respond within 24 hours
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
