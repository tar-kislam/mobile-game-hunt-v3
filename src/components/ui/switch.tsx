"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

type SwitchProps = {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  disabled?: boolean
  id?: string
  className?: string
}

export function Switch({ checked, onCheckedChange, disabled, id, className }: SwitchProps) {
  return (
    <button
      type="button"
      id={id}
      role="switch"
      aria-checked={checked}
      aria-disabled={disabled}
      disabled={disabled}
      onClick={() => !disabled && onCheckedChange(!checked)}
      className={cn(
        "inline-flex h-6 w-11 items-center rounded-full transition-all",
        "border border-white/10",
        checked ? "bg-violet-600 shadow-[0_0_10px_rgba(139,92,246,0.6)]" : "bg-muted/40",
        disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer hover:brightness-110",
        className
      )}
    >
      <span
        className={cn(
          "inline-block h-5 w-5 transform rounded-full bg-white transition-transform",
          checked ? "translate-x-5" : "translate-x-1"
        )}
      />
    </button>
  )
}

export default Switch


