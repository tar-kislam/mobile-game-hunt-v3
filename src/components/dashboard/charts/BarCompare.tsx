"use client"

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { BarChart3 } from 'lucide-react'
import {
  ResponsiveContainer,
  BarChart as ReBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ReTooltip,
  Legend,
} from 'recharts'

export type BarCompareDatum = {
  name: string
  votes: number
  follows: number
}

export type BarCompareProps = {
  title: string
  data: BarCompareDatum[]
  className?: string
  isLoading?: boolean
  error?: string
}

const CustomBarTooltip = ({ active, payload, label }: any) => {
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

export function BarCompare({
  title,
  data,
  className = '',
  isLoading = false,
  error
}: BarCompareProps) {
  if (isLoading) {
    return (
      <Card className={`bg-gray-800/50 border-purple-500/20 ${className}`}>
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-green-400" />
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
            <BarChart3 className="w-5 h-5 text-green-400" />
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
            <BarChart3 className="w-5 h-5 text-green-400" />
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
          <BarChart3 className="w-5 h-5 text-green-400" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ReBarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="name" 
                stroke="#6b7280" 
                fontSize={12}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis stroke="#6b7280" fontSize={12} />
              <ReTooltip content={<CustomBarTooltip />} />
              <Legend />
              <Bar 
                dataKey="votes" 
                name="Votes" 
                fill="#8b5cf6" 
                radius={[4, 4, 0, 0]}
              />
              <Bar 
                dataKey="follows" 
                name="Follows" 
                fill="#06b6d4" 
                radius={[4, 4, 0, 0]}
              />
            </ReBarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
