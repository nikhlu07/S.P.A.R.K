import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { web3Service } from '../services/web3Service';

// Extend Window interface for MetaMask
declare global {
  interface Window {
    ethereum?: any;
  }
}

interface Web3ContextType {
  // Wallet state
  isConnected: boolean;
  account: string | null;
  balance: string;
  usdtBalance: string;
  kaiaUsdValue: string;


  // Connection methods
  connectWallet: () => Promise<void>;
  disconnect: () => void;

  // Blockchain data
  businesses: any[];
  campaigns: any[];
  poolInfo: any | null;

  // Loading states
  isLoading: boolean;
  error: string | null;

  // Methods
  refreshBalances: () => Promise<void>;
  registerBusiness: (businessData: any) => Promise<string>;
  investInPool: (amount: string) => Promise<string>;
  createCampaign: (title: string, description: string, maxCoupons: number, discountPercent: number) => Promise<string>;
  
  // Trust scoring methods
  recordSocialInteraction: (to: string, interactionType: number, value: number, description: string, isPositive?: boolean) => Promise<any>;
  getTrustProfile: (userAddress: string) => Promise<any>;
  calculateTrustScore: (userAddress: string) => Promise<number>;
  registerUserForTrustScoring: (metadataURI?: string) => Promise<any>;
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined);

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
};

interface Web3ProviderProps {
  children: ReactNode;
}

