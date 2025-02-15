"use client"

import React from 'react';
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Users, Clock, Hexagon, ChevronRight } from "lucide-react";
import { formatEther } from "viem";
import { DateTime } from "luxon";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import request from "graphql-request";
import { REKT_SUBGRAPH_URL } from "@/constants/subgraph-url";
import { queryMarketParticipations } from "@/graphql/rekt/rekt.query";
import { MarketPhase, MarketData, MarketState } from "@/hooks/web3/rect/useMarketData";
import { useMarketData } from "@/hooks/web3/rect/useMarketData";
import { LoadingSkeleton } from './skeleton';

interface MarketParticipation {
  id: string;
  marketId: string;
  player: string;
  predictionPrice: string;
}

interface MarketParticipationsResponse {
  marketParticipations: MarketParticipation[];
}

interface MarketCardProps {
  marketData: MarketData;
  marketState: MarketState;
  participations: MarketParticipation[];
  getPhaseText: (phase: MarketPhase | undefined) => string;
  marketId: number;
}

// Helper function for badge variants
const getBadgeVariant = (
  phase: MarketPhase | undefined,
  isSettled: boolean,
): "default" | "secondary" | "destructive" | "outline" => {
  if (phase === undefined) return "secondary";
  switch (phase) {
    case MarketPhase.OPEN:
      return "default";
    case MarketPhase.LOCKED:
      return "outline";
    case MarketPhase.SETTLEMENT:
      return isSettled ? "secondary" : "destructive";
    default:
      return "secondary";
  }
};

function MarketCardPresentation({
  marketData,
  marketState,
  participations,
  getPhaseText,
  marketId,
}: MarketCardProps) {
  const router = useRouter();

  const stats = [
    {
      icon: <Trophy className="h-4 w-4 text-purple-400" />,
      value: `${formatEther(marketData.totalAmount)} ETH`,
      label: "Prize Pool",
    },
    {
      icon: <Users className="h-4 w-4 text-purple-400" />,
      value: participations?.length || "0",
      label: "Players",
    },
    {
      icon: <Clock className="h-4 w-4 text-purple-400" />,
      value: DateTime.fromSeconds(Number(marketData.deadline)).toRelative() || "Unknown",
      label: "Ends",
    },
  ];

  return (
    <Card className="flex flex-col h-full bg-gradient-to-br from-gray-900 to-gray-800 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border-none group">
      <div className="p-6 relative">
        <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-bl-full" />
        <div className="flex items-center justify-between mb-2 relative z-10">
          <h3 className="text-xl font-bold text-white">{marketData.name}</h3>
          <Badge
            variant={getBadgeVariant(marketState.phase, marketState.isSettled)}
            className="font-mono bg-purple-500/20 text-purple-300"
          >
            {getPhaseText(marketState.phase)}
          </Badge>
        </div>
        <p className="text-sm text-gray-400 line-clamp-2 relative z-10">
          Predict the market outcome and compete for rewards. Entry fee: {formatEther(marketData.entranceFee)} ETH
        </p>
      </div>

      <div className="px-6">
        <div className="grid grid-cols-3 gap-4 mb-4">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="flex flex-col items-center p-3 rounded-lg bg-gray-800/50 border border-purple-500/20"
            >
              {stat.icon}
              <span className="mt-2 font-mono font-medium text-purple-300">{stat.value}</span>
              <span className="text-xs text-gray-500">{stat.label}</span>
            </div>
          ))}
        </div>

        <div className="flex gap-2 flex-wrap mb-4">
          {[marketData.name.split(" ")[0], "Market", "Prediction"].map((tag, i) => (
            <Badge key={i} variant="outline" className="bg-purple-500/10 text-purple-300 border-purple-500/50">
              {tag}
            </Badge>
          ))}
        </div>
      </div>

      <div className="mt-auto p-6 pt-0">
        <Button
          className="w-full bg-purple-600 text-white hover:bg-purple-700 transition-colors duration-300 group-hover:animate-pulse"
          onClick={() => router.push(`/home/${marketId}`)}
        >
          <Hexagon className="w-4 h-4 mr-2" />
          Enter Market
          <ChevronRight className="w-4 h-4 ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </Button>
      </div>
    </Card>
  );
}

export function MarketCard({ marketId }: { marketId: number }) {
  const {
    marketData: contractData,
    marketState,
    loading: contractLoading,
    error: contractError,
    getPhaseText,
  } = useMarketData(marketId);

  const { 
    data: participationsData, 
    isLoading: participationsLoading,
    error: participationsError 
  } = useQuery({
    queryKey: ["marketParticipations", marketId],
    queryFn: async () => {
      try {
        const response = await request(
          REKT_SUBGRAPH_URL,
          queryMarketParticipations,
          { marketId: marketId.toString() }
        );
        return response as MarketParticipationsResponse;
      } catch (error) {
        console.error('Error fetching participations:', error);
        return { marketParticipations: [] };
      }
    },
    enabled: !!marketId && !contractLoading && !!contractData,
    retry: 1,
    staleTime: 30000, // 30 seconds
  });

  if (contractError) {
    return (
      <Card className="p-4 text-center">
        <p className="text-red-500">Error loading market data</p>
      </Card>
    );
  }

  if (contractLoading || !contractData || !marketState) {
    return <LoadingSkeleton />;
  }

  return (
    <MarketCardPresentation
      marketData={contractData}
      marketState={marketState}
      participations={participationsData?.marketParticipations || []}
      getPhaseText={getPhaseText}
      marketId={marketId}
    />
  );
}