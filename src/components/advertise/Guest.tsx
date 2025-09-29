"use client"

import React from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function Guest() {
  return (
    <div className="w-full flex items-center justify-center p-4">
      <div className="text-center space-y-8 max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="space-y-4"
        >
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent text-center">
            Welcome Guest — Sign up to advertise your game.
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8, ease: "easeOut" }}
          className="space-y-4"
        >
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              asChild
              size="lg" 
              className="rounded-2xl shadow-soft bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8"
            >
              <Link href="/auth/signup">
                Sign Up
              </Link>
            </Button>

            <Button 
              asChild
              variant="outline"
              size="lg"
              className="rounded-2xl border-gray-600 text-gray-300 hover:text-white hover:border-purple-500 px-8"
            >
              <Link href="/auth/signin">
                Sign In
              </Link>
            </Button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 1.0 }}
          className="text-center"
        >
          <p className="text-gray-500 text-sm">
            Join thousands of game developers promoting their games on Mobile Game Hunt
          </p>
        </motion.div>
      </div>
    </div>
  )
}
