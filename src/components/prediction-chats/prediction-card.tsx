import React, { useEffect, useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatEther } from "viem";
import { DateTime } from "luxon";
import { useAccount } from 'wagmi';

interface ChatMessage {
  id: string;
  chatData: {
    marketId: number;
    predictionPrice: string;
    timestamp: number;
  };
  userAddress: string;
  timestamp: string;
  createdAt: string;
}

interface PredictionChatProps {
  marketId: number;
}

const MESSAGES_PER_PAGE = 20;

export function PredictionChat({ marketId }: { marketId: number }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [offset, setOffset] = useState(0);
  const { address } = useAccount();

  const fetchChats = async () => {
    try {
      const response = await fetch(`/api/chats?limit=${MESSAGES_PER_PAGE}&offset=${offset}`);
      if (!response.ok) {
        throw new Error('Failed to fetch chats');
      }
      const data = await response.json();
      
      // Filter messages for current market and ensure chatData is properly parsed
      const marketMessages = data.chats
        .map((chat: any) => ({
          ...chat,
          chatData: typeof chat.chatData === 'string' ? JSON.parse(chat.chatData) : chat.chatData
        }))
        .filter((chat: ChatMessage) => chat.chatData?.marketId === marketId);
      
      setMessages(prev => [...prev, ...marketMessages]);
      return data.pagination.total;
    } catch (error) {
      console.error('Error fetching chats:', error);
    }
  };

  // Fetch messages initially and set up refresh interval
  useEffect(() => {
    const loadInitialChats = async () => {
      setLoading(true);
      await fetchChats();
      setLoading(false);
    };

    loadInitialChats();

    // Refresh chat data every 30 seconds
    const interval = setInterval(fetchChats, 30000);
    return () => clearInterval(interval);
  }, [marketId]);

  if (loading) {
    return (
      <Card className="lg:mx-[10vw] mt-6 bg-gradient-to-br from-gray-900 to-gray-800 border-none">
        <CardContent className="p-4">
          <div className="flex justify-center py-4">
            <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-purple-500" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="lg:mx-[10vw] mt-6 bg-gradient-to-br from-gray-900 to-gray-800 border-none">
      <CardContent className="p-4">
        <h3 className="text-lg font-semibold text-white mb-4">Predictions</h3>
        <ScrollArea className="h-[400px] pr-4">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 py-4">
              No predictions yet. Be the first to predict!
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`p-4 rounded-lg ${
                    message.userAddress.toLowerCase() === address?.toLowerCase()
                      ? 'bg-purple-500/10 border border-purple-500/20'
                      : 'bg-gray-800/50 border border-gray-700'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-sm font-mono text-purple-300">
                      {message.userAddress.slice(0, 6)}...{message.userAddress.slice(-4)}
                    </span>
                    <span className="text-xs text-gray-500">
                      {DateTime.fromISO(message.createdAt).toRelative()}
                    </span>
                  </div>
                  <p className="text-white">
                    Predicted: {message.chatData?.predictionPrice && (
                      <span className="font-mono text-purple-300">
                        ${Number(message.chatData.predictionPrice).toFixed(2)} USD
                      </span>
                    )}
                  </p>
                </div>
              ))}
            </div>
          )}
          {messages.length >= MESSAGES_PER_PAGE && (
            <button
              onClick={() => setOffset(prev => prev + MESSAGES_PER_PAGE)}
              className="w-full mt-4 py-2 text-purple-300 hover:text-purple-200 text-sm"
            >
              Load More
            </button>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}