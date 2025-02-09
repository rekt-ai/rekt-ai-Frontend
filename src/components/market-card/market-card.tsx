'use client'

import { useRouter } from 'next/router';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Users, Clock, Hexagon } from 'lucide-react';
import { formatEther } from 'viem';
import { DateTime } from 'luxon';
import { useMarketData, MarketPhase } from '@/hooks/web3/rect/useMarketData';
import { Button } from "@/components/ui/button";
import { useQuery } from '@tanstack/react-query';
import request from 'graphql-request';
import { REKT_SUBGRAPH_URL } from '@/constants/subgraph-url';
import { queryMarketCreateds, queryMarketParticipations } from '@/graphql/rekt/rekt.query';

interface MarketCreatedResponse {
  marketCreateds: {
    id: string
    marketId: string
    name: string
    startTime: string
    deadline: string
    blockTimestamp: string
    blockNumber: string
  }[]
}

interface MarketSettledResponse {
  marketSettleds: {
    id: string
    marketId: string
    finalPrice: string
    predictionPrice: string
    totalAmount: string
    winner: string
    transactionHash: string
    blockTimestamp: string
    blockNumber: string
  }[]
}

interface MarketParticipationResponse {
  marketParticipations: {
    blockNumber: string
    blockTimestamp: string
    id: string
    marketId: string
    player: string
    predictionPrice: string
    transactionHash: string
  }[]
}

interface MarketCardProps {
  marketId: number
}

const LoadingSkeleton = () => (
  <Card className="overflow-hidden bg-card">
    <CardHeader className="space-y-2">
      <div className="h-6 w-1/3 bg-muted rounded animate-pulse" />
      <div className="h-4 w-2/3 bg-muted rounded animate-pulse" />
    </CardHeader>
    <CardContent className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-16 bg-muted rounded animate-pulse" />
        ))}
      </div>
      <div className="h-10 bg-muted rounded animate-pulse" />
    </CardContent>
  </Card>
)

const getBadgeVariant = (
  phase: MarketPhase | undefined,
  isSettled: boolean,
): "default" | "secondary" | "destructive" | "outline" => {
  if (phase === undefined) return "secondary"

  switch (phase) {
    case MarketPhase.OPEN:
      return "default"
    case MarketPhase.LOCKED:
      return "outline"
    case MarketPhase.SETTLEMENT:
      return isSettled ? "secondary" : "destructive"
    default:
      return "secondary"
  }
}

export function MarketCard({ marketId }: MarketCardProps) {
  const router = useRouter()
  const { marketData: contractData, marketState, loading: contractLoading, getPhaseText } = useMarketData(marketId)

  // Fetch market creation data from subgraph
  const { data: createdData } = useQuery({
    queryKey: ["marketCreated", marketId],
    queryFn: async () => {
      const response = await request<MarketCreatedResponse>(REKT_SUBGRAPH_URL, queryMarketCreateds, {
        marketId: marketId.toString(),
        first: 1,
      })
      return response.marketCreateds[0]
    },
  })

  // Fetch participants from subgraph
  const { data: participations } = useQuery({
    queryKey: ["marketParticipations", marketId],
    queryFn: async () => {
      const response = await request<MarketParticipationResponse>(REKT_SUBGRAPH_URL, queryMarketParticipations, {
        marketId: marketId.toString(),
        first: 1000,
      })
      return response.marketParticipations
    },
  })

  if (contractLoading || !contractData || !marketState) return <LoadingSkeleton />

  const stats = [
    {
      icon: <Trophy className="h-4 w-4 text-primary" />,
      value: `${formatEther(contractData.totalAmount)} ETH`,
      label: "Prize Pool"
    },
    {
      icon: <Users className="h-4 w-4 text-primary" />,
      value: String(participations?.length || 0),
      label: "Players"
    },
    {
      icon: <Clock className="h-4 w-4 text-primary" />,
      value: DateTime.fromSeconds(Number(contractData.deadline)).toRelative() || 'Unknown',
      label: "Ends"
    }
  ];

  return (
    <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden border border-primary/20">
      <CardHeader className="relative">
        <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-bl-full"></div>
        <div className="flex items-center justify-between mb-2 relative z-10">
          <CardTitle className="text-xl font-bold text-gray-800">
            {contractData.name}
          </CardTitle>
          <Badge
            variant={getBadgeVariant(marketState.phase, marketState.isSettled)}
            className="font-mono bg-primary/20 text-primary"
          >
            {getPhaseText(marketState.phase)}
          </Badge>
        </div>
        <p className="text-sm text-gray-600 line-clamp-2 relative z-10">
          Predict the market outcome and compete for rewards. Entry fee: {formatEther(contractData.entranceFee)} ETH
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-3 gap-4">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="flex flex-col items-center p-3 rounded-lg bg-gray-50"
            >
              {stat.icon}
              <span className="mt-2 font-mono font-medium text-primary">{stat.value}</span>
              <span className="text-xs text-gray-500">{stat.label}</span>
            </div>
          ))}
        </div>
        <div className="flex gap-2 flex-wrap">
          {[contractData.name.split(' ')[0], "Market", "Prediction"].map((tag, i) => (
            <Badge
              key={i}
              variant="outline"
              className="bg-primary/10 text-primary border-primary/50"
            >
              {tag}
            </Badge>
          ))}
        </div>
        <Button
          className="w-full bg-primary text-white hover:bg-primary/90"
          onClick={() => router.push(`/home/${marketId}`)}
        >
          <Hexagon className="w-4 h-4 mr-2" />
          Enter Market
        </Button>
      </CardContent>
    </Card>
  )
}
