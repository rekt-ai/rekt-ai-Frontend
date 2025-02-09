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

export interface MarketData {
    startTime: bigint;
    deadline: bigint;
    entranceFee: bigint;
    finalPrice: bigint;
    totalAmount: bigint;
    settled: boolean;
    name: string;
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
}

export const useMarketData = (
    marketId: number,
    options: MarketDataOptions = {}
) => {
    const { enabled = true } = options;

    const [marketData, setMarketData] = useState<MarketData | undefined>(undefined);
    const [phase, setPhase] = useState<MarketPhase | undefined>(undefined);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    // Compute derived market state
    const marketState: MarketState | undefined = phase !== undefined && marketData ? {
        phase,
        isSettled: marketData.settled,
        canParticipate: phase === MarketPhase.OPEN && !marketData.settled,
        canSettle: phase === MarketPhase.SETTLEMENT && !marketData.settled,
        isActive: phase === MarketPhase.OPEN && !marketData.settled
    } : undefined;

    const fetchContractData = useCallback(async () => {
        if (!enabled) return;

        try {
            const [marketResult, phaseResult] = await Promise.all([
                readContract(wagmiConfig, {
                    address: REKT_ADDRESS,
                    abi: RektABI,
                    functionName: 'markets',
                    args: [marketId],
                }) as Promise<[bigint, bigint, bigint, bigint, bigint, boolean, string]>,
                
                readContract(wagmiConfig, {
                    address: REKT_ADDRESS,
                    abi: RektABI,
                    functionName: 'getMarketPhase',
                    args: [marketId],
                }) as Promise<number>
            ]);

            setMarketData({
                startTime: marketResult[0],
                deadline: marketResult[1],
                entranceFee: marketResult[2],
                finalPrice: marketResult[3],
                totalAmount: marketResult[4],
                settled: marketResult[5],
                name: marketResult[6]
            });
            setPhase(phaseResult as MarketPhase);

        } catch (err: unknown) {
            const error = err instanceof Error
                ? err
                : new Error('Failed to fetch market data');
            setError(error);
            console.error('Error fetching contract data:', error);
        }
    }, [marketId, enabled]);

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

    // Helper functions for phase checks
    const getPhaseText = useCallback((phase: MarketPhase | undefined) => {
        if (phase === undefined) return "Unknown";
        
        switch(phase) {
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