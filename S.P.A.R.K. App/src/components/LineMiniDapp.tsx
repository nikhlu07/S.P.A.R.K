import React, { useState, useEffect } from 'react';
import { useLine } from '@/contexts/LineContext';
import { useWeb3 } from '@/contexts/Web3Context';
import { blockchainService } from '@/services/blockchainService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  MessageCircle, 
  Share2, 
  Users, 
  Gift, 
  Zap, 
  ArrowRight,
  Wallet,
  TrendingUp
} from 'lucide-react';

interface LineMiniDappProps {
  onTransactionComplete?: (txHash: string) => void;
  onInviteSent?: (invitedCount: number) => void;
}

export const LineMiniDapp: React.FC<LineMiniDappProps> = ({
  onTransactionComplete,
  onInviteSent
}) => {
  const { 
    isLineMiniApp, 
    lineUser, 
    shareDeal, 
    shareBusiness, 
    sharePaymentSuccess, 
    inviteFriends 
  } = useLine();
  
  const { account, balance, isConnected } = useWeb3();
  const [inviteCode, setInviteCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);

  // Mock function to simulate DeFi transaction through LINE
  const handleLinePayment = async (amount: string, recipient: string) => {
    setIsLoading(true);
    try {
      // If wallet is connected, try sending a real KAIA payment. Otherwise, simulate.
      let txHash = '';
      if (isConnected && account) {
        const result = await blockchainService.sendKaiaPayment({
          to: recipient,
          amount,
          currency: 'KAIA'
        });
        if (!result.success) {
          throw new Error(result.error || 'Payment failed');
        }
        txHash = result.txHash || '';
      } else {
        // Simulated tx hash fallback for demo when wallet is not connected
        txHash = '0x' + Math.random().toString(16).slice(2).padEnd(64, '0');
      }

      // Share payment success to LINE
      await sharePaymentSuccess({
        amount,
        businessName: 'Demo Business',
        tokensEarned: (parseFloat(amount) * 0.1).toFixed(2)
      });

      onTransactionComplete?.(txHash);
      
      setRecentTransactions(prev => [
        {
          hash: txHash,
          amount,
          recipient,
          timestamp: new Date().toISOString(),
          status: 'completed'
        },
        ...prev.slice(0, 4)
      ]);

    } catch (error) {
      console.error('Payment failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInviteFriends = async () => {
    setIsLoading(true);
    try {
      const success = await inviteFriends();
      if (success && onInviteSent) {
        onInviteSent(1); // Increment invite count
      }
    } catch (error) {
      console.error('Invite failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isLineMiniApp) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-6 w-6" />
            LINE Mini-Dapp
          </CardTitle>
          <CardDescription>
            Access enhanced features through LINE messenger
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">
              Open this app in LINE messenger to access exclusive features
            </p>
            <Button onClick={() => window.open('https://line.me/R/nv/QRCodeReader', '_blank')}>
              Scan QR Code in LINE
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* LINE User Profile */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-6 w-6" />
            LINE Mini-Dapp Connected
          </CardTitle>
          <CardDescription>
            Welcome, {lineUser?.displayName}! Enjoy exclusive features.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            {lineUser?.pictureUrl && (
              <img
                src={lineUser.pictureUrl}
                alt={lineUser.displayName}
                className="w-12 h-12 rounded-full"
              />
            )}
            <div>
              <p className="font-semibold">{lineUser?.displayName}</p>
              <p className="text-sm text-gray-500">LINE User ID: {lineUser?.userId}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <Button 
            variant="outline" 
            onClick={handleInviteFriends}
            disabled={isLoading}
          >
            <Users className="h-4 w-4 mr-2" />
            Invite Friends
          </Button>
          
          <Button 
            variant="outline"
            onClick={() => shareDeal({
              id: 'demo-deal',
              title: '50% Off Coffee',
              description: 'Get half price on all coffee items',
              discount: '50%',
              business: { name: 'Coffee Shop' }
            })}
          >
            <Share2 className="h-4 w-4 mr-2" />
            Share Deal
          </Button>
        </CardContent>
      </Card>

      {/* DeFi Integration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            DeFi Transactions
          </CardTitle>
          <CardDescription>
            Send payments directly through LINE
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="amount">Amount (USDT)</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="10.00"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="recipient">Recipient</Label>
                <Input
                  id="recipient"
                  placeholder="0x..."
                  className="mt-1"
                />
              </div>
            </div>
            
            <Button 
              onClick={() => handleLinePayment('10.00', '0x742d35Cc6634C0532925a3b844Bc454e4438f44e')}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? 'Processing...' : 'Send Payment via LINE'}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>

            {account && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Your Balance:</span>
                <span className="font-medium">{balance} USDT</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      {recentTransactions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Recent Transactions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recentTransactions.map((tx, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{tx.amount} USDT</p>
                    <p className="text-sm text-gray-500">
                      to {tx.recipient.slice(0, 8)}...{tx.recipient.slice(-6)}
                    </p>
                  </div>
                  <Badge variant="outline" className="bg-green-50 text-green-700">
                    Completed
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Rewards & Benefits */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5" />
            LINE Exclusive Benefits
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-full">
                <Zap className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="font-medium">+10% Rewards</p>
                <p className="text-sm text-gray-500">Extra tokens on every transaction</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-full">
                <Wallet className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="font-medium">Zero Fees</p>
                <p className="text-sm text-gray-500">No transaction fees for LINE users</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-full">
                <Share2 className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <p className="font-medium">Social Sharing</p>
                <p className="text-sm text-gray-500">Share deals with friends easily</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};