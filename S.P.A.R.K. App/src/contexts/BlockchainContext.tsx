import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { blockchainService, PaymentRequest, TransactionResult } from '@/services/blockchainService';
import { useWeb3 } from './Web3Context';

interface BlockchainContextType {
  // Connection state
  isConnected: boolean;
  isLoading: boolean;
  
  // Payment functions
  sendKaiaPayment: (payment: PaymentRequest) => Promise<TransactionResult>;
  sendUSDTPayment: (payment: PaymentRequest) => Promise<TransactionResult>;
  claimDealWithPayment: (dealId: string, businessAddress: string, amount: string, currency: 'KAIA' | 'USDT') => Promise<TransactionResult>;
  claimCoupon: (campaignId: number) => Promise<TransactionResult>;
  
  // Transaction functions
  getTransactionStatus: (txHash: string) => Promise<{ status: 'pending' | 'confirmed' | 'failed'; blockNumber?: number; gasUsed?: string }>;
  getTokenBalances: (userAddress: string) => Promise<{ kaia: string; usdt: string }>;
  
  // Utility functions
  estimateGas: (to: string, value: string, data?: string) => Promise<string>;
  getGasPrice: () => Promise<string>;
  isValidAddress: (address: string) => boolean;
  formatAddress: (address: string) => string;
  getNetworkInfo: () => Promise<{ chainId: number; chainName: string; blockNumber: number }>;
  
  // Transaction management
  addTransaction: (transaction: {
    txHash: string;
    type: 'payment' | 'claim' | 'reward' | 'investment';
    amount: string;
    currency: string;
    status: 'pending' | 'confirmed' | 'failed';
    businessName?: string;
    dealTitle?: string;
  }) => void;
  
  // State
  recentTransactions: Array<{
    txHash: string;
    type: 'payment' | 'claim' | 'reward' | 'investment';
    amount: string;
    currency: string;
    status: 'pending' | 'confirmed' | 'failed';
    timestamp: number;
    businessName?: string;
    dealTitle?: string;
  }>;
}

const BlockchainContext = createContext<BlockchainContextType | undefined>(undefined);

export const useBlockchain = () => {
  const context = useContext(BlockchainContext);
  if (context === undefined) {
    throw new Error('useBlockchain must be used within a BlockchainProvider');
  }
  return context;
};

interface BlockchainProviderProps {
  children: ReactNode;
}

