import { wagmiConfig } from "@/configs/wagmi";
import { REKT_ADDRESS } from '@/constants/contract-address';
import RektABI from '@/abis/rekt/RektABI';
import { readContract } from "@wagmi/core";
import { useCallback, useEffect, useState } from "react";

// Enum for market phases to make the code more type-safe
export enum MarketPhase {
    OPEN = 0,
    LOCKED = 1,
    SETTLEMENT = 2
}

export interface PlayerData {
    predictionPrice: bigint;
    timestamp: bigint;
    data: string;
}

export interface MarketData {
    startTime: bigint;
    deadline: bigint;
    entranceFee: bigint;
    finalPrice: bigint;
    totalAmount: bigint;
    settled: boolean;
    name: string;
    players?: string[];
    playerData?: Map<string, PlayerData>;
}

export interface MarketState {
    phase: MarketPhase;
    isSettled: boolean;
    canParticipate: boolean;
    canSettle: boolean;
    isActive: boolean;
}

interface MarketDataOptions {
    enabled?: boolean;
    includePlayers?: boolean;
}

export const useMarketData = (
    marketId: number,
    blockTimestamp?: string,
    options: MarketDataOptions = {}
) => {
    const { enabled = true, includePlayers = false } = options;

    const [marketData, setMarketData] = useState<MarketData | undefined>(undefined);
    const [phase, setPhase] = useState<MarketPhase | undefined>(undefined);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const marketState: MarketState | undefined = phase !== undefined && marketData ? {
        phase,
        isSettled: marketData.settled,
        canParticipate: phase === MarketPhase.OPEN && !marketData.settled,
        canSettle: phase === MarketPhase.SETTLEMENT && !marketData.settled,
        isActive: phase === MarketPhase.OPEN && !marketData.settled
    } : undefined;

    const fetchPlayerData = useCallback(async (players: string[]) => {
        const playerDataMap = new Map<string, PlayerData>();

        for (const player of players) {
            try {
                const result = await readContract(wagmiConfig, {
                    address: REKT_ADDRESS,
                    abi: RektABI,
                    functionName: 'getPlayerData',
                    args: [BigInt(marketId), player],
                }) as [bigint, bigint, string];

                playerDataMap.set(player, {
                    predictionPrice: result[0],
                    timestamp: result[1],
                    data: result[2]
                });
            } catch (err) {
                console.error(`Error fetching player data for ${player}:`, err);
            }
        }
        return playerDataMap;
    }, [marketId]);

    const determinePhase = useCallback((startTime: bigint, deadline: bigint): MarketPhase => {
        const currentTime = BigInt(Math.floor(Date.now() / 1000));

        if (currentTime < startTime) return MarketPhase.OPEN;
        if (currentTime < deadline) return MarketPhase.LOCKED;
        return MarketPhase.SETTLEMENT;
    }, []);

    const fetchContractData = useCallback(async () => {
        if (!enabled) return;

        try {
            const marketIdBigInt = BigInt(marketId);

            const marketResult = await readContract(wagmiConfig, {
                address: REKT_ADDRESS,
                abi: RektABI,
                functionName: 'markets',
                args: [marketIdBigInt],
            }) as [bigint, bigint, bigint, bigint, bigint, boolean, string];

            let players: string[] | undefined;
            let playerData: Map<string, PlayerData> | undefined;

            if (includePlayers) {
                try {
                    players = await readContract(wagmiConfig, {
                        address: REKT_ADDRESS,
                        abi: RektABI,
                        functionName: 'getPlayers',
                        args: [marketIdBigInt],
                    }) as string[];

                    if (players.length > 0) {
                        playerData = await fetchPlayerData(players);
                    }
                } catch (err) {
                    console.warn('Failed to fetch players:', err);
                    players = [];
                }
            }

            // Use blockTimestamp for startTime if original is 0
            const startTime = marketResult[0] === BigInt(0) && blockTimestamp
                ? BigInt(blockTimestamp)
                : marketResult[0];

            const data = {
                startTime,
                deadline: marketResult[1],
                entranceFee: marketResult[2],
                finalPrice: marketResult[3],
                totalAmount: marketResult[4],
                settled: marketResult[5],
                name: marketResult[6],
                players,
                playerData
            };

            setMarketData(data);
            const calculatedPhase = determinePhase(startTime, data.deadline);
            setPhase(calculatedPhase);

        } catch (err: unknown) {
            const error = err instanceof Error
                ? err
                : new Error('Failed to fetch market data');
            setError(error);
            console.error('Error fetching contract data:', error);
        }
    }, [marketId, enabled, includePlayers, fetchPlayerData, blockTimestamp, determinePhase]);

    useEffect(() => {
        if (!enabled) {
            setLoading(false);
            return;
        }

        setLoading(true);
        fetchContractData().finally(() => {
            setLoading(false);
        });
    }, [fetchContractData, enabled]);

    const refreshData = useCallback(async () => {
        setLoading(true);
        await fetchContractData();
        setLoading(false);
    }, [fetchContractData]);

    const getPhaseText = useCallback((phase: MarketPhase | undefined) => {
        if (phase === undefined) return "Unknown";

        switch (phase) {
            case MarketPhase.OPEN:
                return "Open";
            case MarketPhase.LOCKED:
                return "Locked";
            case MarketPhase.SETTLEMENT:
                return marketData?.settled ? "Settled" : "Settlement Pending";
            default:
                return "Unknown";
        }
    }, [marketData?.settled]);

    return {
        marketData,
        phase,
        marketState,
        loading,
        error,
        refreshData,
        getPhaseText
    };
};