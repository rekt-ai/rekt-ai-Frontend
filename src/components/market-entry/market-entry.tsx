import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Brain, Clock, Users, DollarSign } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { formatEther, parseEther } from "viem";
import { DateTime } from "luxon";
import { useMarketData } from "@/hooks/web3/rect/useMarketData";
import { useParticipateMarket } from "@/hooks/web3/rect/useParticipateMarket";

interface MarketEntryProps {
  marketId: number;
}

export default function MarketEntry({ marketId }: MarketEntryProps) {
  const [predictionPrice, setPredictionPrice] = useState("");
  const { marketData, phase, players, loading } = useMarketData(marketId);
  const { handleParticipate, isPending } = useParticipateMarket();

  if (loading || !marketData) return <div>Loading...</div>;

  const handleSubmit = async () => {
    if (!predictionPrice) return;
    
    const data = "0x" + "0".repeat(64); // Empty bytes32 data
    await handleParticipate(
      Number(marketId),
      Number(parseEther(predictionPrice)),
      data,
      marketData.entranceFee // entranceFee is already bigint
    );
  };

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
    <div className="min-h-screen bg-background p-6">
      <Card className="max-w-2xl mx-auto group relative overflow-hidden border-slate-light/10 bg-gradient-to-b from-card to-card/50">
        <CardHeader className="relative border-b border-slate-light/10 bg-cyber-glow">
          <div className="flex items-center justify-between">
            <CardTitle className="line-clamp-1 font-mono text-slate-light">
              {marketData.name}
            </CardTitle>
            <Badge
              variant={phase === 1 ? "default" : "secondary"}
              className="font-mono"
            >
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

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-light">Your Price Prediction</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={predictionPrice}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === "" || (!isNaN(Number(val)) && Number(val) >= 0)) {
                      setPredictionPrice(val);
                    }
                  }}
                  className="flex-1 rounded-md border border-slate-light/10 bg-slate-dark/10 p-2 font-mono text-slate-light focus:border-slate-light focus:outline-none"
                  placeholder="Enter price in USD"
                />
                <span className="flex items-center font-mono text-slate-light">USD</span>
              </div>
            </div>

            <Alert className="bg-slate-dark/20 border-slate-light/10">
              <p className="text-sm text-slate-light">
                Entry fee: {formatEther(marketData.entranceFee)} ETH
              </p>
            </Alert>

            <Button
              className="w-full bg-slate-light font-mono text-background hover:bg-slate-dark"
              disabled={!predictionPrice || isPending || phase !== 1}
              onClick={handleSubmit}
            >
              {isPending ? "Submitting..." : "Submit Prediction"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}