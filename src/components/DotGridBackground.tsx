'use client'

import DotGrid from '@/components/DotGrid'

interface DotGridBackgroundProps {
  className?: string
  style?: React.CSSProperties
}

export default function DotGridBackground({ className, style }: DotGridBackgroundProps) {
  return (
    <div style={style} className={className}>
      <DotGrid 
        dotSize={12}
        gap={25}
        baseColor="#ffffff"
        activeColor="#00ff00"
        proximity={150}
        shockRadius={300}
        shockStrength={8}
        resistance={500}
        returnDuration={2}
        className="!p-0 !flex-none"
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  )
}
