import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Wallet } from "lucide-react";
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useCreateMarket } from '@/hooks/web3/rect/useCreateMarket';

const CreateMarketForm = () => {
  const { isConnected } = useAccount();
  const [formData, setFormData] = useState({
    marketId: '',
    name: '',
    startTime: '',
    deadline: '',
    participationFee: ''
  });

  const {
    isAlertOpen,
    setIsAlertOpen,
    isPending,
    isConfirming,
    isConfirmed,
    handleCreateMarket
  } = useCreateMarket();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const startTimestamp = Math.floor(new Date(formData.startTime).getTime() / 1000);
    const deadlineTimestamp = Math.floor(new Date(formData.deadline).getTime() / 1000);
    
    // Convert ETH to Wei (1 ETH = 10^18 Wei)
    const participationFeeWei = BigInt(Math.floor(parseFloat(formData.participationFee) * 1e18));
    
    await handleCreateMarket(
      parseInt(formData.marketId),
      startTimestamp,
      deadlineTimestamp,
      participationFeeWei,
      formData.name
    );
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <Card className="w-full max-w-xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Create New Market</CardTitle>
      </CardHeader>
      <CardContent>
        {!isConnected ? (
          <div className="flex flex-col items-center justify-center space-y-4 py-8">
            <Wallet className="h-12 w-12 text-slate-light/50" />
            <p className="text-center text-muted-foreground">
              Please connect your wallet to create a new market
            </p>
            <ConnectButton />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="marketId">Market ID</Label>
              <Input
                id="marketId"
                name="marketId"
                type="number"
                required
                value={formData.marketId}
                onChange={handleChange}
                placeholder="Enter market ID"
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Market Name</Label>
              <Input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter market name"
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="startTime">Start Time</Label>
              <Input
                id="startTime"
                name="startTime"
                type="datetime-local"
                required
                value={formData.startTime}
                onChange={handleChange}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="deadline">Deadline</Label>
              <Input
                id="deadline"
                name="deadline"
                type="datetime-local"
                required
                value={formData.deadline}
                onChange={handleChange}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="participationFee">Participation Fee (ETH)</Label>
              <span className="text-xs text-muted-foreground">Enter amount in ETH (e.g., 0.1 for 0.1 ETH)</span>
              <Input
                id="participationFee"
                name="participationFee"
                type="number"
                step="0.000000000000000001"
                required
                value={formData.participationFee}
                onChange={handleChange}
                placeholder="Enter participation fee in ETH"
                className="w-full"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isPending || isConfirming}
            >
              {isPending || isConfirming ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isPending ? 'Confirming Transaction...' : 'Creating Market...'}
                </>
              ) : (
                'Create Market'
              )}
            </Button>
          </form>
        )}

        {isAlertOpen && isConfirmed && (
          <Alert className="mt-4">
            <AlertDescription>
              Market created successfully! You can now view it in the markets list.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default CreateMarketForm;