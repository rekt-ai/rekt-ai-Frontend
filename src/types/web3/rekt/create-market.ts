export interface MarketCreated {
    id: string;
    marketId: string;
    startTime: string;
    deadline: string;
    blockTimestamp: string;
    blockNumber: string;
  }
  
  export interface MarketCreatedsData {
    marketCreateds: MarketCreated[];
  }