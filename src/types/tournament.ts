export interface TournamentData {
  id: string;
  title: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  prizePool: number;
  participants: number;
  aiAccuracy: number;
  description: string;
  tags: string[];
  currency: string;
  timeLeft: string;
  placeholder?: string;
}

export const tournaments: TournamentData[] = [
  {
    id: "btc-prediction",
    title: "BTC Price Prediction Challenge",
    difficulty: "HARD",
    prizePool: 1117.55,
    participants: 128,
    aiAccuracy: 85,
    description: "Predict Bitcoin's closing price in 24 hours using technical analysis and on-chain metrics.",
    tags: ["Technical Analysis", "On-Chain", "Bitcoin"],
    currency: "USD",
    timeLeft: "11:24:36",
    placeholder: "Enter BTC price in USD"
  },
  {
    id: "eth-gas",
    title: "ETH Gas Fee Forecast",
    difficulty: "MEDIUM",
    prizePool: 652.15,
    participants: 64,
    aiAccuracy: 78,
    description: "Forecast Ethereum gas fees for the next 12 hours using network activity patterns.",
    tags: ["Ethereum", "Gas", "Network Analysis"],
    currency: "GWEI",
    timeLeft: "05:45:12",
    placeholder: "Enter gas price in GWEI"
  },
  {
    id: "defi-yield",
    title: "DeFi Yield Strategy",
    difficulty: "EASY",
    prizePool: 208.18,
    participants: 32,
    aiAccuracy: 92,
    description: "Develop the most profitable yield farming strategy across major DeFi protocols.",
    tags: ["DeFi", "Yield", "Strategy"],
    currency: "APY%",
    timeLeft: "23:59:59",
    placeholder: "Enter expected APY"
  }
];