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
            await writeContract({
                address: REKT_ADDRESS,
                abi: RektABI,
                functionName: 'settleMarket',
                args: [marketId, BigInt(finalPrice)],
            });

            toast.success('Market settled successfully');
            setIsAlertOpen(true);
        } catch (error) {
            console.error('Transaction error:', error);
            toast.error(error instanceof Error ? error.message : 'Failed to settle market');
        }
    };

    return {
        isAlertOpen,
        setIsAlertOpen,
        hash,
        isPending,
        isConfirming,
        isConfirmed,
        handleSettle
    };
};