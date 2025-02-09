import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { readContract } from '@wagmi/core';
import { wagmiConfig } from '@/configs/wagmi';
import { REKT_ADDRESS } from '@/constants/contract-address';
import RektABI from '@/abis/rekt/RektABI';

interface PlayerData {
  predictionPrice: bigint;
  timestamp: bigint;
  hasParticipated: boolean;
}

export const usePlayerData = (marketId: number) => {
  const { address } = useAccount();
  const [playerData, setPlayerData] = useState<PlayerData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlayerData = async () => {
      if (!address) {
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
        }) as [bigint, bigint];

        setPlayerData({
          predictionPrice: result[0],
          timestamp: result[1],
          hasParticipated: result[1] !== BigInt(0)
        });
      } catch (error) {
        console.error('Error fetching player data:', error);
        setPlayerData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPlayerData();
  }, [address, marketId]);

  return { playerData, loading };
};