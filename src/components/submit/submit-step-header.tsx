"use client"

import { ReactNode } from 'react'

interface SubmitStepHeaderProps {
  title: string
  description: string
  action?: ReactNode
}

export function SubmitStepHeader({ title, description, action }: SubmitStepHeaderProps) {
  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div>
        <h2 className="text-2xl font-semibold text-foreground">{title}</h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}