export const BlockchainProvider: React.FC<BlockchainProviderProps> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [recentTransactions, setRecentTransactions] = useState<Array<{
    txHash: string;
    type: 'payment' | 'claim' | 'reward' | 'investment';
    amount: string;
    currency: string;
    status: 'pending' | 'confirmed' | 'failed';
    timestamp: number;
    businessName?: string;
    dealTitle?: string;
  }>>([]);

  const { account, isConnected: web3Connected } = useWeb3();

  // Initialize blockchain service when wallet connects
  useEffect(() => {
    const initializeBlockchain = async () => {
      if (web3Connected && account) {
        setIsLoading(true);
        try {
          await blockchainService.initialize();
          setIsConnected(true);
        } catch (error) {
          console.error('Failed to initialize blockchain service:', error);
          setIsConnected(false);
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsConnected(false);
      }
    };

    initializeBlockchain();
  }, [web3Connected, account]);

  // Load recent transactions from localStorage
  useEffect(() => {
    const savedTransactions = localStorage.getItem('spark_recent_transactions');
    if (savedTransactions) {
      try {
        setRecentTransactions(JSON.parse(savedTransactions));
      } catch (error) {
        console.error('Failed to load recent transactions:', error);
      }
    }
  }, []);

  // Save transactions to localStorage
  const saveTransactions = (transactions: typeof recentTransactions) => {
    setRecentTransactions(transactions);
    localStorage.setItem('spark_recent_transactions', JSON.stringify(transactions));
  };

  // Add transaction to recent list
  const addTransaction = (transaction: {
    txHash: string;
    type: 'payment' | 'claim' | 'reward' | 'investment';
    amount: string;
    currency: string;
    status: 'pending' | 'confirmed' | 'failed';
    businessName?: string;
    dealTitle?: string;
  }) => {
    const newTransaction = {
      ...transaction,
      timestamp: Date.now(),
    };
    
    const updatedTransactions = [newTransaction, ...recentTransactions.slice(0, 9)]; // Keep last 10
    saveTransactions(updatedTransactions);
  };

  // Update transaction status
  const updateTransactionStatus = (txHash: string, status: 'pending' | 'confirmed' | 'failed') => {
    const updatedTransactions = recentTransactions.map(tx =>
      tx.txHash === txHash ? { ...tx, status } : tx
    );
    saveTransactions(updatedTransactions);
  };

  // Wrapper functions with transaction tracking
  const sendKaiaPayment = async (payment: PaymentRequest): Promise<TransactionResult> => {
    setIsLoading(true);
    try {
      const result = await blockchainService.sendKaiaPayment(payment);
      
      if (result.success && result.txHash) {
        addTransaction({
          txHash: result.txHash,
          type: 'payment',
          amount: payment.amount,
          currency: payment.currency,
          status: 'pending',
        });
      }
      
      return result;
    } finally {
      setIsLoading(false);
    }
  };

  const claimCoupon = async (campaignId: number): Promise<TransactionResult> => {
    setIsLoading(true);
    try {
      const result = await blockchainService.claimCoupon(campaignId);
      
      if (result.success && result.txHash) {
        addTransaction({
          txHash: result.txHash,
          type: 'claim',
          amount: '0', // Claiming doesn't involve payment amount
          currency: 'KAIA',
          status: 'pending',
        });
      }
      
      return result;
    } finally {
      setIsLoading(false);
    }
  };

  const sendUSDTPayment = async (payment: PaymentRequest): Promise<TransactionResult> => {
    setIsLoading(true);
    try {
      const result = await blockchainService.sendUSDTPayment(payment);
      
      if (result.success && result.txHash) {
        addTransaction({
          txHash: result.txHash,
          type: 'payment',
          amount: payment.amount,
          currency: payment.currency,
          status: 'pending',
        });
      }
      
      return result;
    } finally {
      setIsLoading(false);
    }
  };

  const claimDealWithPayment = async (
    dealId: string,
    businessAddress: string,
    amount: string,
    currency: 'KAIA' | 'USDT'
  ): Promise<TransactionResult> => {
    setIsLoading(true);
    try {
      const result = await blockchainService.claimDealWithPayment(dealId, businessAddress, amount, currency);
      
      if (result.success && result.txHash) {
        addTransaction({
          txHash: result.txHash,
          type: 'claim',
          amount,
          currency,
          status: 'pending',
        });
      }
      
      return result;
    } finally {
      setIsLoading(false);
    }
  };

  const getTransactionStatus = async (txHash: string) => {
    const status = await blockchainService.getTransactionStatus(txHash);
    updateTransactionStatus(txHash, status.status);
    return status;
  };

  const getTokenBalances = async (userAddress: string) => {
    return await blockchainService.getTokenBalances(userAddress);
  };

  const estimateGas = async (to: string, value: string, data?: string) => {
    return await blockchainService.estimateGas(to, value, data);
  };

  const getGasPrice = async () => {
    return await blockchainService.getGasPrice();
  };

  const isValidAddress = (address: string) => {
    return blockchainService.isValidAddress(address);
  };

  const formatAddress = (address: string) => {
    return blockchainService.formatAddress(address);
  };

  const getNetworkInfo = async () => {
    return await blockchainService.getNetworkInfo();
  };

  const value: BlockchainContextType = {
    isConnected,
    isLoading,
    sendKaiaPayment,
    sendUSDTPayment,
    claimDealWithPayment,
    claimCoupon,
    getTransactionStatus,
    getTokenBalances,
    estimateGas,
    getGasPrice,
    isValidAddress,
    formatAddress,
    getNetworkInfo,
    addTransaction,
    recentTransactions,
  };

  return (
    <BlockchainContext.Provider value={value}>
      {children}
    </BlockchainContext.Provider>
  );
};

