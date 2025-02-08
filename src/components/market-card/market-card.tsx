import { useRouter } from 'next/router';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Brain, Clock, Users, DollarSign } from "lucide-react";
import { formatEther } from 'viem';
import { DateTime } from 'luxon';
import { useMarketData } from '@/hooks/web3/rect/useMarketData';

interface MarketCardProps {
  marketId: number;
}

const LoadingSkeleton = () => (
  <Card className="group relative overflow-hidden border-slate-light/10 bg-gradient-to-b from-card to-card/50">
    <div className="absolute inset-0 bg-blockchain-grid opacity-5"></div>
    <CardHeader className="relative border-b border-slate-light/10 bg-cyber-glow">
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-6 w-24" />
      </div>
    </CardHeader>
    <CardContent className="relative p-6">
      <div className="flex flex-col space-y-6">
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex flex-col items-center space-y-2 rounded-lg border border-slate-light/10 bg-slate-dark/10 p-3">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-3 w-12" />
            </div>
          ))}
        </div>
        <Skeleton className="h-10 w-full" />
      </div>
    </CardContent>
  </Card>
);

export function MarketCard({ marketId }: MarketCardProps) {
    const router = useRouter();
    const { marketData, phase, players, loading } = useMarketData(marketId);

    console.log('Market Card Data:', {
        marketId,
        marketData,
        phase,
        players,
        loading
    });

    if (loading || !marketData) return <LoadingSkeleton />;

    const getPhaseText = (phase: number) => {
        switch(phase) {
            case 0: return "Not Started";
            case 1: return "Open";
            case 2: return "Locked";
            case 3: return "Settled";
            default: return "Unknown";
        }
    };

    return (
        <Card className="group relative overflow-hidden border-slate-light/10 bg-gradient-to-b from-card to-card/50">
            <div className="absolute inset-0 bg-blockchain-grid opacity-5"></div>
            <CardHeader className="relative border-b border-slate-light/10 bg-cyber-glow">
                <div className="flex items-center justify-between">
                    <CardTitle className="line-clamp-1 font-mono text-slate-light">
                        {marketData.name}
                    </CardTitle>
                    <Badge variant={phase === 1 ? "default" : "secondary"} className="font-mono">
                        {getPhaseText(phase ?? 0)}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="relative p-6">
                <div className="flex flex-col space-y-6">
                    <div className="grid grid-cols-4 gap-4 text-sm">
                        <div className="flex flex-col items-center space-y-2 rounded-lg border border-slate-light/10 bg-slate-dark/10 p-3">
                            <DollarSign className="h-4 w-4 text-slate-light" />
                            <span className="font-mono text-slate-light">
                                {formatEther(marketData.entranceFee)} ETH
                            </span>
                            <span className="text-xs text-muted-foreground">Entry Fee</span>
                        </div>
                        <div className="flex flex-col items-center space-y-2 rounded-lg border border-slate-light/10 bg-slate-dark/10 p-3">
                            <Users className="h-4 w-4 text-slate-light" />
                            <span className="font-mono text-slate-light">
                                {players?.length || 0}
                            </span>
                            <span className="text-xs text-muted-foreground">Players</span>
                        </div>
                        <div className="flex flex-col items-center space-y-2 rounded-lg border border-slate-light/10 bg-slate-dark/10 p-3">
                            <Brain className="h-4 w-4 text-slate-light" />
                            <span className="font-mono text-slate-light">
                                {formatEther(marketData.totalAmount)} ETH
                            </span>
                            <span className="text-xs text-muted-foreground">Total Pool</span>
                        </div>
                        <div className="flex flex-col items-center space-y-2 rounded-lg border border-slate-light/10 bg-slate-dark/10 p-3">
                            <Clock className="h-4 w-4 text-slate-light" />
                            <span className="font-mono text-slate-light">
                                {DateTime.fromSeconds(Number(marketData.deadline)).toRelative()}
                            </span>
                            <span className="text-xs text-muted-foreground">Ends</span>
                        </div>
                    </div>
                    
                    <Button
                        onClick={() => router.push(`/home/${marketId}`)}
                        className="w-full bg-slate-light font-mono text-background hover:bg-slate-dark"
                        disabled={phase !== 1}
                    >
                        {phase === 1 ? 'Enter Prediction' : 'Market Closed'}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}