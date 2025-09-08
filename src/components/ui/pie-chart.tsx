"use client"

import * as React from "react"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"

import { cn } from "@/lib/utils"

interface ChartData {
  name: string
  value: number
  color: string
}

interface PieChartProps {
  data: ChartData[]
  className?: string
  height?: number
  showLabels?: boolean
  showTooltip?: boolean
  interactive?: boolean
}

export function PieChartComponent({
  data,
  className,
  height = 300,
  showLabels = false,
  showTooltip = true,
  interactive = false,
}: PieChartProps) {
  return (
    <div className={cn("w-full", className)}>
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            outerRadius={80}
            dataKey="value"
            label={showLabels ? ({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%` : undefined}
            onClick={interactive ? (data, index) => console.log(data, index) : undefined}
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.color}
                className={interactive ? "cursor-pointer hover:opacity-80 transition-opacity" : ""}
              />
            ))}
          </Pie>
          {showTooltip && (
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1f2937', 
                border: '1px solid #6b7280',
                borderRadius: '8px',
                color: '#ffffff'
              }}
            />
          )}
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

// Pie Chart with Label List
export function PieChartLabelList({
  data,
  className,
  height = 300,
}: {
  data: ChartData[]
  className?: string
  height?: number
}) {
  return (
    <div className={cn("w-full", className)}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ResponsiveContainer width="100%" height={height}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              outerRadius={60}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1f2937', 
                border: '1px solid #6b7280',
                borderRadius: '8px',
                color: '#ffffff'
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        
        <div className="space-y-2">
          {data.map((item, index) => (
            <div key={index} className="flex items-center justify-between p-2 bg-gray-700/50 rounded-lg">
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-white text-sm font-medium">{item.name}</span>
              </div>
              <span className="text-gray-300 text-sm">
                {item.value} ({((item.value / data.reduce((sum, d) => sum + d.value, 0)) * 100).toFixed(1)}%)
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Interactive Pie Chart
export function InteractivePieChart({
  data,
  className,
  height = 300,
}: {
  data: ChartData[]
  className?: string
  height?: number
}) {
  const [activeIndex, setActiveIndex] = React.useState<number | null>(null)

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index)
  }

  const onPieLeave = () => {
    setActiveIndex(null)
  }

  return (
    <div className={cn("w-full", className)}>
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            outerRadius={80}
            dataKey="value"
            onMouseEnter={onPieEnter}
            onMouseLeave={onPieLeave}
            className="cursor-pointer"
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.color}
                className="transition-all duration-200"
                style={{
                  filter: activeIndex === index ? 'brightness(1.2)' : 'brightness(1)',
                  transform: activeIndex === index ? 'scale(1.05)' : 'scale(1)',
                }}
              />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#1f2937', 
              border: '1px solid #6b7280',
              borderRadius: '8px',
              color: '#ffffff'
            }}
            formatter={(value: number, name: string) => [
              `${value} (${((value / data.reduce((sum, d) => sum + d.value, 0)) * 100).toFixed(1)}%)`,
              name
            ]}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
