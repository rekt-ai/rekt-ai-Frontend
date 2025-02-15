import React, { useState, useEffect } from 'react';
import { GraphQLClient } from 'graphql-request';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Calendar, Clock } from 'lucide-react';

// Define types for the market data
interface Market {
  id: string;
  startTime: number;
  deadline: number;
//   blockTimestamp: bigint;
  blockNumber: string;
}

interface MarketCreatedResponse {
  marketCreateds: Market[];
}

const REKT_SUBGRAPH_URL = "https://api.studio.thegraph.com/query/62788/rekt-ai-subgraph-base/v0.0.1";

const MarketDisplay: React.FC = () => {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMarkets = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const client = new GraphQLClient(REKT_SUBGRAPH_URL);
        const variables = {
          first: 10,
          skip: 0
        };
        
        const query = `
          query QueryMarketCreateds($first: Int, $skip: Int) {
            marketCreateds(
              first: $first
              skip: $skip
              orderBy: blockTimestamp
              orderDirection: desc
             
            ) {
              id
             
              startTime
              deadline
              blockNumber
            }
          }
        `;

        const data = await client.request<MarketCreatedResponse>(query, variables);
        setMarkets(data.marketCreateds);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred while fetching market data');
        setLoading(false);
      }
    };

    fetchMarkets();
  }, []);

  const formatTimestamp = (timestamp: number): string => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  if (loading) {
    return (
      <Card className="w-full max-w-4xl mx-auto mt-4">
        <CardContent className="p-6">
          <div className="flex justify-center items-center h-40">
            <p className="text-gray-500">Loading market data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full max-w-4xl mx-auto mt-4 bg-red-50">
        <CardContent className="p-6">
          <div className="text-red-500">
            Error loading market data: {error}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-4xl mx-auto mt-4">
      <CardHeader>
        <CardTitle className="text-xl font-bold">Recent Markets</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="px-4 py-2 text-left">Name</th>
                <th className="px-4 py-2 text-left">Start Time</th>
                <th className="px-4 py-2 text-left">Deadline</th>
                <th className="px-4 py-2 text-left">Block</th>
              </tr>
            </thead>
            <tbody>
              {markets.map((market) => (
                <tr key={market.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3">
                    {/* <div className="font-medium">{market.name}</div> */}
                    <div className="text-sm text-gray-500">ID: {market.id}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>{formatTimestamp(market.startTime)}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>{formatTimestamp(market.deadline)}</span>
                    </div>
                  </td>
                  {/* <td className="px-4 py-3">
                    <div className="text-sm">
                      Block: {market.blockNumber}
                      <div className="text-gray-500">
                        {formatTimestamp(market.blockTimestamp)}
                      </div>
                    </div>
                  </td> */}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default MarketDisplay;