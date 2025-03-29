import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

interface ProgressCardProps {
  title: string
  value: string
  target: string
  progress: number
  remaining: string
  secondaryText?: string
  isNegative?: boolean
}

export function ProgressCard({
  title,
  value,
  target,
  progress,
  remaining,
  secondaryText,
  isNegative = false,
}: ProgressCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className="text-xs text-muted-foreground mt-1 mb-2">{remaining}</div>
        <Progress
          value={progress}
          className="h-2 bg-gray-200"
          indicatorClassName={isNegative ? "bg-red-500" : "bg-brand-blue"}
        />
        <div className="flex justify-between mt-2">
          <div className="text-xs text-muted-foreground">{target}</div>
          {secondaryText && <div className="text-xs text-muted-foreground">{secondaryText}</div>}
        </div>
      </CardContent>
    </Card>
  )
}