export const Web3Provider: React.FC<Web3ProviderProps> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [account, setAccount] = useState<string | null>(null);
  const [balance, setBalance] = useState('0');
  const [usdtBalance, setUsdtBalance] = useState('0');
  const [kaiaUsdValue, setKaiaUsdValue] = useState('0.00');
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [poolInfo, setPoolInfo] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connectWallet = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const walletInfo = await web3Service.connectWallet();
      setAccount(walletInfo.address);
      setBalance(walletInfo.balance);
      setIsConnected(true);

      // Get USDT balance
      try {
        const usdtBal = await web3Service.getUSDTBalance();
        setUsdtBalance(usdtBal);
      } catch (err) {
        console.warn('Failed to get USDT balance:', err);
        setUsdtBalance('0');
      }

      // Get KAIA USD value
      try {
        const kaiaUsd = await web3Service.getKaiaBalanceInUSD();
        setKaiaUsdValue(kaiaUsd);
      } catch (err) {
        console.warn('Failed to get KAIA USD value:', err);
        setKaiaUsdValue('0.00');
      }

      // Load blockchain data
      await loadBlockchainData();

    } catch (err: any) {
      setError(err.message);
      console.error('Failed to connect wallet:', err);
    } finally {
      setIsLoading(false);
    }
  };


  const disconnect = () => {
    setIsConnected(false);
    setAccount(null);
    setBalance('0');
    setUsdtBalance('0');
    setKaiaUsdValue('0.00');
    setBusinesses([]);
    setCampaigns([]);
    setPoolInfo(null);
  };

  const refreshBalances = async () => {
    if (!isConnected) return;

    try {
      // Refresh KAIA balance
      const kaiaBal = await web3Service.getAccountBalance();
      setBalance(kaiaBal);

      // Refresh USDT balance
      const usdtBal = await web3Service.getUSDTBalance();
      setUsdtBalance(usdtBal);

      // Refresh KAIA USD value
      const kaiaUsd = await web3Service.getKaiaBalanceInUSD();
      setKaiaUsdValue(kaiaUsd);

    } catch (err) {
      console.warn('Failed to refresh balances:', err);
    }
  };

  const loadBlockchainData = async () => {
    try {
      // Load businesses - skip if contracts not deployed
      try {
        const businessData = await web3Service.getBusinesses();
        setBusinesses(businessData);
      } catch (err: any) {
        console.warn('Failed to load businesses (contracts may not be deployed):', err.message);
        setBusinesses([]);
      }

      // Load campaigns - skip if contracts not deployed
      try {
        const campaignData = await web3Service.getCampaigns();
        setCampaigns(campaignData);
      } catch (err: any) {
        console.warn('Failed to load campaigns (contracts may not be deployed):', err.message);
        setCampaigns([]);
      }

      // Load pool info - skip if contracts not deployed
      try {
        const poolData = await web3Service.getPoolInfo(); // Get pool information from web3Service
        setPoolInfo(poolData);
      } catch (err: any) {
        console.warn('Failed to load pool info (contracts may not be deployed):', err.message);
        setPoolInfo(null);
      }

    } catch (err: any) {
      console.error('Failed to load blockchain data:', err);
    }
  };

  // Auto-connect on page load
  useEffect(() => {
    const autoConnect = async () => {
      try {
        // Check if wallet is already connected
        if (window.ethereum && window.ethereum.selectedAddress) {
          await connectWallet();
        }
      } catch (err) {
        // Silently fail for auto-connect
        console.log('Auto-connect failed:', err);
      }
    };

    autoConnect();
  }, []);

  // Listen for account changes
  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnect();
        } else if (accounts[0] !== account) {
          connectWallet();
        }
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      };
    }
  }, [account]);

  // Refresh USD value every 30 seconds when connected
  useEffect(() => {
    if (!isConnected) return;

    const interval = setInterval(() => {
      refreshBalances();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [isConnected]);

  const registerBusiness = async (businessData: any): Promise<string> => {
    try {
      setIsLoading(true);
      const txHash = await web3Service.registerBusiness(businessData);
      // Reload businesses after registration
      await loadBlockchainData();
      return txHash as unknown as string;
    } catch (error: any) {
      setError(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const investInPool = async (amount: string): Promise<string> => {
    try {
      setIsLoading(true);
      const txHash = await web3Service.investInPool(amount);
      // Refresh balances and pool info after investment
      await refreshBalances();
      await loadBlockchainData();
      return txHash as unknown as string;
    } catch (error: any) {
      setError(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const createCampaign = async (title: string, description: string, maxCoupons: number, discountPercent: number): Promise<string> => {
    try {
      setIsLoading(true);
      const receipt: any = await web3Service.createCampaign(title, description, maxCoupons, discountPercent);
      // Reload campaigns after creation
      await loadBlockchainData();
      // Try to return a tx hash if available
      const txHash = receipt?.hash || receipt?.transactionHash || '';
      return txHash;
    } catch (error: any) {
      setError(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Trust scoring methods
  const recordSocialInteraction = async (
    to: string,
    interactionType: number,
    value: number,
    description: string,
    isPositive: boolean = true
  ): Promise<any> => {
    try {
      setIsLoading(true);
      const result = await web3Service.recordSocialInteraction(to, interactionType, value, description, isPositive);
      // Refresh businesses to get updated trust scores
      await loadBlockchainData();
      return result;
    } catch (error: any) {
      setError(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const getTrustProfile = async (userAddress: string): Promise<any> => {
    try {
      return await web3Service.getTrustProfile(userAddress);
    } catch (error: any) {
      setError(error.message);
      throw error;
    }
  };

  const calculateTrustScore = async (userAddress: string): Promise<number> => {
    try {
      return await web3Service.calculateTrustScore(userAddress);
    } catch (error: any) {
      setError(error.message);
      return 0;
    }
  };

  const registerUserForTrustScoring = async (metadataURI: string = ''): Promise<any> => {
    try {
      setIsLoading(true);
      const result = await web3Service.registerUserForTrustScoring(metadataURI);
      return result;
    } catch (error: any) {
      setError(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const value: Web3ContextType = {
    isConnected,
    account,
    balance,
    usdtBalance,
    kaiaUsdValue,
    connectWallet,
    disconnect,
    businesses,
    campaigns,
    poolInfo,
    isLoading,
    error,
    refreshBalances,
    registerBusiness,
    investInPool,
    createCampaign,
    recordSocialInteraction,
    getTrustProfile,
    calculateTrustScore,
    registerUserForTrustScoring
  };

  return (
    <Web3Context.Provider value={value}>
      {children}
    </Web3Context.Provider>
  );
};
