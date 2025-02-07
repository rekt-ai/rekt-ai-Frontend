import { useState } from 'react';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { toast } from 'sonner';
import { PREDICTION_MARKET_ADDRESS } from '@/constants/contract-address';
import RektABI from '@/abis/rekt/RektABI';

export const useCreateMarket = () => {
    const [isAlertOpen, setIsAlertOpen] = useState(false);

    const {
        data: hash,
        isPending,
        writeContract
    } = useWriteContract();

    const {
        isLoading: isConfirming,
        isSuccess: isConfirmed
    } = useWaitForTransactionReceipt({
        hash,
    });

    const handleCreateMarket = async (
        marketId: number,
        startTime: number,
        deadline: number,
        participationFee: number,
        name: string
    ) => {
        try {
            await writeContract({
                address: PREDICTION_MARKET_ADDRESS,
                abi: RektABI,
                functionName: 'createMarket',
                args: [marketId, BigInt(startTime), BigInt(deadline), BigInt(participationFee), name],
            });

            toast.success('Market created successfully');
            setIsAlertOpen(true);
        } catch (error) {
            console.error('Transaction error:', error);
            toast.error(error instanceof Error ? error.message : 'Failed to create market');
        }
    };

    return {
        isAlertOpen,
        setIsAlertOpen,
        hash,
        isPending,
        isConfirming,
        isConfirmed,
        handleCreateMarket
    };
};