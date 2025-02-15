import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Wallet, Hexagon } from "lucide-react";
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useCreateMarket } from '@/hooks/web3/rect/useCreateMarket';
import { useQuery } from '@tanstack/react-query';
import request from 'graphql-request';
import { REKT_SUBGRAPH_URL } from '@/constants/subgraph-url';
import { queryMarketCreateds } from '@/graphql/rekt/rekt.query';
import { MarketCreatedsData } from '@/types/web3/rekt/create-market';

const CreateMarketForm = () => {
  const [mounted, setMounted] = useState(false);
  const { isConnected } = useAccount();
  const [formData, setFormData] = useState({
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

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const startTimestamp = Math.floor(new Date(formData.startTime).getTime() / 1000);
    const deadlineTimestamp = Math.floor(new Date(formData.deadline).getTime() / 1000);
    const participationFeeWei = BigInt(Math.floor(parseFloat(formData.participationFee) * 1e18));
    
    try {
      await handleCreateMarket(
        startTimestamp,
        deadlineTimestamp,
        participationFeeWei,
        formData.name
      );
    } catch (error) {
      console.error('Error creating market:', error);
      alert('Failed to create market. Please try again.');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-6">
        <Card className="w-full max-w-xl mx-auto bg-gradient-to-br from-gray-900 to-gray-800 border-none">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-white">Create New Market</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-6">
      <Card className="w-full max-w-xl mx-auto bg-gradient-to-br from-gray-900 to-gray-800 shadow-xl border-none">
        <CardHeader className="relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-bl-full"></div>
          <div className="relative z-10">
            <CardTitle className="text-2xl font-bold text-white">Create New Market</CardTitle>
            <p className="text-sm text-gray-400 mt-2">Create a new prediction market and set its parameters</p>
          </div>
        </CardHeader>
        <CardContent>
          {!isConnected ? (
            <div className="flex flex-col items-center justify-center space-y-4 py-8">
              <Wallet className="h-12 w-12 text-purple-400/50" />
              <p className="text-center text-purple-300">
                Please connect your wallet to create a new market
              </p>
              <ConnectButton />
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-purple-300">Market Name</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter market name"
                  className="w-full bg-gray-800/50 border-purple-500/20 text-purple-300 placeholder:text-purple-300/50 focus:border-purple-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="startTime" className="text-purple-300">Start Time</Label>
                <Input
                  id="startTime"
                  name="startTime"
                  type="datetime-local"
                  required
                  value={formData.startTime}
                  onChange={handleChange}
                  className="w-full bg-gray-800/50 border-purple-500/20 text-purple-300 focus:border-purple-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="deadline" className="text-purple-300">Deadline</Label>
                <Input
                  id="deadline"
                  name="deadline"
                  type="datetime-local"
                  required
                  value={formData.deadline}
                  onChange={handleChange}
                  className="w-full bg-gray-800/50 border-purple-500/20 text-purple-300 focus:border-purple-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="participationFee" className="text-purple-300">Participation Fee (ETH)</Label>
                <span className="text-xs text-purple-300/70">Enter amount in ETH (e.g., 0.1 for 0.1 ETH)</span>
                <Input
                  id="participationFee"
                  name="participationFee"
                  type="number"
                  step="0.000000000000000001"
                  required
                  value={formData.participationFee}
                  onChange={handleChange}
                  placeholder="Enter participation fee in ETH"
                  className="w-full bg-gray-800/50 border-purple-500/20 text-purple-300 placeholder:text-purple-300/50 focus:border-purple-500"
                />
              </div>

              <Button 
                type="submit" 
                className="w-full bg-purple-600 text-white hover:bg-purple-700 transition-colors duration-300" 
                disabled={isPending || isConfirming}
              >
                {isPending || isConfirming ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isPending ? 'Confirming Transaction...' : 'Creating Market...'}
                  </>
                ) : (
                  <>
                    <Hexagon className="w-4 h-4 mr-2" />
                    Create Market
                  </>
                )}
              </Button>
            </form>
          )}

          {isAlertOpen && isConfirmed && (
            <Alert className="mt-4 bg-purple-500/10 border-purple-500/20">
              <AlertDescription className="text-purple-300">
                Market created successfully! You can now view it in the markets list.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateMarketForm;