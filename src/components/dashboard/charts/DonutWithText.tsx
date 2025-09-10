"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { TrendingUp } from 'lucide-react'
import {
  ResponsiveContainer,
  PieChart as RePieChart,
  Pie,
  Cell,
  Tooltip as ReTooltip,
} from 'recharts'

export type DonutDatum = { 
  name: string
  value: number
  color?: string
  icon?: React.ReactNode 
}

export type DonutWithTextProps = {
  title: string
  data: DonutDatum[]
  totalLabel: string
  showLegend?: boolean
  centerFormatter?: (sum: number) => string
  onSliceHoverText?: (d: DonutDatum, pct: number) => string
  className?: string
  trendingText?: string
  trendingColor?: 'green' | 'blue' | 'red' | 'yellow'
  isLoading?: boolean
  error?: string
}

const defaultColors = [
  '#8b5cf6', // Purple
  '#10b981', // Green
  '#ef4444', // Red
  '#06b6d4', // Cyan
  '#f59e0b', // Orange
  '#ec4899', // Pink
  '#6366f1', // Indigo
  '#84cc16', // Lime
]

export function DonutWithText({
  title,
  data,
  totalLabel,
  showLegend = true,
  centerFormatter,
  onSliceHoverText,
  className = '',
  trendingText,
  trendingColor = 'green',
  isLoading = false,
  error
}: DonutWithTextProps) {
  const [hoveredSlice, setHoveredSlice] = useState<DonutDatum | null>(null)

  if (isLoading) {
    return (
      <Card className={`bg-gray-800/50 border-purple-500/20 ${className}`}>
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <div className="w-5 h-5 bg-purple-400 rounded" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full bg-gray-600" />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className={`bg-gray-800/50 border-purple-500/20 ${className}`}>
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <div className="w-5 h-5 bg-purple-400 rounded" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-400 py-8">
            <p className="text-sm">{error}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!data || data.length === 0) {
    return (
      <Card className={`bg-gray-800/50 border-purple-500/20 ${className}`}>
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <div className="w-5 h-5 bg-purple-400 rounded" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-400 py-8">
            <p className="text-sm">No data available</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const total = data.reduce((sum, item) => sum + item.value, 0)
  const formattedTotal = centerFormatter ? centerFormatter(total) : total.toString()

  const handleSliceEnter = (data: any, index: number) => {
    if (data) {
      const percentage = total > 0 ? Math.round((data.value / total) * 100) : 0
      setHoveredSlice({
        name: data.name,
        value: data.value,
        color: data.color || defaultColors[index % defaultColors.length]
      })
    }
  }

  const handleSliceLeave = () => {
    setHoveredSlice(null)
  }

  const getTrendingColorClasses = (color: string) => {
    switch (color) {
      case 'green':
        return 'bg-green-500/10 border-green-500/20 text-green-400'
      case 'blue':
        return 'bg-blue-500/10 border-blue-500/20 text-blue-400'
      case 'red':
        return 'bg-red-500/10 border-red-500/20 text-red-400'
      case 'yellow':
        return 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400'
      default:
        return 'bg-green-500/10 border-green-500/20 text-green-400'
    }
  }

  return (
    <Card className={`bg-gray-800/50 border-purple-500/20 ${className}`}>
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <div className="w-5 h-5 bg-purple-400 rounded" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col lg:flex-row items-center gap-6">
          {/* Chart */}
          <div className="mx-auto aspect-square max-h-[250px] w-full max-w-[250px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <RePieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  strokeWidth={0}
                  onMouseEnter={handleSliceEnter}
                  onMouseLeave={handleSliceLeave}
                >
                  {data.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.color || defaultColors[index % defaultColors.length]} 
                    />
                  ))}
                </Pie>
                <ReTooltip content={() => null} />
              </RePieChart>
            </ResponsiveContainer>
            
            {/* Center Text */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center transition-all duration-300">
                {hoveredSlice ? (
                  <>
                    <div className="text-lg font-bold text-white mb-1">
                      {hoveredSlice.name}
                    </div>
                    <div className="text-sm text-gray-300">
                      {hoveredSlice.value} {totalLabel.toLowerCase()}
                    </div>
                    <div className="text-xs text-purple-400">
                      {total > 0 ? Math.round((hoveredSlice.value / total) * 100) : 0}%
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-2xl font-bold text-white">
                      {formattedTotal}
                    </div>
                    <div className="text-xs text-gray-400">Total {totalLabel}</div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Legend */}
          {showLegend && (
            <div className="flex-1 space-y-2">
              {data.map((item, index) => {
                const percentage = total > 0 ? Math.round((item.value / total) * 100) : 0
                return (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: item.color || defaultColors[index % defaultColors.length] }}
                      />
                      <span className="text-sm text-gray-300">{item.name}</span>
                    </div>
                    <div className="text-sm text-gray-400">
                      {item.value} ({percentage}%)
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Trending Note */}
        {trendingText && (
          <div className="mt-4 text-center">
            <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full border ${getTrendingColorClasses(trendingColor)}`}>
              <TrendingUp className="w-3 h-3" />
              <span className="text-xs">{trendingText}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
