"use client"
import { MarketCard } from "@/components/market-card/market-card"

const SAMPLE_MARKETS = [{ marketId: 1 }, { marketId: 2 }, { marketId: 3 }]

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <div className="lg:px-[10vw] py-12 flex flex-col justify-start space-y-8">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-4xl font-bold font-mono tracking-tight text-gray-800">Available Markets</h1>
          <p className="text-gray-600 max-w-[600px] mx-auto">Make predictions on market outcomes and win rewards!</p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {SAMPLE_MARKETS.map((market) => (
            <MarketCard key={market.marketId} marketId={market.marketId} />
          ))}
        </div>
      </div>
    </div>
  )
}

