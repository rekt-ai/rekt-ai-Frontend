export interface MarketCreated {
    id: string;
    marketId: string;
    name: string;
    startTime: string;
    deadline: string;
    entranceFee: bigint;
    totalAmount: bigint;
    blockTimestamp: string;
    blockNumber: string;
  }
  
  export interface MarketParticipation {
    id: string;
    marketId: string;
    player: string;
    predictionPrice: string;
    blockTimestamp: string;
    blockNumber: string;
    transactionHash: string;
  }
  
  export interface MarketSettled {
    id: string;
    marketId: string;
    finalPrice: string;
    predictionPrice: string;
    totalAmount: string;
    winner: string;
    blockTimestamp: string;
    blockNumber: string;
    transactionHash: string;
  }
  
  export interface MarketCreatedsData {
    marketCreateds: MarketCreated[];
  }
  
  export interface MarketParticipationsData {
    marketParticipations: MarketParticipation[];
  }
  
  export interface MarketSettledsData {
    marketSettleds: MarketSettled[];
  }


  interface MarketData {
    // Current contract data
    startTime: bigint;
    deadline: bigint;
    entranceFee: bigint;
    finalPrice: bigint;
    totalAmount: bigint;
    settled: boolean;
    name: string;
    
    // Additional fields from subgraph
    blockTimestamp?: number;
    blockNumber?: number;
    transactionHash?: string;
  }
  
  interface PlayerData {
    address: string;
    predictionPrice: bigint;
    blockTimestamp: number;
    transactionHash: string;
    chatData?: {
      messages: string[];
      timestamp: number;
    }[];
  }