"use client"

import PixelBlast from '@/components/effects/pixel-blast'
import FuzzyText from '@/components/effects/fuzzy-text'
import { useTheme } from 'next-themes'

export function CTASection() {
  const { resolvedTheme } = useTheme()
  const brandColor = resolvedTheme === 'dark' ? '#ffffff' : '#000000'

  return (
    <section className="relative w-full h-[500px] md:h-[600px] lg:h-[700px] overflow-hidden mb-12">
      {/* Pixel Blast Background */}
      <div className="absolute inset-0 z-0">
        <PixelBlast
          variant="square"
          pixelSize={4}
          color="#8B5CF6"
          patternScale={1.5}
          patternDensity={0.8}
          enableRipples={true}
          rippleIntensityScale={2.0}
          rippleThickness={0.2}
          rippleSpeed={0.6}
          speed={0.3}
          transparent={true}
          edgeFade={0.3}
          liquid={true}
          liquidStrength={0.05}
          liquidRadius={1.5}
          className="w-full h-full"
        />
      </div>
      
      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background/80 z-10" />
      
      {/* Content */}
      <div className="relative z-20 flex flex-col items-center justify-center h-full px-4 text-center">
        <div className="max-w-5xl mx-auto space-y-10">
          {/* Fuzzy Brand Title */}
          <div className="space-y-4">
            <div className="flex justify-center">
              <FuzzyText
                fontSize="clamp(2rem, 8vw, 6rem)"
                fontWeight={900}
                color={brandColor}
                enableHover={true}
                baseIntensity={0.2}
                hoverIntensity={0.5}
              >
                Mobile Game Hunt
              </FuzzyText>
            </div>
            <p className="text-lg md:text-xl lg:text-2xl text-muted-foreground max-w-3xl mx-auto">
              Discover the best mobile games, curated by the gaming community.
            </p>
          </div>

        </div>
      </div>
    </section>
  )
}
