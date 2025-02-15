"use client"
import { MarketCard } from "@/components/market-card/market-card"
import { motion } from "framer-motion"

const SAMPLE_MARKETS = [
  { marketId: 1 },
  { marketId: 2 },
  { marketId: 3 },
  { marketId: 4 },
  { marketId: 5 },
  { marketId: 6 },
]

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      <div className="lg:px-[10vw] py-8 flex flex-col justify-start space-y-8">
        <motion.div
          className="flex flex-col space-y-4 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-5xl font-bold font-mono tracking-tight text-white">REKT-AI ARENA</h1>
          <h2 className="text-2xl text-purple-400 mt-2 mb-4">Knockout Predictions: Beat AI, Take All</h2>
          <p className="text-purple-300 max-w-[900px] mx-auto">
            Enter the battle royale of market predictions where humans and AI clash for supremacy. Deploy your strategy, survive elimination rounds, and claim victory rewards. With each tournament, AI evolves - but will it ever match human intuition?
          </p>
        </motion.div>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {SAMPLE_MARKETS.map((market, index) => (
            <motion.div
              key={market.marketId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <MarketCard
                key={market.marketId}
                marketId={market.marketId}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}