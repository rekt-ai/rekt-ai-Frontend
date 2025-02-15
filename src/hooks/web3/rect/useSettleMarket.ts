import { useState } from 'react';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { toast } from 'sonner';
import { REKT_ADDRESS } from '@/constants/contract-address';
import RektABI from '@/abis/rekt/RektABI';

export const useSettleMarket = () => {
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

    const handleSettle = async (marketId: number, finalPrice: number) => {
        try {
            if (!marketId || finalPrice < 0) {
                throw new Error('Invalid settlement parameters');
            }

            await writeContract({
                address: REKT_ADDRESS,
                abi: RektABI,
                functionName: 'settleMarket',
                args: [BigInt(marketId), BigInt(finalPrice)],
            });

            toast.success('Market settled successfully');
            setIsAlertOpen(true);
        } catch (error) {
            console.error('Settlement error:', error);
            const errorMessage = error instanceof Error
                ? error.message
                : 'Failed to settle market';
            toast.error(errorMessage);
            throw error; // Re-throw for the caller to handle if needed
        }
    };

    const resetState = () => {
        setIsAlertOpen(false);
    };

    return {
        isAlertOpen,
        setIsAlertOpen,
        hash,
        isPending,
        isConfirming,
        isConfirmed,
        handleSettle,
        resetState
    };
};