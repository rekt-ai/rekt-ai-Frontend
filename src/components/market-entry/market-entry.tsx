"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Trophy, Clock, Users, DollarSign } from "lucide-react"
import { Alert } from "@/components/ui/alert"
import { formatEther, parseEther } from "viem"
import { DateTime } from "luxon"
import { useMarketData, MarketPhase } from "@/hooks/web3/rect/useMarketData"
import { useParticipateMarket } from "@/hooks/web3/rect/useParticipateMarket"
import { useQuery } from "@tanstack/react-query"
import request from "graphql-request"
import { REKT_SUBGRAPH_URL } from "@/constants/subgraph-url"
import { queryMarketCreateds, queryMarketSettleds, queryMarketParticipations } from "@/graphql/rekt/rekt.query"
import { Input } from "@/components/ui/input"

interface MarketEntryProps {
  marketId: number
}

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

export default function MarketEntry({ marketId }: MarketEntryProps) {
  const [predictionPrice, setPredictionPrice] = useState("")
  const { marketData: contractData, marketState, loading: contractLoading, getPhaseText } = useMarketData(marketId)
  const { handleParticipate, isPending } = useParticipateMarket()

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
  const { data: participationsData } = useQuery({
    queryKey: ["marketParticipations", marketId],
    queryFn: async () => {
      const response = await request<MarketParticipationResponse>(REKT_SUBGRAPH_URL, queryMarketParticipations, {
        marketId: marketId.toString(),
        first: 1000,
      })
      return response.marketParticipations
    },
  })

  // Fetch settled data from subgraph
  const { data: settledData } = useQuery({
    queryKey: ["marketSettled", marketId],
    queryFn: async () => {
      const response = await request<MarketSettledResponse>(REKT_SUBGRAPH_URL, queryMarketSettleds, {
        marketId: marketId.toString(),
        first: 1,
      })
      return response.marketSettleds[0]
    },
  })

  if (contractLoading || !contractData || !marketState) {
    return (
      <div className="min-h-screen bg-background p-6">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="p-8">
            <div className="flex items-center justify-center">
              <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-primary" />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const handleSubmit = async () => {
    if (!predictionPrice) return

    const data = "0x" + "0".repeat(64)
    await handleParticipate(Number(marketId), Number(parseEther(predictionPrice)), data, contractData.entranceFee)
  }

  const renderActionSection = () => {
    if (marketState.canParticipate) {
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Your Price Prediction</label>
            <div className="flex gap-2">
              <Input
                type="text"
                value={predictionPrice}
                onChange={(e) => {
                  const val = e.target.value
                  if (val === "" || (!isNaN(Number(val)) && Number(val) >= 0)) {
                    setPredictionPrice(val)
                  }
                }}
                className="font-mono bg-white text-gray-800 border-gray-300 focus:border-primary"
                placeholder="Enter price in USD"
              />
              <div className="flex items-center px-3 rounded-md bg-primary/10 font-mono text-primary">USD</div>
            </div>
          </div>

          <Alert className="bg-primary/10 border-primary/50 text-primary">
            <p className="text-sm">Entry fee: {formatEther(contractData.entranceFee)} ETH</p>
          </Alert>

          <Button
            className="w-full bg-primary text-white hover:bg-primary/90"
            disabled={!predictionPrice || isPending}
            onClick={handleSubmit}
          >
            {isPending ? "Submitting..." : "Submit Prediction"}
          </Button>
        </div>
      )
    }

    const message =
    marketState.phase === MarketPhase.LOCKED
      ? "Market is currently locked"
      : marketState.phase === MarketPhase.SETTLEMENT
        ? "This market has ended"
        : "Market status unknown"

    return (
      <Alert className="bg-accent">
        <p className="text-sm">{message}</p>
      </Alert>
    )
  }

  const stats = [
    {
      icon: <Trophy className="h-4 w-4 text-primary" />,
      value: `${formatEther(contractData.totalAmount)} ETH`,
      label: "Prize Pool",
    },
    {
      icon: <Users className="h-4 w-4 text-primary" />,
      value: String(participationsData?.length || 0),
      label: "Players",
    },
    {
      icon: <DollarSign className="h-4 w-4 text-primary" />,
      value: `${formatEther(contractData.entranceFee)} ETH`,
      label: "Entry Fee",
    },
    {
      icon: <Clock className="h-4 w-4 text-primary" />,
      value: DateTime.fromSeconds(Number(contractData.deadline)).toRelative() || "Unknown",
      label: "Ends",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white p-6">
      <Card className="max-w-2xl mx-auto bg-white shadow-xl">
        <CardHeader className="relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-bl-full"></div>
          <div className="flex items-center justify-between mb-2 relative z-10">
            <CardTitle className="text-2xl font-bold text-gray-800">{contractData.name}</CardTitle>
            <Badge
              variant={getBadgeVariant(marketState.phase, marketState.isSettled)}
              className="font-mono bg-primary/20 text-primary"
            >
              {getPhaseText(marketState.phase)}
            </Badge>
          </div>
          <p className="text-sm text-gray-600 relative z-10">
            Enter your prediction for this market. Current total pool: {formatEther(contractData.totalAmount)} ETH
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat, index) => (
              <div key={index} className="flex flex-col items-center p-3 rounded-lg bg-gray-50">
                {stat.icon}
                <span className="mt-2 font-mono font-medium text-primary">{stat.value}</span>
                <span className="text-xs text-gray-500">{stat.label}</span>
              </div>
            ))}
          </div>
          <div className="flex gap-2 flex-wrap">
            {[contractData.name.split(" ")[0], "Market", "Prediction"].map((tag, i) => (
              <Badge key={i} variant="outline" className="bg-primary/10 text-primary border-primary/50">
                {tag}
              </Badge>
            ))}
          </div>
          {renderActionSection()}
        </CardContent>
      </Card>
    </div>
  )
}

