import { useState } from 'react';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { toast } from 'sonner';
import { REKT_ADDRESS } from '@/constants/contract-address';
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
    startTime: number,
    deadline: number,
    participationFee: bigint,
    name: string
  ) => {
    try {
      await writeContract({
        address: REKT_ADDRESS,
        abi: RektABI,
        functionName: 'createMarket',
        args: [BigInt(startTime), BigInt(deadline), participationFee, name],
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