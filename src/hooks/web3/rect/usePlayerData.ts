import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { readContract } from '@wagmi/core';
import { wagmiConfig } from '@/configs/wagmi';
import { REKT_ADDRESS } from '@/constants/contract-address';
import RektABI from '@/abis/rekt/RektABI';

interface PlayerData {
  predictionPrice: bigint;
  timestamp: bigint;
  data: string; // bytes32 data
  hasParticipated: boolean;
}

export const usePlayerData = (marketId: number) => {
  const { address } = useAccount();
  const [playerData, setPlayerData] = useState<PlayerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchPlayerData = async () => {
      if (!address || !marketId) {
        setPlayerData(null);
        setLoading(false);
        return;
      }

      try {
        const result = await readContract(wagmiConfig, {
          address: REKT_ADDRESS,
          abi: RektABI,
          functionName: 'getPlayerData',
          args: [marketId, address],
        }) as [bigint, bigint, string]; // [predictionPrice, timestamp, data]

        setPlayerData({
          predictionPrice: result[0],
          timestamp: result[1],
          data: result[2],
          hasParticipated: result[1] !== BigInt(0)
        });
        setError(null);
      } catch (err) {
        console.error('Error fetching player data:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch player data'));
        setPlayerData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPlayerData();
  }, [address, marketId]);

  const refetchPlayerData = async () => {
    setLoading(true);
    try {
      if (!address || !marketId) {
        setPlayerData(null);
        return;
      }

      const result = await readContract(wagmiConfig, {
        address: REKT_ADDRESS,
        abi: RektABI,
        functionName: 'getPlayerData',
        args: [marketId, address],
      }) as [bigint, bigint, string];

      setPlayerData({
        predictionPrice: result[0],
        timestamp: result[1],
        data: result[2],
        hasParticipated: result[1] !== BigInt(0)
      });
      setError(null);
    } catch (err) {
      console.error('Error refetching player data:', err);
      setError(err instanceof Error ? err : new Error('Failed to refetch player data'));
      setPlayerData(null);
    } finally {
      setLoading(false);
    }
  };

  return {
    playerData,
    loading,
    error,
    refetchPlayerData
  };
};