"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

// Chart configuration type
export interface ChartConfig {
  [key: string]: {
    label: string
    color?: string
  }
}

// Chart container component
export interface ChartContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  config: ChartConfig
}

const ChartContainer = React.forwardRef<HTMLDivElement, ChartContainerProps>(
  ({ className, config, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("w-full", className)}
        style={{
          "--chart-1": "hsl(var(--chart-1))",
          "--chart-2": "hsl(var(--chart-2))",
          "--chart-3": "hsl(var(--chart-3))",
          "--chart-4": "hsl(var(--chart-4))",
          "--chart-5": "hsl(var(--chart-5))",
        } as React.CSSProperties}
        {...props}
      />
    )
  }
)
ChartContainer.displayName = "ChartContainer"

// Chart tooltip component
export interface ChartTooltipProps {
  cursor?: boolean
  content?: React.ReactNode
}

const ChartTooltip = ({ cursor = true, content }: ChartTooltipProps) => {
  return null // This is handled by Recharts Tooltip component
}

// Chart tooltip content component
export interface ChartTooltipContentProps {
  hideLabel?: boolean
  hideIndicator?: boolean
  indicator?: "line" | "dot" | "dashed"
  nameKey?: string
  labelKey?: string
}

const ChartTooltipContent = ({ 
  hideLabel = false, 
  hideIndicator = false,
  indicator = "dot",
  nameKey,
  labelKey 
}: ChartTooltipContentProps) => {
  return null // This is handled by Recharts Tooltip content
}

export { ChartContainer, ChartTooltip, ChartTooltipContent }