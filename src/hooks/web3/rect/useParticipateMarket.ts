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
        data: string,
        value: bigint
    ) => {
        try {
            await writeContract({
                address: REKT_ADDRESS,
                abi: RektABI,
                functionName: 'participateInMarket',
                args: [marketId, BigInt(predictionPrice), data],
                value,
            });

            toast.success('Successfully participated in market');
            setIsAlertOpen(true);
        } catch (error) {
            console.error('Transaction error:', error);
            toast.error(error instanceof Error ? error.message : 'Failed to participate in market');
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