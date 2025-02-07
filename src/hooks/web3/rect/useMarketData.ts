import { wagmiConfig } from "@/configs/wagmi";
import { PREDICTION_MARKET_ADDRESS } from '@/constants/contract-address';
import RektABI from '@/abis/rekt/RektABI';
import { readContract } from "@wagmi/core";
import { useCallback, useEffect, useRef, useState } from "react";

interface UseMarketDataOptions {
    debounceTime?: number;
    enabled?: boolean;
}

interface MarketData {
    startTime: bigint;
    deadline: bigint;
    entranceFee: bigint;
    finalPrice: bigint;
    totalAmount: bigint;
    settled: boolean;
    name: string;
}

export const useMarketData = (
    marketId: number,
    options: UseMarketDataOptions = {}
) => {
    const { debounceTime = 1000, enabled = true } = options;

    const [marketData, setMarketData] = useState<MarketData | undefined>(undefined);
    const [phase, setPhase] = useState<number | undefined>(undefined);
    const [players, setPlayers] = useState<string[] | undefined>(undefined);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const [isStale, setIsStale] = useState(false);

    const debounceTimeRef = useRef(debounceTime);

    useEffect(() => {
        debounceTimeRef.current = debounceTime;
    }, [debounceTime]);

    const fetchData = useCallback(async () => {
        if (!enabled) {
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);
        setIsStale(false);

        try {
            const marketResult = await readContract(wagmiConfig, {
                address: PREDICTION_MARKET_ADDRESS,
                abi: RektABI,
                functionName: 'markets',
                args: [marketId],
            }) as [bigint, bigint, bigint, bigint, bigint, boolean, string];

            const phaseResult = await readContract(wagmiConfig, {
                address: PREDICTION_MARKET_ADDRESS,
                abi: RektABI,
                functionName: 'getMarketPhase',
                args: [marketId],
            }) as number;

            const playersResult = await readContract(wagmiConfig, {
                address: PREDICTION_MARKET_ADDRESS,
                abi: RektABI,
                functionName: 'getPlayers',
                args: [marketId],
            }) as string[];

            setMarketData({
                startTime: marketResult[0],
                deadline: marketResult[1],
                entranceFee: marketResult[2],
                finalPrice: marketResult[3],
                totalAmount: marketResult[4],
                settled: marketResult[5],
                name: marketResult[6]
            });
            setPhase(phaseResult);
            setPlayers(playersResult);
        } catch (err: unknown) {
            const error = err instanceof Error
                ? err
                : new Error('Failed to fetch market data');
            setError(error);
            console.error('Error fetching market data:', error);
        } finally {
            setLoading(false);
        }
    }, [marketId, enabled]);

    const refreshData = useCallback(async () => {
        await fetchData();
    }, [fetchData]);

    useEffect(() => {
        setIsStale(true);
    }, [marketId]);

    useEffect(() => {
        let intervalId: NodeJS.Timeout | null = null;

        if (enabled) {
            fetchData();
            intervalId = setInterval(() => {
                refreshData();
            }, 5000);
        }

        return () => {
            if (intervalId) {
                clearInterval(intervalId);
            }
        };
    }, [fetchData, refreshData, enabled]);

    return {
        marketData,
        phase,
        players,
        loading,
        error,
        refreshData,
        isStale
    };
};