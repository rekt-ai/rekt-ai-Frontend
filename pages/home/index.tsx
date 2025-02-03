"use client"

import { TournamentCard } from "@/components/tournament-card/tournament-card"
import { tournaments } from "@/types/tournament"

export default function Home() {
  return (
    <div className="lg:px-[10vw] py-12 flex flex-col justify-start space-y-8">
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-4xl font-bold font-mono tracking-tight text-slate-light">Available Tournaments</h1>
        <p className="text-muted-foreground max-w-[600px] mx-auto">
          Choose your prediction strategy, compete with AI, and win the prize pool. Higher difficulty means bigger
          rewards!
        </p>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {tournaments.map((tournament) => (
          <TournamentCard key={tournament.id} {...tournament} />
        ))}
      </div>
    </div>
  )
}