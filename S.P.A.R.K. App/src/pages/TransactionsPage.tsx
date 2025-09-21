import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useWeb3 } from '@/contexts/Web3Context';
import { useSupabase } from '@/contexts/SupabaseContext';
import { useBlockchain } from '@/contexts/BlockchainContext';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  ExternalLink, 
  RefreshCw,
  Coins,
  DollarSign,
  TrendingUp
} from 'lucide-react';

interface Transaction {
  id: string;
  txHash: string;
  type: 'payment' | 'claim' | 'reward' | 'investment';
  amount: string;
  currency: string;
  status: 'pending' | 'confirmed' | 'failed';
  timestamp: number;
  businessName?: string;
  dealTitle?: string;
  blockNumber?: number;
  gasUsed?: string;
}

const TransactionsPage: React.FC = () => {
  const { isConnected, account } = useWeb3();
  const { recentTransactions } = useBlockchain();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'failed'>('all');

  // Load transactions from blockchain context and format them
  useEffect(() => {
    if (isConnected && recentTransactions.length > 0) {
      const formattedTransactions = recentTransactions.map((tx, index) => ({
        id: tx.txHash || `tx-${index}`,
        txHash: tx.txHash,
        type: tx.type,
        amount: tx.amount,
        currency: tx.currency,
        status: tx.status,
        timestamp: tx.timestamp,
        businessName: 'Blockchain Transaction',
        dealTitle: `${tx.type} transaction`
      }));
      setTransactions(formattedTransactions);
    }
  }, [isConnected, recentTransactions]);

  const filteredTransactions = transactions.filter(tx => 
    filter === 'all' || tx.status === filter
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      confirmed: 'default',
      pending: 'secondary',
      failed: 'destructive'
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>
        {status.toUpperCase()}
      </Badge>
    );
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'payment':
        return <DollarSign className="w-4 h-4 text-blue-500" />;
      case 'claim':
        return <Coins className="w-4 h-4 text-purple-500" />;
      case 'investment':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      default:
        return <Coins className="w-4 h-4 text-gray-500" />;
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const openInExplorer = (txHash: string) => {
    const explorerUrl = `https://kairos.kaiaexplorer.io/tx/${txHash}`;
    window.open(explorerUrl, '_blank');
  };

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <div className="bg-gray-900/50 rounded-lg p-8 max-w-md">
          <h2 className="text-2xl font-bold text-white mb-4">Connect Your Wallet</h2>
          <p className="text-gray-400 mb-6">
            Connect your wallet to view your transaction history and interact with the SPARK network.
          </p>
          <Button className="w-full">
            Connect Wallet
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Transaction History</h1>
          <p className="text-gray-400 mt-2">
            View all your blockchain transactions and payment history
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsLoading(true)}
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {(['all', 'pending', 'confirmed', 'failed'] as const).map((filterType) => (
          <Button
            key={filterType}
            variant={filter === filterType ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(filterType)}
            className="capitalize"
          >
            {filterType}
          </Button>
        ))}
      </div>

      {/* Transactions List */}
      {filteredTransactions.length === 0 ? (
        <Card className="bg-gray-900/50 border-gray-800">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-gray-400 text-center">
              <Coins className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No Transactions Yet</h3>
              <p className="text-sm">
                {filter === 'all' 
                  ? "You haven't made any transactions yet. Start by exploring deals or making payments."
                  : `No ${filter} transactions found.`
                }
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredTransactions.map((transaction) => (
            <Card key={transaction.id} className="bg-gray-900/50 border-gray-800 hover:border-purple-500/30 transition-colors">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      {getTypeIcon(transaction.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-white capitalize">
                          {transaction.type} Transaction
                        </h3>
                        {getStatusIcon(transaction.status)}
                        {getStatusBadge(transaction.status)}
                      </div>
                      
                      <div className="space-y-1 text-sm text-gray-400">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Amount:</span>
                          <span className="text-white font-mono">
                            {transaction.amount} {transaction.currency}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Transaction:</span>
                          <span className="font-mono text-xs">
                            {formatAddress(transaction.txHash)}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openInExplorer(transaction.txHash)}
                            className="h-6 w-6 p-0"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </Button>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Time:</span>
                          <span>
                            {new Date(transaction.timestamp).toLocaleString()}
                          </span>
                        </div>
                        
                        {transaction.businessName && (
                          <div className="flex items-center gap-2">
                            <span className="font-medium">Business:</span>
                            <span>{transaction.businessName}</span>
                          </div>
                        )}
                        
                        {transaction.blockNumber && (
                          <div className="flex items-center gap-2">
                            <span className="font-medium">Block:</span>
                            <span className="font-mono">#{transaction.blockNumber}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-lg font-bold text-white">
                      {transaction.amount} {transaction.currency}
                    </div>
                    <div className="text-xs text-gray-500">
                      {transaction.type.toUpperCase()}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default TransactionsPage;
