import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, Trophy, Users } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { tournaments } from '@/types/tournament';

interface TournamentEntryProps {
  tournamentId: string;
}

export default function TournamentEntry({ tournamentId }: TournamentEntryProps) {
  const [predictionValue, setPredictionValue] = useState('');
  const [confidence, setConfidence] = useState(50);
  
  const tournament = tournaments.find(t => t.id === tournamentId);

  if (!tournament) {
    return <div>Tournament not found</div>;
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <Card className="max-w-2xl mx-auto border-slate-light/10 bg-gradient-to-b from-card to-card/50">
        <div className="absolute inset-0 bg-blockchain-grid opacity-5"></div>
        <CardHeader className="border-b border-slate-light/10 bg-cyber-glow">
          <CardTitle className="font-mono text-slate-light">{tournament.title}</CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="grid gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-light">Your Prediction</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={predictionValue}
                  onChange={(e) => setPredictionValue(e.target.value)}
                  className="flex-1 rounded-md border border-slate-light/10 bg-slate-dark/10 p-2 font-mono text-slate-light focus:border-slate-light focus:outline-none"
                  placeholder={tournament.placeholder}
                />
                <span className="flex items-center font-mono text-slate-light">{tournament.currency}</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-light">Confidence Level</label>
              <input
                type="range"
                min="0"
                max="100"
                value={confidence}
                onChange={(e) => setConfidence(parseInt(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between font-mono text-xs text-slate-light">
                <span>0%</span>
                <span>{confidence}%</span>
                <span>100%</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="flex flex-col items-center space-y-2 rounded-lg border border-slate-light/10 bg-slate-dark/10 p-3">
              <Trophy className="h-4 w-4 text-slate-light" />
              <span className="font-mono text-slate-light">${tournament.prizePool.toLocaleString()}</span>
            </div>
            <div className="flex flex-col items-center space-y-2 rounded-lg border border-slate-light/10 bg-slate-dark/10 p-3">
              <Users className="h-4 w-4 text-slate-light" />
              <span className="font-mono text-slate-light">{tournament.participants}</span>
            </div>
            <div className="flex flex-col items-center space-y-2 rounded-lg border border-slate-light/10 bg-slate-dark/10 p-3">
              <Brain className="h-4 w-4 text-slate-light" />
              <span className="font-mono text-slate-light">{tournament.aiAccuracy}%</span>
            </div>
          </div>

          <Alert className="bg-slate-dark/20 border-slate-light/10">
            <p className="text-sm text-slate-light">
              Prediction window closes in <span className="font-mono">{tournament.timeLeft}</span>. 
              Results will be determined using Binance {tournament.currency} price.
            </p>
          </Alert>

          <Button 
            className="w-full bg-slate-light font-mono text-background transition-all duration-300 hover:bg-slate-dark hover:shadow-inner-glow"
            disabled={!predictionValue}
          >
            Submit Prediction
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}