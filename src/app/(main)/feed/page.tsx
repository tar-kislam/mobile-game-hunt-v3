"use client"

import { Feed } from '@/components/social/Feed'
import Galaxy from '@/components/Galaxy'
import Shuffle from '@/components/Shuffle'

export default function FeedPage() {
  return (
    <div className="relative w-full min-h-screen overflow-hidden">
      <Galaxy
        mouseRepulsion={true}
        mouseInteraction={true}
        density={1.8}
        glowIntensity={0.7}
        saturation={0.9}
        hueShift={260}
        className="absolute inset-0 z-0"
      />
      <div
        className="absolute inset-0 z-5"
        style={{
          background: 'linear-gradient(to bottom, rgba(10,10,15,0.8), rgba(10,10,15,0.95))'
        }}
      />

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="mb-6 flex items-end justify-center">
            <span className="text-6xl mr-4 mb-2">📱</span>
            <Shuffle
              text="Your Feed"
              shuffleDirection="right"
              duration={0.35}
              animationMode="evenodd"
              shuffleTimes={1}
              ease="power3.out"
              stagger={0.03}
              threshold={0.1}
              loop={true}
              loopDelay={1}
              triggerOnce={false}
              triggerOnHover={false}
              respectReducedMotion={true}
              className="text-6xl font-bold text-white"
              tag="h1"
            />
          </div>
          <p className="text-xl text-indigo-200 max-w-2xl mx-auto">
            Stay up to date with the latest games and activity from the community you follow.
          </p>
        </div>

        <Feed />
      </div>
    </div>
  )
}
