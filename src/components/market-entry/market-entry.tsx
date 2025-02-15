"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Trophy, Clock, Users, DollarSign, Hexagon } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { formatEther, parseEther } from "viem"
import { DateTime } from "luxon"
import { useMarketData, MarketPhase } from "@/hooks/web3/rect/useMarketData"
import { useParticipateMarket } from "@/hooks/web3/rect/useParticipateMarket"
import { usePlayerData } from "@/hooks/web3/rect/usePlayerData"
import { useQuery } from "@tanstack/react-query"
import { useAccount } from 'wagmi'
import request from "graphql-request"
import { REKT_SUBGRAPH_URL } from "@/constants/subgraph-url"
import { queryMarketCreateds, queryMarketSettleds, queryMarketParticipations } from "@/graphql/rekt/rekt.query"
import { Input } from "@/components/ui/input"
import { PredictionChat } from "../prediction-chats/prediction-card"

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
  const { address } = useAccount()
  const { marketData: contractData, marketState, loading: contractLoading, getPhaseText } = useMarketData(marketId)
  const { handleParticipate, isPending, isConfirming, isConfirmed } = useParticipateMarket()
  const { playerData, loading: playerDataLoading } = usePlayerData(marketId)

  // Fetch market creation data from subgraph
  const { data: createdData } = useQuery({
    queryKey: ["marketCreated", marketId],
    queryFn: async () => {
      const response = await request<MarketCreatedResponse>(
        REKT_SUBGRAPH_URL,
        queryMarketCreateds,
        { marketId: marketId.toString(), first: 1 }
      )
      return response.marketCreateds[0]
    },
  })

  // Fetch participants from subgraph
  const { data: participationsData } = useQuery({
    queryKey: ["marketParticipations", marketId],
    queryFn: async () => {
      const response = await request<MarketParticipationResponse>(
        REKT_SUBGRAPH_URL,
        queryMarketParticipations,
        { marketId: marketId.toString(), first: 1000 }
      )
      return response.marketParticipations
    },
  })

  // Fetch settled data from subgraph
  const { data: settledData } = useQuery({
    queryKey: ["marketSettled", marketId],
    queryFn: async () => {
      const response = await request<MarketSettledResponse>(
        REKT_SUBGRAPH_URL,
        queryMarketSettleds,
        { marketId: marketId.toString(), first: 1 }
      )
      return response.marketSettleds[0]
    },
  })

  if (contractLoading || !contractData || !marketState || playerDataLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-6">
        <Card className="max-w-2xl mx-auto bg-gradient-to-br from-gray-900 to-gray-800 border-none">
          <CardContent className="p-8">
            <div className="flex items-center justify-center">
              <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // MarketEntry.tsx
const handleSubmit = async () => {
  if (!predictionPrice) return

  try {
    // Properly format the data parameter as a hex string
    const data = `0x${`0`.repeat(64)}` as `0x${string}`
    
    // Submit to smart contract
    await handleParticipate(
      Number(marketId),
      Number(parseEther(predictionPrice)),
      data,
      contractData.entranceFee
    )

    // If smart contract submission successful, post to chat
    if (address) {
      const chatData = {
        marketId,
        predictionPrice,
        timestamp: Math.floor(Date.now() / 1000)
      }

      await fetch('/api/chats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chatData,
          timestamp: Math.floor(Date.now() / 1000).toString(),
          userAddress: address
        }),
      })
    }
  } catch (error) {
    console.error('Error in submission:', error)
  }
}

  const renderActionSection = () => {
    if (!address) {
      return (
        <Alert className="bg-purple-500/10 border-purple-500/20 text-purple-300">
          <AlertDescription>Please connect your wallet to participate</AlertDescription>
        </Alert>
      )
    }

    if (playerData?.hasParticipated) {
      return (
        <Alert className="bg-purple-500/10 border-purple-500/20 text-purple-300">
          <AlertDescription>
            You have already submitted a prediction: {formatEther(playerData.predictionPrice)} USD
            <br />
            Submitted at: {DateTime.fromSeconds(Number(playerData.timestamp))
              .toLocaleString(DateTime.DATETIME_FULL)}
          </AlertDescription>
        </Alert>
      )
    }

    if (marketState.canParticipate) {
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-purple-300">Your Price Prediction</label>
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
                className="font-mono bg-gray-800 text-purple-300 border-purple-500/20 focus:border-purple-500"
                placeholder="Enter price in USD"
              />
              <div className="flex items-center px-3 rounded-md bg-purple-500/10 font-mono text-purple-300">
                USD
              </div>
            </div>
          </div>

          <Alert className="bg-purple-500/10 border-purple-500/20 text-purple-300">
            <p className="text-sm">Entry fee: {formatEther(contractData.entranceFee)} ETH</p>
          </Alert>

          <Button
            className="w-full bg-purple-600 text-white hover:bg-purple-700 transition-colors duration-300"
            disabled={!predictionPrice || isPending}
            onClick={handleSubmit}
          >
            <Hexagon className="w-4 h-4 mr-2" />
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
      <Alert className="bg-purple-500/10 border-purple-500/20 text-purple-300">
        <AlertDescription>{message}</AlertDescription>
      </Alert>
    )
  }

  const stats = [
    {
      icon: <Trophy className="h-4 w-4 text-purple-400" />,
      value: `${formatEther(contractData.totalAmount)} ETH`,
      label: "Prize Pool",
    },
    {
      icon: <Users className="h-4 w-4 text-purple-400" />,
      value: String(participationsData?.length || 0),
      label: "Players",
    },
    {
      icon: <DollarSign className="h-4 w-4 text-purple-400" />,
      value: `${formatEther(contractData.entranceFee)} ETH`,
      label: "Entry Fee",
    },
    {
      icon: <Clock className="h-4 w-4 text-purple-400" />,
      value: DateTime.fromSeconds(Number(contractData.deadline)).toRelative() || "Unknown",
      label: "Ends",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-6">
      {/* Market Details Card */}
      <Card className="max-w-2xl mx-auto bg-gradient-to-br from-gray-900 to-gray-800 shadow-xl border-none">
        <CardHeader className="relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-bl-full"></div>
          <div className="flex items-center justify-between mb-2 relative z-10">
            <CardTitle className="text-2xl font-bold text-white">{contractData.name}</CardTitle>
            <Badge
              variant={getBadgeVariant(marketState.phase, marketState.isSettled)}
              className="font-mono bg-purple-500/20 text-purple-300"
            >
              {getPhaseText(marketState.phase)}
            </Badge>
          </div>
          <p className="text-sm text-gray-400 relative z-10">
            Enter your prediction for this market. Current total pool: {formatEther(contractData.totalAmount)} ETH
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
          <div className="flex gap-2 flex-wrap">
            {[contractData.name.split(" ")[0], "Market", "Prediction"].map((tag, i) => (
              <Badge
                key={i}
                variant="outline"
                className="bg-purple-500/10 text-purple-300 border-purple-500/50"
              >
                {tag}
              </Badge>
            ))}
          </div>
          {renderActionSection()}
        </CardContent>
      </Card>

      {/* Prediction Chat Section */}
      <PredictionChat marketId={marketId} />
    </div>
  )
}