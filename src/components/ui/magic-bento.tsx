"use client"

import React, { HTMLAttributes, PropsWithChildren, useMemo, useRef, useState } from "react"

type MagicBentoItem = {
  id: string
  className?: string
  children: React.ReactNode
}

export type MagicBentoProps = {
  items: MagicBentoItem[]
  textAutoHide?: boolean
  enableStars?: boolean
  enableSpotlight?: boolean
  enableBorderGlow?: boolean
  disableAnimations?: boolean
  spotlightRadius?: number
  particleCount?: number
  enableTilt?: boolean
  glowColor?: string // e.g. "132, 0, 255"
  clickEffect?: boolean
  enableMagnetism?: boolean
} & HTMLAttributes<HTMLDivElement>

export default function MagicBento({
  items,
  textAutoHide = true,
  enableStars = true,
  enableSpotlight = true,
  enableBorderGlow = true,
  disableAnimations = false,
  spotlightRadius = 300,
  particleCount = 12,
  enableTilt = true,
  glowColor = "132, 0, 255",
  clickEffect = true,
  enableMagnetism = true,
  className = "",
  ...rest
}: MagicBentoProps) {
  return (
    <div
      className={
        "grid grid-cols-1 md:grid-cols-3 gap-4 relative auto-rows-[140px] md:auto-rows-[220px] " +
        (className || "")
      }
      {...rest}
    >
      {items.map((item) => (
        <MagicBentoCard
          key={item.id}
          textAutoHide={textAutoHide}
          enableStars={enableStars}
          enableSpotlight={enableSpotlight}
          enableBorderGlow={enableBorderGlow}
          disableAnimations={disableAnimations}
          spotlightRadius={spotlightRadius}
          particleCount={particleCount}
          enableTilt={enableTilt}
          glowColor={glowColor}
          clickEffect={clickEffect}
          enableMagnetism={enableMagnetism}
          className={item.className}
        >
          {item.children}
        </MagicBentoCard>
      ))}
    </div>
  )
}

type CardProps = PropsWithChildren<{
  className?: string
  textAutoHide: boolean
  enableStars: boolean
  enableSpotlight: boolean
  enableBorderGlow: boolean
  disableAnimations: boolean
  spotlightRadius: number
  particleCount: number
  enableTilt: boolean
  glowColor: string
  clickEffect: boolean
  enableMagnetism: boolean
}>

function MagicBentoCard({
  children,
  className,
  textAutoHide,
  enableStars,
  enableSpotlight,
  enableBorderGlow,
  disableAnimations,
  spotlightRadius,
  particleCount,
  enableTilt,
  glowColor,
  clickEffect,
  enableMagnetism,
}: CardProps) {
  const cardRef = useRef<HTMLDivElement | null>(null)
  const [pos, setPos] = useState({ x: 0, y: 0 })

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!enableSpotlight && !enableBorderGlow && !enableTilt && !enableMagnetism) return
    const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    setPos({ x, y })
    if (enableTilt) {
      const midX = rect.width / 2
      const midY = rect.height / 2
      const rotY = ((x - midX) / midX) * -6
      const rotX = ((y - midY) / midY) * 6
      e.currentTarget.style.transform = `translate3d(0,0,0) rotateX(${rotX}deg) rotateY(${rotY}deg)`
    }
    if (enableMagnetism) {
      const dx = (x - rect.width / 2) * 0.02
      const dy = (y - rect.height / 2) * 0.02
      e.currentTarget.style.translate = `${dx}px ${dy}px`
    }
  }

  const handleLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    e.currentTarget.style.transform = ""
    e.currentTarget.style.translate = ""
  }

  const clickRipple = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!clickEffect) return
    const target = e.currentTarget
    const circle = document.createElement("span")
    circle.className = "magic-bento-ripple"
    const size = Math.max(target.clientWidth, target.clientHeight)
    circle.style.width = circle.style.height = `${size}px`
    circle.style.left = `${e.nativeEvent.offsetX - size / 2}px`
    circle.style.top = `${e.nativeEvent.offsetY - size / 2}px`
    target.appendChild(circle)
    setTimeout(() => circle.remove(), 600)
  }

  const spotlightStyle = useMemo(() => ({
    background: enableSpotlight
      ? `radial-gradient(${spotlightRadius}px ${spotlightRadius}px at ${pos.x}px ${pos.y}px, rgba(${glowColor},0.25), transparent 60%)`
      : undefined,
  }), [pos.x, pos.y, enableSpotlight, glowColor, spotlightRadius])

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      onClick={clickRipple}
      style={spotlightStyle as React.CSSProperties}
      className={[
        "relative rounded-2xl border border-white/10 bg-gray-900/40 p-5 transition-all duration-300",
        enableBorderGlow ? `before:absolute before:inset-0 before:rounded-2xl before:pointer-events-none before:[mask:linear-gradient(white,transparent)] before:opacity-0 hover:before:opacity-100 before:transition-opacity before:[background:radial-gradient(120px_120px_at_var(--x)_var(--y),rgba(${glowColor},0.4),transparent_40%)]` : "",
        textAutoHide ? "hover:[&_.text-auto-hide]:opacity-0" : "",
        className || "",
      ].join(" ")}
      onMouseEnter={(e) => {
        // store custom props for CSS before pseudo
        (e.currentTarget as any).style.setProperty("--x", `${pos.x}px`)
        (e.currentTarget as any).style.setProperty("--y", `${pos.y}px`)
      }}
    >
      {enableStars && !disableAnimations ? (
        <Stars count={particleCount} color={`rgba(${glowColor},0.5)`} />
      ) : null}
      {children}
      <style jsx>{`
        .magic-bento-ripple{
          position:absolute; border-radius:9999px; transform:scale(0); opacity:.6;
          background: rgba(${glowColor},.35); animation: ripple .6s ease-out forwards;
          pointer-events:none
        }
        @keyframes ripple{to{transform:scale(1.5);opacity:0}}
      `}</style>
    </div>
  )
}

function Stars({ count = 12, color = "rgba(132,0,255,0.5)" }: { count?: number; color?: string }) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {Array.from({ length: count }).map((_, i) => (
        <span
          key={i}
          className="absolute w-0.5 h-0.5 rounded-full animate-pulse"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            background: color,
            animationDuration: `${1.5 + Math.random()}s`,
            opacity: 0.7,
          }}
        />
      ))}
    </div>
  )
}


