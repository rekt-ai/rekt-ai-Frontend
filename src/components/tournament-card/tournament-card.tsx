import { useRouter } from 'next/router'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Brain, Trophy, Users } from "lucide-react"
import { TournamentData } from '@/types/tournament'
// import type { TournamentData } from "@/types/tournament"

export function TournamentCard(props: TournamentData) {
    const router = useRouter()

    return (
        <Card className="group relative overflow-hidden border-slate-light/10 bg-gradient-to-b from-card to-card/50 transition-all duration-300 hover:shadow-neon">
            <div className="absolute inset-0 bg-blockchain-grid opacity-5"></div>
            <div className="absolute inset-0 bg-gradient-to-b from-slate-light/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
            <CardHeader className="relative border-b border-slate-light/10 bg-cyber-glow">
                <div className="flex items-center justify-between">
                    <CardTitle className="line-clamp-1 font-mono text-slate-light">{props.title}</CardTitle>
                    <Badge
                        variant={props.difficulty === "EASY" ? "secondary" : props.difficulty === "MEDIUM" ? "default" : "destructive"}
                        className="font-mono"
                    >
                        {props.difficulty}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="relative p-6">
                <div className="flex flex-col space-y-6">
                    <p className="text-sm text-muted-foreground leading-relaxed">{props.description}</p>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                        <div className="flex flex-col items-center space-y-2 rounded-lg border border-slate-light/10 bg-slate-dark/10 p-3 transition-colors hover:bg-slate-dark/20">
                            <Trophy className="h-4 w-4 text-slate-light" />
                            <span className="font-mono text-slate-light">${props.prizePool.toLocaleString()}</span>
                        </div>
                        <div className="flex flex-col items-center space-y-2 rounded-lg border border-slate-light/10 bg-slate-dark/10 p-3 transition-colors hover:bg-slate-dark/20">
                            <Users className="h-4 w-4 text-slate-light" />
                            <span className="font-mono">{props.participants}</span>
                        </div>
                        <div className="flex flex-col items-center space-y-2 rounded-lg border border-slate-light/10 bg-slate-dark/10 p-3 transition-colors hover:bg-slate-dark/20">
                            <Brain className="h-4 w-4 text-slate-light" />
                            <span className="font-mono">{props.aiAccuracy}%</span>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {props.tags.map((tag: string) => (
                            <Badge
                                key={tag}
                                variant="secondary"
                                className="font-mono text-xs bg-slate-dark/20 hover:bg-slate-dark/30"
                            >
                                {tag}
                            </Badge>
                        ))}
                    </div>
                    <Button
                        onClick={() => router.push(`/home/${props.id}`)}
                        className="w-full bg-slate-light font-mono text-background transition-all duration-300 hover:bg-slate-dark hover:shadow-inner-glow"
                    >
                        Enter Tournament
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}