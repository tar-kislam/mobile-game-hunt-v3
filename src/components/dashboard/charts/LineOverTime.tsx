"use client"

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { TrendingUp } from 'lucide-react'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ReTooltip,
} from 'recharts'

export type LineOverTimeDatum = {
  date: string
  internal: number
  external: number
}

export type LineOverTimeProps = {
  title: string
  data: LineOverTimeDatum[]
  className?: string
  isLoading?: boolean
  error?: string
}

const CustomLineTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-800/95 border border-purple-500/30 rounded-lg p-3 shadow-lg backdrop-blur-sm">
        <div className="font-semibold text-white mb-2">{label}</div>
        <div className="space-y-1">
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-sm text-gray-300">
                {entry.dataKey}: {entry.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    )
  }
  return null
}

export function LineOverTime({
  title,
  data,
  className = '',
  isLoading = false,
  error
}: LineOverTimeProps) {
  if (isLoading) {
    return (
      <Card className={`bg-gray-800/50 border-purple-500/20 ${className}`}>
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-red-400" />
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
            <TrendingUp className="w-5 h-5 text-red-400" />
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
            <TrendingUp className="w-5 h-5 text-red-400" />
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

  return (
    <Card className={`bg-gray-800/50 border-purple-500/20 ${className}`}>
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-red-400" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorInternal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1} />
                </linearGradient>
                <linearGradient id="colorExternal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="date" 
                stroke="#6b7280" 
                fontSize={12}
                tickFormatter={(value) => {
                  const date = new Date(value)
                  return `${date.getMonth() + 1}/${date.getDate()}`
                }}
              />
              <YAxis stroke="#6b7280" fontSize={12} />
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <ReTooltip content={<CustomLineTooltip />} />
              <Area 
                type="monotone" 
                dataKey="internal" 
                stroke="#8b5cf6" 
                fill="url(#colorInternal)" 
                strokeWidth={2}
                name="Internal"
              />
              <Area 
                type="monotone" 
                dataKey="external" 
                stroke="#06b6d4" 
                fill="url(#colorExternal)" 
                strokeWidth={2}
                name="External"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
