import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Users } from "lucide-react"

interface PredictionCardProps {
  title: string
  description: string
  prizePool: number
  difficulty: "EASY" | "MEDIUM" | "HARD"
  participants: number
  aiAccuracy: number
  tags: string[]
  isCompleted?: boolean
}

export function PredictionCard({
  title,
  description,
  prizePool,
  difficulty,
  participants,
  aiAccuracy,
  tags,
  isCompleted = false,
}: PredictionCardProps) {
  return (
    <Card className="overflow-hidden bg-secondary">
      <CardHeader className="relative">
        {difficulty && (
          <Badge variant="secondary" className="absolute top-2 right-2 bg-primary/20 text-primary">
            {difficulty}
          </Badge>
        )}
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{description}</p>
        <div className="flex justify-between items-center">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Prize Pool</p>
            <p className="text-lg font-bold text-primary">${prizePool.toLocaleString()}</p>
          </div>
          <div className="space-y-1 text-right">
            <p className="text-xs text-muted-foreground">AI Accuracy</p>
            <p className="text-lg font-bold text-foreground">{aiAccuracy}%</p>
          </div>
        </div>
        <div className="flex gap-2">
          {tags.map((tag) => (
            <Badge key={tag} variant="outline" className="bg-muted">
              {tag}
            </Badge>
          ))}
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="w-4 h-4" />
          <span>{participants} participants</span>
        </div>
      </CardContent>
      <CardFooter className="bg-muted/20 pt-6">
        <Button className="w-full bg-primary hover:bg-primary/90" disabled={isCompleted}>
          {isCompleted ? "Tournament Ended" : "Join Tournament"}
        </Button>
      </CardFooter>
    </Card>
  )
}

