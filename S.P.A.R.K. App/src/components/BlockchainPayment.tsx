import React, { useState } from 'react';
import { useBlockchain } from '@/contexts/BlockchainContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle, XCircle, ExternalLink, Coins, DollarSign } from 'lucide-react';

interface BlockchainPaymentProps {
  dealId: string;
  businessAddress: string;
  dealTitle: string;
  amount: string;
  onSuccess?: (txHash: string) => void;
  onError?: (error: string) => void;
}

export const BlockchainPayment: React.FC<BlockchainPaymentProps> = ({
  dealId,
  businessAddress,
  dealTitle,
  amount,
  onSuccess,
  onError,
}) => {
  const {
    sendKaiaPayment,
    sendUSDTPayment,
    claimDealWithPayment,
    getTransactionStatus,
    getTokenBalances,
    estimateGas,
    getGasPrice,
    isValidAddress,
    formatAddress,
    isConnected,
    isLoading,
    recentTransactions,
  } = useBlockchain();

  const [selectedCurrency, setSelectedCurrency] = useState<'KAIA' | 'USDT'>('KAIA');
  const [paymentAmount, setPaymentAmount] = useState(amount);
  const [gasEstimate, setGasEstimate] = useState<string>('');
  const [gasPrice, setGasPrice] = useState<string>('');
  const [userBalances, setUserBalances] = useState<{ kaia: string; usdt: string }>({ kaia: '0', usdt: '0' });
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [txHash, setTxHash] = useState<string>('');
  const [error, setError] = useState<string>('');

  // Load user balances and gas info
  React.useEffect(() => {
    const loadPaymentInfo = async () => {
      if (isConnected) {
        try {
          // Get user balances (you'll need to pass user address)
          // const balances = await getTokenBalances(userAddress);
          // setUserBalances(balances);

          // Get gas estimate
          const gasEst = await estimateGas(businessAddress, paymentAmount);
          setGasEstimate(gasEst);

          // Get gas price
          const gasPriceValue = await getGasPrice();
          setGasPrice(gasPriceValue);
        } catch (error) {
          console.error('Failed to load payment info:', error);
        }
      }
    };

    loadPaymentInfo();
  }, [isConnected, businessAddress, paymentAmount, estimateGas, getGasPrice]);

  const handlePayment = async () => {
    if (!isConnected) {
      setError('Please connect your wallet first');
      return;
    }

    if (!isValidAddress(businessAddress)) {
      setError('Invalid business address');
      return;
    }

    setPaymentStatus('processing');
    setError('');

    try {
      const result = await claimDealWithPayment(
        dealId,
        businessAddress,
        paymentAmount,
        selectedCurrency
      );

      if (result.success && result.txHash) {
        setTxHash(result.txHash);
        setPaymentStatus('success');
        onSuccess?.(result.txHash);

        // Poll for transaction confirmation
        const pollTransaction = async () => {
          const status = await getTransactionStatus(result.txHash!);
          if (status.status === 'confirmed') {
            console.log('Transaction confirmed!');
          } else if (status.status === 'failed') {
            setPaymentStatus('error');
            setError('Transaction failed');
            onError?.('Transaction failed');
          } else {
            // Still pending, poll again
            setTimeout(pollTransaction, 5000);
          }
        };

        setTimeout(pollTransaction, 5000);
      } else {
        setPaymentStatus('error');
        setError(result.error || 'Payment failed');
        onError?.(result.error || 'Payment failed');
      }
    } catch (error: any) {
      setPaymentStatus('error');
      setError(error.message || 'Payment failed');
      onError?.(error.message || 'Payment failed');
    }
  };

  const formatBalance = (balance: string) => {
    return parseFloat(balance).toFixed(4);
  };

  const formatGasPrice = (price: string) => {
    const gwei = parseFloat(price) / 1e9;
    return `${gwei.toFixed(2)} Gwei`;
  };

  if (!isConnected) {
    return (
      <Card className="bg-gray-800/50 border-gray-700">
        <CardContent className="p-6 text-center">
          <Coins className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-300">Please connect your wallet to make payments</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gray-800/50 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center space-x-2">
          <Coins className="w-5 h-5" />
          <span>Blockchain Payment</span>
        </CardTitle>
        <CardDescription className="text-gray-300">
          Pay for "{dealTitle}" using blockchain
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Payment Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label className="text-white">Amount</Label>
            <Input
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
              className="bg-gray-700/50 border-gray-600 text-white"
              placeholder="0.0"
            />
          </div>
          <div>
            <Label className="text-white">Currency</Label>
            <Select value={selectedCurrency} onValueChange={(value: 'KAIA' | 'USDT') => setSelectedCurrency(value)}>
              <SelectTrigger className="bg-gray-700/50 border-gray-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-600">
                <SelectItem value="KAIA">
                  <div className="flex items-center space-x-2">
                    <Coins className="w-4 h-4" />
                    <span>KAIA</span>
                  </div>
                </SelectItem>
                <SelectItem value="USDT">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="w-4 h-4" />
                    <span>USDT</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Business Address */}
        <div>
          <Label className="text-white">Business Address</Label>
          <div className="flex items-center space-x-2 p-3 bg-gray-700/30 rounded-lg">
            <code className="text-sm text-gray-300 flex-1">{formatAddress(businessAddress)}</code>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.open(`https://kairos.kaiaexplorer.io/address/${businessAddress}`, '_blank')}
              className="text-blue-400 hover:text-blue-300"
            >
              <ExternalLink className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Gas Information */}
        {gasEstimate && gasPrice && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3 bg-gray-700/30 rounded-lg">
            <div>
              <Label className="text-gray-400 text-sm">Gas Estimate</Label>
              <p className="text-white font-mono">{gasEstimate}</p>
            </div>
            <div>
              <Label className="text-gray-400 text-sm">Gas Price</Label>
              <p className="text-white font-mono">{formatGasPrice(gasPrice)}</p>
            </div>
          </div>
        )}

        {/* User Balances */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3 bg-gray-700/30 rounded-lg">
          <div>
            <Label className="text-gray-400 text-sm">KAIA Balance</Label>
            <p className="text-white font-mono">{formatBalance(userBalances.kaia)}</p>
          </div>
          <div>
            <Label className="text-gray-400 text-sm">USDT Balance</Label>
            <p className="text-white font-mono">{formatBalance(userBalances.usdt)}</p>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <Alert className="bg-red-500/10 border-red-500/30">
            <XCircle className="w-4 h-4 text-red-400" />
            <AlertDescription className="text-red-400">{error}</AlertDescription>
          </Alert>
        )}

        {/* Success Display */}
        {paymentStatus === 'success' && txHash && (
          <Alert className="bg-green-500/10 border-green-500/30">
            <CheckCircle className="w-4 h-4 text-green-400" />
            <AlertDescription className="text-green-400">
              Payment successful! Transaction: {formatAddress(txHash)}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.open(`https://kairos.kaiaexplorer.io/tx/${txHash}`, '_blank')}
                className="ml-2 text-green-400 hover:text-green-300"
              >
                <ExternalLink className="w-4 h-4" />
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Payment Button */}
        <Button
          onClick={handlePayment}
          disabled={isLoading || paymentStatus === 'processing' || !paymentAmount}
          className="w-full bg-purple-600 hover:bg-purple-700"
        >
          {paymentStatus === 'processing' ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Processing Payment...
            </>
          ) : (
            <>
              <Coins className="w-4 h-4 mr-2" />
              Pay with {selectedCurrency}
            </>
          )}
        </Button>

        {/* Recent Transactions */}
        {recentTransactions.length > 0 && (
          <div className="mt-6">
            <Label className="text-white mb-2 block">Recent Transactions</Label>
            <div className="space-y-2">
              {recentTransactions.slice(0, 3).map((tx) => (
                <div key={tx.txHash} className="flex items-center justify-between p-2 bg-gray-700/30 rounded">
                  <div className="flex items-center space-x-2">
                    <Badge variant={tx.status === 'confirmed' ? 'default' : tx.status === 'failed' ? 'destructive' : 'secondary'}>
                      {tx.status}
                    </Badge>
                    <span className="text-sm text-gray-300">{tx.type}</span>
                  </div>
                  <div className="text-sm text-gray-400">
                    {tx.amount} {tx.currency}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

