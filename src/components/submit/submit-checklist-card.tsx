"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface SubmitChecklistCardProps {
  missingFields: string[]
  completion: number
}

export function SubmitChecklistCard({ missingFields, completion }: SubmitChecklistCardProps) {
  if (!missingFields.length) {
    return (
      <Card className="border-dashed border-primary/40 bg-muted/20">
        <CardHeader>
          <CardTitle className="text-base">All set!</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          You’ve completed every required field. Feel free to review your details and submit when ready.
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-border/60 bg-card/70 backdrop-blur">
      <CardHeader>
        <CardTitle className="text-base">Required items remaining</CardTitle>
        <p className="text-sm text-muted-foreground">
          Complete the following {missingFields.length} field{missingFields.length > 1 ? "s" : ""} to reach
          100%.
        </p>
        <p className="text-xs text-muted-foreground">Current completion: {completion}%</p>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2 text-sm text-muted-foreground">
          {missingFields.map((field) => (
            <li key={field} className="flex items-center gap-2">
              <span className="inline-block h-2 w-2 rounded-full bg-amber-500" />
              <span>{field}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}

