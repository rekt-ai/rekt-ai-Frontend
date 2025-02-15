import { useState } from 'react';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { toast } from 'sonner';
import { REKT_ADDRESS } from '@/constants/contract-address';
import RektABI from '@/abis/rekt/RektABI';

export const useParticipateMarket = () => {
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

    const handleParticipate = async (
        marketId: number,
        predictionPrice: number,
        data: `0x${string}`, // bytes32 type
        value: bigint
    ) => {
        try {
            if (!marketId || predictionPrice < 0) {
                throw new Error('Invalid market parameters');
            }

            await writeContract({
                address: REKT_ADDRESS,
                abi: RektABI,
                functionName: 'participateInMarket',
                args: [BigInt(marketId), BigInt(predictionPrice), data],
                value,
            });

            toast.success('Successfully participated in market');
            setIsAlertOpen(true);
        } catch (error) {
            console.error('Transaction error:', error);
            const errorMessage = error instanceof Error
                ? error.message
                : 'Failed to participate in market';
            toast.error(errorMessage);
            throw error; // Re-throw for the caller to handle if needed
        }
    };

    return {
        isAlertOpen,
        setIsAlertOpen,
        hash,
        isPending,
        isConfirming,
        isConfirmed,
        handleParticipate
    };
};