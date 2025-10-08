"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import ShinyText from "@/components/ShinyText"
import { ArrowLeftIcon, HomeIcon, GamepadIcon } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-[#121225] to-[#050509] bg-[radial-gradient(80%_80%_at_0%_0%,rgba(124,58,237,0.22),transparent_60%),radial-gradient(80%_80%_at_100%_100%,rgba(6,182,212,0.18),transparent_60%)] flex items-center justify-center px-4">
      {/* Particles Background */}
      <div className="fixed inset-0 z-0 opacity-30">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(139,92,246,0.1),transparent_50%),radial-gradient(circle_at_75%_75%,rgba(56,189,248,0.1),transparent_50%)]"></div>
      </div>

      <div className="relative z-10 max-w-2xl mx-auto text-center">
        {/* Animated 404 */}
        <div className="mb-8">
          <ShinyText className="text-8xl md:text-9xl font-bold mb-4">
            404
          </ShinyText>
          <div className="text-2xl md:text-3xl font-semibold text-gray-300 mb-2">
            Page Not Found
          </div>
          <div className="text-lg text-gray-400 max-w-lg mx-auto leading-relaxed">
            Oops! Looks like this page got lost in the game world. Don't worry, 
            let's get you back on track.
          </div>
        </div>

        {/* Error illustration */}
        <div className="mb-12">
          <div className="mb-4">
            <img src="/logo/logo-gamepad.webp" alt="Game" className="w-32 h-32" />
          </div>
          <p className="text-gray-400 text-sm">
            Even the best games have bugs... this is just a navigation bug!
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button asChild size="lg" className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white rounded-2xl shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all duration-300 hover:scale-105 px-8 py-3">
            <Link href="/">
              <HomeIcon className="w-5 h-5 mr-2" />
              Go Home
            </Link>
          </Button>
          
          <Button asChild variant="outline" size="lg" className="border-purple-500/50 text-purple-300 hover:bg-purple-500/10 hover:text-white rounded-2xl shadow-lg hover:shadow-purple-500/25 transition-all duration-300 hover:scale-105 px-8 py-3">
            <Link href="/products">
              <GamepadIcon className="w-5 h-5 mr-2" />
              Browse Games
            </Link>
          </Button>
        </div>

        {/* Additional help */}
        <div className="mt-12 pt-8 border-t border-gray-700/50">
          <p className="text-sm text-gray-500 mb-4">
            Need help finding something specific?
          </p>
          <div className="flex flex-wrap justify-center gap-3 text-sm">
            <Link href="/leaderboard" className="text-purple-400 hover:text-purple-300 transition-colors underline">
              Leaderboard
            </Link>
            <span className="text-gray-600">•</span>
            <Link href="/community" className="text-purple-400 hover:text-purple-300 transition-colors underline">
              Community
            </Link>
            <span className="text-gray-600">•</span>
            <Link href="/submit" className="text-purple-400 hover:text-purple-300 transition-colors underline">
              Submit Game
            </Link>
            <span className="text-gray-600">•</span>
            <Link href="/about" className="text-purple-400 hover:text-purple-300 transition-colors underline">
              About Us
            </Link>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-10 right-10 w-20 h-20 bg-purple-500/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-10 left-10 w-16 h-16 bg-blue-500/10 rounded-full blur-xl"></div>
      </div>
    </div>
  )
}

